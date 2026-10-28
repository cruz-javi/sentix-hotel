"""
Módulo de Evaluación de Modelos, Métricas y Análisis de Errores.

Responsable: José (Capa 3C - ML)
Calcula métricas de clasificación (Accuracy, Precision, Recall, F1), matrices
de confusión y extrae casos de error para el análisis cualitativo exigido por el docente.
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)


def calculate_classification_metrics(
    y_true: List[int], y_pred: List[int], y_prob: List[float] = None
) -> Dict[str, Any]:
    """
    Calcula el conjunto completo de métricas de desempeño sobre el conjunto de test.
    """
    metrics = {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision_macro": round(float(precision_score(y_true, y_pred, average="macro")), 4),
        "recall_macro": round(float(recall_score(y_true, y_pred, average="macro")), 4),
        "f1_macro": round(float(f1_score(y_true, y_pred, average="macro")), 4),
        "f1_weighted": round(float(f1_score(y_true, y_pred, average="weighted")), 4),
        "classification_report": classification_report(
            y_true, y_pred, target_names=["Negativo", "Positivo"], output_dict=True
        ),
    }
    return metrics


def compute_confusion_matrix(y_true: List[int], y_pred: List[int]) -> Dict[str, Any]:
    """
    Genera la matriz de confusión de 2x2 desglosada en cuadrantes interpretables.
    """
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()

    return {
        "matrix": cm.tolist(),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
        "true_positives": int(tp),
    }


def find_error_cases(
    texts: List[str],
    y_true: List[int],
    y_pred: List[int],
    y_prob: List[float] = None,
    n_cases: int = 5,
) -> List[Dict[str, Any]]:
    """
    Identifica ejemplos específicos donde el modelo falló para el análisis cualitativo.
    """
    errors = []
    for idx, (text, true_val, pred_val) in enumerate(zip(texts, y_true, y_pred)):
        if true_val != pred_val:
            prob = round(float(y_prob[idx]), 4) if y_prob is not None else None
            errors.append({
                "sample_index": idx,
                "text": text[:250] + ("..." if len(text) > 250 else ""),
                "real_label": "Positivo" if true_val == 1 else "Negativo",
                "predicted_label": "Positivo" if pred_val == 1 else "Negativo",
                "predicted_probability": prob,
                "error_type": "Falso Positivo" if pred_val == 1 else "Falso Negativo",
            })
            if len(errors) >= n_cases:
                break
    return errors
