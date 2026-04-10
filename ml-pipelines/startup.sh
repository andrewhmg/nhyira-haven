#!/bin/bash
echo "Installing dependencies..."
pip install -r requirements.txt
echo "Starting API..."
gunicorn --bind=0.0.0.0:8000 --workers=2 --timeout=120 prediction_api:app
