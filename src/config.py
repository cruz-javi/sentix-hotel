"""
Configuración global centralizada para el proyecto Sentix-Hotel.

Centraliza hiperparámetros, rutas, constantes de NLP y umbrales para garantizar
la reproducibilidad de experimentos y permitir modificaciones rápidas en vivo
durante la defensa individual del proyecto.
"""

from pathlib import Path
from typing import Dict, List, Tuple, Any

# Rutas del Sistema
SRC_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SRC_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
DATA_RAW_DIR = DATA_DIR / "raw"
DATA_PROCESSED_DIR = DATA_DIR / "processed"
MODELS_DIR = PROJECT_ROOT / "models"
DOCS_DIR = PROJECT_ROOT / "docs"

# Semilla Pseudoaleatoria Global
RANDOM_STATE: int = 42

# Configuración del Dataset
RAW_DATASET_FILENAME: str = "hotel_reviews_es.csv"
RAW_DATASET_PATH = DATA_RAW_DIR / RAW_DATASET_FILENAME
TEST_SIZE: float = 0.20

# Configuración del Pipeline de NLP
# Palabras de negación que NUNCA deben removerse porque invierten la polaridad
NEGATION_WORDS: List[str] = [
    "no",
    "nunca",
    "jamas",
    "jamás",
    "tampoco",
    "sin",
    "nada",
    "nadie",
    "ninguno",
    "ninguna",
    "ningunos",
    "ningunas",
]

# Stopwords personalizadas del dominio hotelero que pueden modificarse en vivo
CUSTOM_STOPWORDS: List[str] = [
    "hotel",
    "habitacion",
    "habitaciones",
    "hotelero",
    "noche",
    "noches",
    "dia",
    "dias",
    "estancia",
]

# Parámetros Morfológicos
USE_LEMMATIZATION: bool = True  # True para Lematización (spaCy), False para Stemming (NLTK)
SPACY_MODEL_NAME: str = "es_core_news_sm"

# Parámetros de Vectorización TF-IDF
NGRAM_RANGE: Tuple[int, int] = (1, 2)  # (1, 1) para unigramas, (1, 2) para unigramas + bigramas
MAX_FEATURES: int = 5000
MIN_DF: int = 2
MAX_DF: float = 0.95
SUBLINEAR_TF: bool = True

# Configuración de Modelos de Machine Learning
# Regresión Logística (Modelo Lineal Interpretable)
LOGISTIC_REGRESSION_DEFAULT_PARAMS: Dict[str, Any] = {
    "C": 1.0,
    "max_iter": 1000,
    "solver": "lbfgs",
    "random_state": RANDOM_STATE,
}

LOGISTIC_REGRESSION_GRID: Dict[str, List[Any]] = {
    "classifier__C": [0.01, 0.1, 1.0, 5.0, 10.0],
}

# Random Forest Classifier (Modelo de Ensamble No Lineal)
RANDOM_FOREST_DEFAULT_PARAMS: Dict[str, Any] = {
    "n_estimators": 100,
    "max_depth": 25,
    "min_samples_split": 5,
    "random_state": RANDOM_STATE,
    "n_jobs": -1,
}

RANDOM_FOREST_GRID: Dict[str, List[Any]] = {
    "classifier__n_estimators": [50, 100, 200],
    "classifier__max_depth": [15, 25, None],
}

# Nombre del artefacto exportado para producción
SERIALIZED_PIPELINE_PATH = MODELS_DIR / "sentix_pipeline.joblib"
METRICS_REPORT_PATH = MODELS_DIR / "metrics_report.json"

# Configuración de la API REST (FastAPI)
API_TITLE: str = "Sentix-Hotel Sentiment API"
API_VERSION: str = "1.0.0"
API_DESCRIPTION: str = "API REST para análisis de sentimiento en reseñas de hospedaje en español"
MIN_WORD_COUNT: int = 3
MAX_TEXT_LENGTH: int = 5000
DEFAULT_DECISION_THRESHOLD: float = 0.50
