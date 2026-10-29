"""
Esquemas Pydantic para validación y serialización de datos de la API REST.
Garantiza validación estricta de entradas y contratos tipados para el frontend.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator
from src.config import MIN_WORD_COUNT, MAX_TEXT_LENGTH


class PredictionRequest(BaseModel):
    """Esquema de solicitud de inferencia para una reseña individual."""

    text: str = Field(
        ...,
        description="Texto de la reseña en español a clasificar",
        min_length=1,
        max_length=MAX_TEXT_LENGTH,
        examples=["El hotel superó todas nuestras expectativas, las habitaciones amplias y el desayuno excelente."],
    )

    @field_validator("text")
    @classmethod
    def validate_meaningful_content(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("La reseña no puede estar vacía o contener solo espacios en blanco.")

        words = stripped.split()
        if len(words) < MIN_WORD_COUNT:
            raise ValueError(
                f"La reseña es demasiado corta ({len(words)} palabras). Ingrese al menos {MIN_WORD_COUNT} palabras."
            )

        return stripped


class PredictionResponse(BaseModel):
    """Esquema de respuesta de inferencia de sentimiento."""

    sentiment_label: str = Field(..., description="Etiqueta clasificada: 'Positivo' o 'Negativo'")
    sentiment_class: int = Field(..., description="Clase binaria: 1 (Positivo) o 0 (Negativo)")
    confidence: float = Field(..., description="Probabilidad o confianza del modelo (0.0 a 1.0)")
    probability_positive: float = Field(..., description="Probabilidad calculada para la clase positiva")
    probability_negative: float = Field(..., description="Probabilidad calculada para la clase negativa")
    model_version: str = Field(default="1.0.0", description="Versión del modelo en producción")


class NlpStepsRequest(BaseModel):
    """Esquema de solicitud para desglose paso a paso del pipeline de NLP."""

    text: str = Field(
        ...,
        description="Texto crudo a descomponer en sus etapas de procesamiento",
        min_length=1,
        max_length=MAX_TEXT_LENGTH,
    )


class NlpStepsResponse(BaseModel):
    """Esquema de respuesta con cada fase del preprocesamiento."""

    original_text: str
    normalized_text: str
    tokens: List[str]
    tokens_no_stopwords: List[str]
    stemmed_tokens: List[str]
    lemmatized_tokens: List[str]
    active_morphology: str
    final_processed_text: str


class BatchPredictionRequest(BaseModel):
    """Esquema para clasificar múltiples reseñas simultáneamente (por lote o CSV)."""

    texts: List[str] = Field(
        ...,
        description="Lista de textos de reseñas a clasificar",
        min_length=1,
        max_length=500,
    )


class BatchPredictionItem(BaseModel):
    """Resultado individual dentro de una predicción por lote."""

    index: int
    text: str
    sentiment_label: str
    sentiment_class: int
    confidence: float
    probability_positive: float
    probability_negative: float


class BatchPredictionResponse(BaseModel):
    """Resumen y detalles de la clasificación por lote."""

    total_reviews: int
    positive_count: int
    negative_count: int
    positive_ratio: float
    negative_ratio: float
    results: List[BatchPredictionItem]


class HealthResponse(BaseModel):
    """Esquema de respuesta de salud del servicio."""

    status: str
    service: str
    model_loaded: bool
    version: str
