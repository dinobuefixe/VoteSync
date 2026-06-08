FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install --upgrade pip && pip install .

COPY backend backend
COPY FrontEnd FrontEnd

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
