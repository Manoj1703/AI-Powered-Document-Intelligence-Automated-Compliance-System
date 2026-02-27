import os
# This file sets up the connection to MongoDB and provides a helper function to access the collection.
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection
#read environment varibels
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise Exception("MONGO_URI is not configured.")

client = MongoClient(MONGO_URI)
db = client["DocuAgent"]
collection = db["Results"]


def get_collection() -> Collection:
    return collection
