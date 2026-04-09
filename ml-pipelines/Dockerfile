FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir \
    numpy \
    scikit-learn \
    joblib \
    flask \
    flask-cors \
    gunicorn

COPY prediction_api.py .
COPY models/ ./models/

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120", "prediction_api:app"]
