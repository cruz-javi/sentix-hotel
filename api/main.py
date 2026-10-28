"""
Aplicación Principal FastAPI para Sentix-Hotel.

Responsable: Javier (Capa 4 - Backend)
Expone la API REST que consume el pipeline y modelo serializados (.joblib).
No reimplementa preprocesamiento a mano; delega en el artefacto exportado.
"""

import json
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import joblib

from src.config import (
    SERIALIZED_PIPELINE_PATH,
    METRICS_REPORT_PATH,
    API_TITLE,
    API_VERSION,
    API_DESCRIPTION,
    DEFAULT_DECISION_THRESHOLD,
)
from api.schemas import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    BatchPredictionItem,
    NlpStepsRequest,
    NlpStepsResponse,
    HealthResponse,
)

# Estado global de la aplicación (artefactos cargados en memoria)
app_state: Dict[str, Any] = {
    "pipeline": None,
    "metrics_report": None,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Carga los artefactos serializados al arrancar la aplicación."""
    if SERIALIZED_PIPELINE_PATH.exists():
        app_state["pipeline"] = joblib.load(SERIALIZED_PIPELINE_PATH)
        print(f"[API Startup] Pipeline cargado desde: {SERIALIZED_PIPELINE_PATH}")
    else:
        print(f"[API Startup] AVISO: No se encontró {SERIALIZED_PIPELINE_PATH}")

    if METRICS_REPORT_PATH.exists():
        with open(METRICS_REPORT_PATH, "r", encoding="utf-8") as f:
            app_state["metrics_report"] = json.load(f)
        print(f"[API Startup] Reporte de métricas cargado desde: {METRICS_REPORT_PATH}")

    yield

    app_state.clear()


app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    lifespan=lifespan,
)

# Configuración de CORS para permitir consumo desde Frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["Monitoreo"])
async def health_check():
    """Verifica la disponibilidad del servicio y el estado del modelo cargado."""
    return HealthResponse(
        status="healthy",
        service=API_TITLE,
        model_loaded=app_state["pipeline"] is not None,
        version=API_VERSION,
    )


@app.post("/api/predict", response_model=PredictionResponse, tags=["Inferencia"])
async def predict_sentiment(request: PredictionRequest):
    """
    Clasifica el sentimiento de una reseña hotelera en español.

    Retorna la clase (Positivo/Negativo) y las probabilidades estimadas por el modelo.
    """
    pipeline = app_state.get("pipeline")
    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El modelo de machine learning no está cargado. Ejecute el script de entrenamiento primero.",
        )

    try:
        # Predecir probabilidades con el pipeline serializado
        # [0] probabilidad de Negativo (clase 0), [1] probabilidad de Positivo (clase 1)
        probabilities = pipeline.predict_proba([request.text])[0]
        prob_neg = float(probabilities[0])
        prob_pos = float(probabilities[1])

        # Asignación de clase según umbral
        predicted_class = 1 if prob_pos >= DEFAULT_DECISION_THRESHOLD else 0
        sentiment_label = "Positivo" if predicted_class == 1 else "Negativo"
        confidence = prob_pos if predicted_class == 1 else prob_neg

        return PredictionResponse(
            sentiment_label=sentiment_label,
            sentiment_class=predicted_class,
            confidence=round(confidence, 4),
            probability_positive=round(prob_pos, 4),
            probability_negative=round(prob_neg, 4),
            model_version=API_VERSION,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante la inferencia: {str(exc)}",
        )


@app.post("/api/predict-batch", response_model=BatchPredictionResponse, tags=["Inferencia"])
async def predict_batch(request: BatchPredictionRequest):
    """
    Clasifica un conjunto de reseñas en lote (útil para procesamiento masivo de CSVs).
    """
    pipeline = app_state.get("pipeline")
    if pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El modelo de machine learning no está cargado.",
        )

    try:
        valid_texts = [text.strip() for text in request.texts if text.strip()]
        if not valid_texts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ninguno de los textos proporcionados contiene caracteres válidos.",
            )

        probabilities = pipeline.predict_proba(valid_texts)
        results = []
        positive_count = 0

        for idx, (text_item, probs) in enumerate(zip(valid_texts, probabilities)):
            prob_neg = float(probs[0])
            prob_pos = float(probs[1])
            is_pos = prob_pos >= DEFAULT_DECISION_THRESHOLD
            if is_pos:
                positive_count += 1

            results.append(
                BatchPredictionItem(
                    index=idx + 1,
                    text=text_item[:150] + ("..." if len(text_item) > 150 else ""),
                    sentiment_label="Positivo" if is_pos else "Negativo",
                    sentiment_class=1 if is_pos else 0,
                    confidence=round(prob_pos if is_pos else prob_neg, 4),
                    probability_positive=round(prob_pos, 4),
                    probability_negative=round(prob_neg, 4),
                )
            )

        total = len(results)
        negative_count = total - positive_count

        return BatchPredictionResponse(
            total_reviews=total,
            positive_count=positive_count,
            negative_count=negative_count,
            positive_ratio=round(positive_count / total, 4) if total > 0 else 0.0,
            negative_ratio=round(negative_count / total, 4) if total > 0 else 0.0,
            results=results,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error durante la inferencia por lote: {str(exc)}",
        )


@app.post("/api/nlp-steps", response_model=NlpStepsResponse, tags=["Explicabilidad"])
async def explain_nlp_steps(request: NlpStepsRequest):
    """
    Desglosa el texto paso a paso en cada fase del pipeline de NLP.

    Alimenta la vista interactiva requerida por el docente en el frontend.
    """
    pipeline = app_state.get("pipeline")
    if pipeline is None or "preprocessor" not in pipeline.named_steps:
        # Si no hay pipeline cargado, instanciamos preprocesador directamente
        from src.nlp.pipeline import TextPreprocessor
        preprocessor = TextPreprocessor()
    else:
        preprocessor = pipeline.named_steps["preprocessor"]

    breakdown = preprocessor.get_step_by_step_breakdown(request.text)
    return NlpStepsResponse(**breakdown)


@app.get("/api/metrics", tags=["Métricas"])
async def get_metrics():
    """
    Retorna el reporte de métricas y matriz de confusión del modelo en producción.
    """
    report = app_state.get("metrics_report")
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró el reporte de métricas. Ejecute el entrenamiento para generarlo.",
        )
    return report


# Servir Frontend interactivo como archivos estáticos en la raíz
frontend_dist_dir = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist_dir.exists():
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=str(frontend_dist_dir), html=True), name="frontend")

