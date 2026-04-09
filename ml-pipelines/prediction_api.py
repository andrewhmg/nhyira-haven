"""
ML Prediction API for Lighthouse Sanctuary.

Serves predictions from all trained ML pipelines via Flask REST endpoints.
Can be called from the .NET backend or used directly.

Endpoints:
  POST /api/ml/donor-tier         - Predict donor value tier (High/Medium/Low)
  POST /api/ml/churn-risk         - Predict donor churn probability
  POST /api/ml/reintegration      - Predict successful exit probability
  POST /api/ml/early-warning      - Predict bad exit probability
  POST /api/ml/post-conversion    - Predict social media post donation conversion
  POST /api/ml/allocation-roi     - Predict allocation ROI for program areas
  GET  /api/ml/health             - Health check
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

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
        # Social media conversion models
        _models['social_gb'] = load_model('social_conversion_gb_model.joblib')
        _models['social_features'] = load_model('social_conversion_features.joblib')
        _models['social_scaler'] = load_model('social_conversion_scaler.joblib')
        _models['social_value_rf'] = load_model('social_conversion_value_model.joblib')
        # Allocation ROI models
        _models['roi_edu'] = load_model('allocation_roi_edu_model.joblib')
        _models['roi_health'] = load_model('allocation_roi_health_model.joblib')
        _models['roi_incident'] = load_model('allocation_roi_incident_model.joblib')
        _models['roi_features'] = load_model('allocation_roi_features.joblib')
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


@app.route('/api/ml/post-conversion', methods=['POST'])
def predict_post_conversion():
    """
    Predict social media post donation conversion probability.
    Input JSON: { "features": { "platform_Instagram": 1, "post_type_FundraisingAppeal": 1, "likes": 50, ... } }
    """
    try:
        models = get_models()
        data = request.get_json()
        raw = data.get('features', {})
        feature_names = models['social_features']

        # Build feature vector — use provided values or 0 for missing one-hot cols
        X_raw = np.array([[raw.get(f, 0) for f in feature_names]])

        # Scale numeric features (scaler was fit on the same feature order)
        scaler = models['social_scaler']
        X = scaler.transform(X_raw)

        gb = models['social_gb']
        proba = gb.predict_proba(X)[0][1]
        prediction = 'Likely to Convert' if proba >= 0.5 else 'Unlikely to Convert'

        # Estimate donation value for posts predicted to convert
        value_rf = models['social_value_rf']
        estimated_value = float(value_rf.predict(X)[0]) if proba >= 0.5 else 0.0

        importances = dict(zip(feature_names, gb.feature_importances_))
        top_factors = sorted(importances.items(), key=lambda x: -x[1])[:5]

        return jsonify({
            'conversion_probability': float(proba),
            'prediction': prediction,
            'estimated_donation_value_php': max(0.0, estimated_value),
            'top_factors': [{'feature': f, 'importance': float(v)} for f, v in top_factors],
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ml/allocation-roi', methods=['POST'])
def predict_allocation_roi():
    """
    Predict outcome improvement for a given program allocation target.
    Input JSON: { "features": { "total_funding": 10000, "resident_count": 20, ... }, "target": "education" }
    Target options: "education", "health", "incidents"
    """
    try:
        models = get_models()
        data = request.get_json()
        raw = data.get('features', {})
        target = data.get('target', 'education')

        feat_meta = models['roi_features']
        feature_cols = feat_meta['feature_cols']

        total_funding = raw.get('total_funding', 10000)
        resident_count = raw.get('resident_count', 20)
        staff_count = raw.get('staff_count', 5)

        # Distribute total funding across categories based on target
        allocation_splits = {
            'education': {'education': 0.50, 'wellbeing': 0.15, 'operations': 0.15,
                          'maintenance': 0.10, 'outreach': 0.05, 'transport': 0.05},
            'health':    {'wellbeing': 0.50, 'education': 0.15, 'operations': 0.15,
                          'maintenance': 0.10, 'outreach': 0.05, 'transport': 0.05},
            'incidents': {'operations': 0.40, 'wellbeing': 0.25, 'education': 0.15,
                          'maintenance': 0.10, 'outreach': 0.05, 'transport': 0.05},
        }
        splits = allocation_splits.get(target, allocation_splits['education'])
        funding = {k: total_funding * v for k, v in splits.items()}

        feature_map = {
            'funding_education': funding.get('education', 0),
            'funding_maintenance': funding.get('maintenance', 0),
            'funding_operations': funding.get('operations', 0),
            'funding_outreach': funding.get('outreach', 0),
            'funding_transport': funding.get('transport', 0),
            'funding_wellbeing': funding.get('wellbeing', 0),
            'funding_total': total_funding,
            'funding_diversity': len([v for v in funding.values() if v > 0]),
            'funding_education_pct': splits.get('education', 0),
            'funding_maintenance_pct': splits.get('maintenance', 0),
            'funding_operations_pct': splits.get('operations', 0),
            'funding_outreach_pct': splits.get('outreach', 0),
            'funding_transport_pct': splits.get('transport', 0),
            'funding_wellbeing_pct': splits.get('wellbeing', 0),
            'active_residents': resident_count,
            'capacity_girls': max(resident_count, 25),
            'occupancy_rate': resident_count / max(resident_count, 25),
            'region_encoded': 0,
            'pct_recurring': 0.3,
            'n_donations': max(1, resident_count // 2),
            'process_recording_count': max(1, resident_count * 2),
            'home_visitation_count': max(1, resident_count),
        }

        X = np.array([[feature_map.get(f, 0) for f in feature_cols]])

        target_model_map = {
            'education': ('roi_edu', 'education'),
            'health': ('roi_health', 'health'),
            'incidents': ('roi_incident', 'incidents'),
        }
        model_key, metric_name = target_model_map.get(target, ('roi_edu', target))
        model = models[model_key]
        predicted = float(model.predict(X)[0])

        importances = dict(zip(feature_cols, model.feature_importances_))
        top_factors = sorted(importances.items(), key=lambda x: -x[1])[:5]

        return jsonify({
            'predicted_outcome': predicted,
            'target_metric': metric_name,
            'top_factors': [{'feature': f, 'importance': float(v)} for f, v in top_factors],
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    print("Loading models...")
    get_models()
    print("Starting ML Prediction API on port 5050...")
    app.run(host='0.0.0.0', port=5050, debug=False)
