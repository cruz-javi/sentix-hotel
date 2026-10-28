"""
Pruebas Automatizadas de los Endpoints de la API REST FastAPI.
"""

import pytest
from fastapi.testclient import TestClient
from api.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


def test_predict_validation_empty_or_short(client):
    # Texto vacío
    resp_empty = client.post("/api/predict", json={"text": "   "})
    assert resp_empty.status_code == 422

    # Menos de 3 palabras
    resp_short = client.post("/api/predict", json={"text": "hola"})
    assert resp_short.status_code == 422


def test_predict_sentiment_positive_and_negative(client):
    # Reseña Positiva
    pos_text = "El hotel fue una maravilla total, la comida deliciosa y las camas muy cómodas."
    resp_pos = client.post("/api/predict", json={"text": pos_text})
    assert resp_pos.status_code == 200
    pos_data = resp_pos.json()
    assert pos_data["sentiment_label"] == "Positivo"
    assert pos_data["sentiment_class"] == 1
    assert pos_data["probability_positive"] > 0.5

    # Reseña Negativa
    neg_text = "Pésima experiencia, la habitación estaba sucia y olía a humedad, no volvería jamás."
    resp_neg = client.post("/api/predict", json={"text": neg_text})
    assert resp_neg.status_code == 200
    neg_data = resp_neg.json()
    assert neg_data["sentiment_label"] == "Negativo"
    assert neg_data["sentiment_class"] == 0
    assert neg_data["probability_negative"] > 0.5


def test_nlp_steps_endpoint(client):
    sample = "El hotel estaba increíble pero el wifi no funcionaba."
    resp = client.post("/api/nlp-steps", json={"text": sample})
    assert resp.status_code == 200
    data = resp.json()
    assert "normalized_text" in data
    assert "tokens" in data
    assert "tokens_no_stopwords" in data
    assert "no" in data["tokens_no_stopwords"]


def test_metrics_endpoint(client):
    response = client.get("/api/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "accuracy" in data["metrics"]
    assert "confusion_matrix" in data
