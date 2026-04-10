FROM node:20-slim AS frontend-build

WORKDIR /frontend

COPY docuagent-frontend/package*.json ./

RUN npm ci

COPY docuagent-frontend/ ./

RUN npm run build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY docuagent-backend/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY docuagent-backend/app ./app
COPY --from=frontend-build /frontend/dist ./docuagent-frontend/dist

EXPOSE 8003

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]
