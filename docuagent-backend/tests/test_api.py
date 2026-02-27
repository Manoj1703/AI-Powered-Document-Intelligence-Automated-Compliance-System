from unittest.mock import patch
import os
import unittest

from bson import ObjectId
from fastapi.testclient import TestClient

# Keep app imports stable in tests without requiring real services.
os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017")
os.environ.setdefault("SHOW_TRACEBACK", "false")

from app.main import app


class InsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class UploadCollection:
    def insert_one(self, document):
        return InsertResult(ObjectId("65f1f1f1f1f1f1f1f1f1f1f1"))


class DocumentsCollection:
    def __init__(self, docs=None, single=None):
        self.docs = docs or []
        self.single = single

    def find(self, _query, _projection):
        return self.docs

    def find_one(self, _query):
        return self.single


class DashboardCollection:
    def count_documents(self, query):
        if query == {}:
            return 7
        level = query["$or"][0]["overall_risk_level"]
        return {"High": 2, "Medium": 3, "Low": 2}[level]


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_healthcheck(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok", "service": "DocuAgent Backend"})

    @patch("app.routes.upload.get_collection", return_value=UploadCollection())
    @patch("app.routes.upload.extract_text_by_extension", return_value="sample legal text")
    @patch(
        "app.routes.upload.analyze_document",
        return_value={
            "title": "Service Agreement",
            "document_type": "Contract",
            "author": "Acme",
            "date": "2026-01-01",
            "summary": "Short summary",
            "detailed_summary": "Detailed summary",
            "key_clauses": ["Termination"],
            "obligations": ["Deliver report"],
            "risks": [],
            "risk_types": ["Operational"],
            "compliance_issues": [],
            "metadata": {"document_type": "Contract", "key_topics": ["SLA"]},
            "overall_risk_level": "Low",
        },
    )
    def test_upload_success(self, _analyze_mock, _extract_mock, _collection_mock):
        response = self.client.post(
            "/api/upload",
            files={"file": ("agreement.txt", b"hello world", "text/plain")},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["message"], "Document processed successfully")
        self.assertEqual(payload["title"], "Service Agreement")
        self.assertEqual(payload["overall_risk_level"], "Low")

    def test_upload_rejects_unsupported_extension(self):
        response = self.client.post(
            "/api/upload",
            files={"file": ("payload.exe", b"binary", "application/octet-stream")},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported file type", response.json()["detail"])

    @patch(
        "app.routes.documents.get_collection",
        return_value=DocumentsCollection(
            docs=[
                {
                    "_id": ObjectId("65f1f1f1f1f1f1f1f1f1f1f1"),
                    "filename": "nda.pdf",
                    "analysis": {
                        "title": "NDA",
                        "document_type": "Agreement",
                        "overall_risk_level": "Medium",
                    },
                }
            ]
        ),
    )
    def test_get_all_documents(self, _collection_mock):
        response = self.client.get("/api/documents")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload[0]["title"], "NDA")
        self.assertEqual(payload[0]["overall_risk_level"], "Medium")

    @patch("app.routes.documents.get_collection", return_value=DocumentsCollection(single=None))
    def test_get_document_by_id_not_found(self, _collection_mock):
        response = self.client.get("/api/documents/65f1f1f1f1f1f1f1f1f1f1f1")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"], "Document not found")

    def test_get_document_by_id_invalid_id(self):
        response = self.client.get("/api/documents/not-an-object-id")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Invalid document ID")

    @patch("app.routes.dashboard.get_collection", return_value=DashboardCollection())
    def test_dashboard_stats(self, _collection_mock):
        response = self.client.get("/api/dashboard/stats")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "total_documents": 7,
                "risk_breakdown": {"high": 2, "medium": 3, "low": 2},
            },
        )


if __name__ == "__main__":
    unittest.main()
