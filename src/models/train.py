"""
Script Reproducible de Entrenamiento y Serialización del Pipeline.
Permite entrenar, evaluar y exportar el artefacto de producción con:
    python -m src.models.train
"""

import json
from pathlib import Path
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split

from src.config import (
    RAW_DATASET_PATH,
    SERIALIZED_PIPELINE_PATH,
    METRICS_REPORT_PATH,
    MODELS_DIR,
    DATA_PROCESSED_DIR,
    RANDOM_STATE,
    TEST_SIZE,
)
from src.nlp.pipeline import TextPreprocessor
from src.models.logistic_regression import build_logistic_regression_pipeline
from src.models.evaluate import (
    calculate_classification_metrics,
    compute_confusion_matrix,
    find_error_cases,
)


def load_and_split_data():
    """Carga los datos crudos y realiza la partición estratificada con semilla fija."""
    if not RAW_DATASET_PATH.exists():
        raise FileNotFoundError(f"No se encontró el dataset en {RAW_DATASET_PATH}")

    df = pd.read_csv(RAW_DATASET_PATH)
    train_df, test_df = train_test_split(
        df,
        test_size=TEST_SIZE,
        stratify=df["sentiment"],
        random_state=RANDOM_STATE,
    )

    DATA_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    train_df.to_csv(DATA_PROCESSED_DIR / "train_reviews.csv", index=False)
    test_df.to_csv(DATA_PROCESSED_DIR / "test_reviews.csv", index=False)

    return train_df, test_df


def train_and_export():
    """Entrena el pipeline de producción, evalúa sobre test y serializa el artefacto."""
    print("=" * 60)
    print(" INICIANDO ENTRENAMIENTO DEL PIPELINE SENTIX-HOTEL")
    print("=" * 60)

    # 1. Cargar datos
    print("1. Cargando y dividiendo datos...")
    train_df, test_df = load_and_split_data()
    print(f"   Train: {len(train_df):,} | Test: {len(test_df):,}")

    X_train = train_df["review_text"].astype(str).tolist()
    y_train = train_df["sentiment"].astype(int).tolist()
    X_test = test_df["review_text"].astype(str).tolist()
    y_test = test_df["sentiment"].astype(int).tolist()

    # 2. Construir y ajustar pipeline
    print("2. Ajustando pipeline (Preprocesamiento NLP + TF-IDF + Regresión Logística)...")
    pipeline = build_logistic_regression_pipeline()
    pipeline.fit(X_train, y_train)

    # 3. Evaluación en conjunto de prueba
    print("3. Evaluando en conjunto de prueba aislado...")
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    metrics = calculate_classification_metrics(y_test, y_pred, y_prob)
    cm = compute_confusion_matrix(y_test, y_pred)
    errors = find_error_cases(X_test, y_test, y_pred, y_prob, n_cases=5)

    print(f"   Accuracy:    {metrics['accuracy']:.4f}")
    print(f"   F1 Macro:    {metrics['f1_macro']:.4f}")
    print(f"   Precision:   {metrics['precision_macro']:.4f}")
    print(f"   Recall:      {metrics['recall_macro']:.4f}")

    # 4. Serialización
    print("4. Serializando artefactos a models/...")
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, SERIALIZED_PIPELINE_PATH)
    print(f"   Modelo serializado en: {SERIALIZED_PIPELINE_PATH}")

    # Guardar reporte de métricas en JSON
    report_data = {
        "model_name": "LogisticRegression_Tfidf",
        "metrics": metrics,
        "confusion_matrix": cm,
        "error_analysis_samples": errors,
    }
    with open(METRICS_REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)
    print(f"   Reporte de métricas guardado en: {METRICS_REPORT_PATH}")

    print("=" * 60)
    print(" ENTRENAMIENTO Y EXPORTACIÓN COMPLETADOS CON ÉXITO")
    print("=" * 60)


if __name__ == "__main__":
    train_and_export()
