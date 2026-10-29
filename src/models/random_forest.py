"""
Módulo de Ensamble Random Forest Classifier.
Entrena el modelo de ensamble no lineal con árboles de decisión y validación cruzada.
"""

from typing import Dict, Any, Tuple, List
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV

from src.nlp.pipeline import TextPreprocessor
from src.nlp.vectorizer import create_tfidf_vectorizer
from src.config import (
    RANDOM_FOREST_DEFAULT_PARAMS,
    RANDOM_FOREST_GRID,
    RANDOM_STATE,
)


def build_random_forest_pipeline(
    preprocessor: TextPreprocessor = None,
    params: Dict[str, Any] = None,
) -> Pipeline:
    """
    Construye el pipeline: Preprocesador -> Vectorizador TF-IDF -> Random Forest.
    """
    if preprocessor is None:
        preprocessor = TextPreprocessor()

    model_params = params or RANDOM_FOREST_DEFAULT_PARAMS

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("vectorizer", create_tfidf_vectorizer()),
        ("classifier", RandomForestClassifier(**model_params)),
    ])
    return pipeline


def train_random_forest_cv(
    X_train,
    y_train,
    param_grid: Dict[str, List[Any]] = None,
    cv_folds: int = 5,
) -> Tuple[Pipeline, Dict[str, Any]]:
    """
    Entrena el pipeline de Random Forest aplicando GridSearchCV con validación cruzada.

    Args:
        X_train: Colección de reseñas crudas de entrenamiento.
        y_train: Etiquetas de sentimiento (0 o 1).
        param_grid: Malla de parámetros a optimizar.
        cv_folds: Número de pliegues estratificados.

    Returns:
        Tupla con el mejor Pipeline ajustado y los mejores parámetros.
    """
    base_pipeline = build_random_forest_pipeline()
    grid = param_grid or RANDOM_FOREST_GRID

    grid_search = GridSearchCV(
        estimator=base_pipeline,
        param_grid=grid,
        cv=cv_folds,
        scoring="f1_macro",
        n_jobs=-1,
        verbose=1,
    )
    grid_search.fit(X_train, y_train)

    return grid_search.best_estimator_, {
        "best_params": grid_search.best_params_,
        "best_cv_score": float(grid_search.best_score_),
    }
