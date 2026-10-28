"""
Módulo de Regresión Logística y Ajuste de Hiperparámetros.

Responsable: Javier (Capa 3A - ML)
Implementa el entrenamiento del modelo lineal probabilístico, búsqueda en grilla
con validación cruzada y extracción de coeficientes explicables.
"""

from typing import Dict, Any, Tuple, List
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV

from src.nlp.pipeline import TextPreprocessor
from src.nlp.vectorizer import create_tfidf_vectorizer
from src.config import (
    LOGISTIC_REGRESSION_DEFAULT_PARAMS,
    LOGISTIC_REGRESSION_GRID,
    RANDOM_STATE,
)


def build_logistic_regression_pipeline(
    preprocessor: TextPreprocessor = None,
    params: Dict[str, Any] = None,
) -> Pipeline:
    """
    Construye el pipeline desacoplado: Preprocesador -> Vectorizador TF-IDF -> Regresión Logística.
    """
    if preprocessor is None:
        preprocessor = TextPreprocessor()

    model_params = params or LOGISTIC_REGRESSION_DEFAULT_PARAMS

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("vectorizer", create_tfidf_vectorizer()),
        ("classifier", LogisticRegression(**model_params)),
    ])
    return pipeline


def train_logistic_regression_cv(
    X_train,
    y_train,
    param_grid: Dict[str, List[Any]] = None,
    cv_folds: int = 5,
) -> Tuple[Pipeline, Dict[str, Any]]:
    """
    Entrena el pipeline de Regresión Logística aplicando GridSearchCV con validación cruzada.

    Args:
        X_train: Colección de reseñas crudas de entrenamiento.
        y_train: Etiquetas de sentimiento (0 o 1).
        param_grid: Malla de parámetros a optimizar.
        cv_folds: Número de pliegues estratificados.

    Returns:
        Tupla con el mejor Pipeline ajustado y el diccionario de mejores hiperparámetros.
    """
    base_pipeline = build_logistic_regression_pipeline()
    grid = param_grid or LOGISTIC_REGRESSION_GRID

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


def extract_top_coefficients(
    pipeline: Pipeline, top_n: int = 15
) -> Dict[str, List[Tuple[str, float]]]:
    """
    Extrae las palabras con mayores coeficientes positivos y negativos para interpretabilidad.

    Args:
        pipeline: Pipeline ajustado que contenga vectorizer y classifier.
        top_n: Cantidad de términos a retornar por extremo.

    Returns:
        Diccionario con listas de tuplas (palabra, coeficiente).
    """
    classifier = pipeline.named_steps["classifier"]
    vectorizer = pipeline.named_steps["vectorizer"]

    feature_names = vectorizer.get_feature_names_out()
    coefficients = classifier.coef_[0]

    # Ordenar índices por valor de coeficiente
    sorted_indices = coefficients.argsort()

    # Top negativos (valores más bajos / negativos)
    top_negative = [
        (feature_names[i], round(float(coefficients[i]), 4))
        for i in sorted_indices[:top_n]
    ]

    # Top positivos (valores más altos)
    top_positive = [
        (feature_names[i], round(float(coefficients[i]), 4))
        for i in sorted_indices[-top_n:][::-1]
    ]

    return {
        "top_positive_indicators": top_positive,
        "top_negative_indicators": top_negative,
    }
