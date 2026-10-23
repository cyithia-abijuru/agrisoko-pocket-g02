FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ARG BUILD_COMMIT=unknown
ENV BUILD_COMMIT=$BUILD_COMMIT
CMD ["sh", "-c", "python build_index.py && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
