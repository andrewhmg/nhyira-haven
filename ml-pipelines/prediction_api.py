"""
ML Prediction API for Lighthouse Sanctuary.

Serves predictions from all four trained ML pipelines via Flask REST endpoints.
Can be called from the .NET backend or used directly.

Endpoints:
  POST /api/ml/donor-tier         - Predict donor value tier (High/Medium/Low)
  POST /api/ml/churn-risk         - Predict donor churn probability
  POST /api/ml/reintegration      - Predict successful exit probability
  POST /api/ml/early-warning      - Predict bad exit probability
  GET  /api/ml/health             - Health check
"""

from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')


def load_model(name):
    path = os.path.join(MODEL_DIR, name)
    if os.path.exists(path):
        return joblib.load(path)
    return None


# Lazy-load models on first request
_models = {}

def get_models():
    if not _models:
        _models['donor_tier_rf'] = load_model('key_donor_rf_model.joblib')
        _models['donor_tier_le'] = load_model('key_donor_label_encoder.joblib')
        _models['donor_tier_features'] = load_model('key_donor_features.joblib')
        _models['churn_gb'] = load_model('donor_churn_gb_model.joblib')
        _models['churn_features'] = load_model('donor_churn_features.joblib')
        _models['exit_rf'] = load_model('successful_exit_rf_model.joblib')
        _models['exit_features'] = load_model('successful_exit_features.joblib')
        _models['bad_exit_gb'] = load_model('bad_exit_gb_model.joblib')
        _models['bad_exit_features'] = load_model('bad_exit_features.joblib')
    return _models


@app.route('/api/ml/health', methods=['GET'])
def health():
    models = get_models()
    loaded = {k: v is not None for k, v in models.items()}
    return jsonify({'status': 'ok', 'models_loaded': loaded})


@app.route('/api/ml/donor-tier', methods=['POST'])
def predict_donor_tier():
    """
    Predict donor value tier.
    Input JSON: { "features": { "recency_days": 30, "frequency": 12, ... } }
    """
    try:
        models = get_models()
        data = request.get_json()
        features = models['donor_tier_features']
        X = np.array([[data['features'].get(f, 0) for f in features]])

        rf = models['donor_tier_rf']
        le = models['donor_tier_le']
        pred = rf.predict(X)[0]
        proba = rf.predict_proba(X)[0]
        tier = le.inverse_transform([pred])[0]

        importances = dict(zip(features, rf.feature_importances_))
        top_factors = sorted(importances.items(), key=lambda x: -x[1])[:5]

        return jsonify({
            'tier': tier,
            'probabilities': {le.inverse_transform([i])[0]: float(p) for i, p in enumerate(proba)},
            'top_factors': [{'feature': f, 'importance': float(v)} for f, v in top_factors]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ml/churn-risk', methods=['POST'])
def predict_churn():
    """
    Predict donor churn risk.
    Input JSON: { "features": { "recency_days": 30, "frequency": 12, ... } }
    """
    try:
        models = get_models()
        data = request.get_json()
        features = models['churn_features']
        X = np.array([[data['features'].get(f, 0) for f in features]])

        gb = models['churn_gb']
        proba = gb.predict_proba(X)[0][1]

        if proba > 0.7:
            risk_tier = 'High'
        elif proba > 0.3:
            risk_tier = 'Medium'
        else:
            risk_tier = 'Low'

        importances = dict(zip(features, gb.feature_importances_))
        top_factors = sorted(importances.items(), key=lambda x: -x[1])[:5]

        return jsonify({
            'churn_probability': float(proba),
            'risk_tier': risk_tier,
            'top_factors': [{'feature': f, 'importance': float(v)} for f, v in top_factors]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ml/reintegration', methods=['POST'])
def predict_reintegration():
    """
    Predict successful exit probability.
    Input JSON: { "features": { "risk_improvement": 1, "pct_favorable": 0.8, ... } }
    """
    try:
        models = get_models()
        data = request.get_json()
        features = models['exit_features']
        X = np.array([[data['features'].get(f, 0) for f in features]])

        rf = models['exit_rf']
        proba = rf.predict_proba(X)[0][1]

        if proba > 0.7:
            readiness = 'Ready'
        elif proba > 0.4:
            readiness = 'Progressing'
        else:
            readiness = 'Not Ready'

        importances = dict(zip(features, rf.feature_importances_))
        top_factors = sorted(importances.items(), key=lambda x: -x[1])[:5]

        return jsonify({
            'success_probability': float(proba),
            'readiness': readiness,
            'top_factors': [{'feature': f, 'importance': float(v)} for f, v in top_factors]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ml/early-warning', methods=['POST'])
def predict_bad_exit():
    """
    Predict bad exit probability.
    Input JSON: { "features": { "initial_risk": 2, "early_incident_count": 3, ... } }
    """
    try:
        models = get_models()
        data = request.get_json()
        features = models['bad_exit_features']
        X = np.array([[data['features'].get(f, 0) for f in features]])

        gb = models['bad_exit_gb']
        proba = gb.predict_proba(X)[0][1]

        if proba > 0.7:
            risk = 'Red'
        elif proba > 0.3:
            risk = 'Yellow'
        else:
            risk = 'Green'

        importances = dict(zip(features, gb.feature_importances_))
        top_factors = sorted(importances.items(), key=lambda x: -x[1])[:5]

        return jsonify({
            'bad_exit_probability': float(proba),
            'risk_level': risk,
            'top_factors': [{'feature': f, 'importance': float(v)} for f, v in top_factors]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    print("Loading models...")
    get_models()
    print("Starting ML Prediction API on port 5050...")
    app.run(host='0.0.0.0', port=5050, debug=False)
