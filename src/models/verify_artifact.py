"""
Auditoría del artefacto serializado en producción.

Comprueba que el pipeline de models/sentix_pipeline.joblib coincide con los
hiperparámetros registrados en models/metrics_report.json y con la configuración
centralizada de src/config.py.

Uso:
    python -m src.models.verify_artifact
"""

import json
import sys
from typing import Any, Dict, List, Tuple

import joblib
from sklearn.pipeline import Pipeline

from src.config import (
    SERIALIZED_PIPELINE_PATH,
    METRICS_REPORT_PATH,
    NGRAM_RANGE,
    MAX_FEATURES,
    USE_LEMMATIZATION,
)

EXPECTED_STEPS: List[str] = ["preprocessor", "vectorizer", "classifier"]


def load_metrics_report() -> Dict[str, Any]:
    """Carga el reporte de métricas exportado por el entrenamiento."""
    with open(METRICS_REPORT_PATH, "r", encoding="utf-8") as report_file:
        return json.load(report_file)


def describe_pipeline(pipeline: Pipeline) -> Dict[str, Any]:
    """
    Extrae los parámetros efectivos almacenados dentro del artefacto.

    Args:
        pipeline: Pipeline serializado de Scikit-Learn.

    Returns:
        Diccionario con los valores realmente persistidos en disco.
    """
    classifier = pipeline.named_steps["classifier"]
    vectorizer = pipeline.named_steps["vectorizer"]
    preprocessor = pipeline.named_steps["preprocessor"]

    return {
        "steps": list(pipeline.named_steps.keys()),
        "classifier_name": type(classifier).__name__,
        "penalty_strength": float(classifier.C),
        "max_iter": int(classifier.max_iter),
        "solver": str(classifier.solver),
        "classes": [int(label) for label in classifier.classes_],
        "n_features_in": int(classifier.n_features_in_),
        "vocabulary_size": len(vectorizer.vocabulary_),
        "ngram_range": [int(value) for value in vectorizer.ngram_range],
        "max_features": int(vectorizer.max_features),
        "use_lemmatization": bool(preprocessor.use_lemmatization),
    }


def evaluate_consistency(
    description: Dict[str, Any], metrics_report: Dict[str, Any]
) -> List[Tuple[str, bool, str]]:
    """
    Contrasta el artefacto contra el reporte de métricas y la configuración vigente.

    Args:
        description: Parámetros efectivos leídos del pipeline.
        metrics_report: Contenido de metrics_report.json.

    Returns:
        Lista de tuplas (comprobación, resultado, detalle legible).
    """
    tuning = metrics_report.get("tuning") or {}
    best_params = tuning.get("best_params") or {}
    reported_c = best_params.get("classifier__C")
    accuracy = (metrics_report.get("metrics") or {}).get("accuracy")

    checks: List[Tuple[str, bool, str]] = [
        (
            "Estructura del pipeline",
            description["steps"] == EXPECTED_STEPS,
            f"{description['steps']} esperado {EXPECTED_STEPS}",
        ),
        (
            "Hiperparametro C igual al mejor de la validacion cruzada",
            reported_c is not None and description["penalty_strength"] == float(reported_c),
            f"joblib={description['penalty_strength']} reporte={reported_c}",
        ),
        (
            "Dimension del vocabulario TF-IDF",
            description["vocabulary_size"] == MAX_FEATURES
            and description["n_features_in"] == MAX_FEATURES,
            (
                f"vocabulario={description['vocabulary_size']} "
                f"features={description['n_features_in']} config={MAX_FEATURES}"
            ),
        ),
        (
            "Rango de n-gramas",
            description["ngram_range"] == list(NGRAM_RANGE),
            f"joblib={description['ngram_range']} config={list(NGRAM_RANGE)}",
        ),
        (
            "Morfologia activa",
            description["use_lemmatization"] == USE_LEMMATIZATION,
            f"joblib={description['use_lemmatization']} config={USE_LEMMATIZATION}",
        ),
    ]

    if accuracy is not None:
        checks.append(
            (
                "Reporte de metricas disponible",
                0.0 <= float(accuracy) <= 1.0,
                f"accuracy={accuracy}",
            )
        )

    return checks


def main() -> int:
    """
    Ejecuta la auditoría completa e imprime el resultado por consola.

    Returns:
        0 si todas las comprobaciones se cumplen, 1 en caso contrario.
    """
    if not SERIALIZED_PIPELINE_PATH.exists():
        print(f"[ERROR] No se encontro el artefacto: {SERIALIZED_PIPELINE_PATH}")
        print("Ejecute primero: python -m src.models.train")
        return 1

    if not METRICS_REPORT_PATH.exists():
        print(f"[ERROR] No se encontro el reporte de metricas: {METRICS_REPORT_PATH}")
        print("Ejecute primero: python -m src.models.train")
        return 1

    pipeline = joblib.load(SERIALIZED_PIPELINE_PATH)
    metrics_report = load_metrics_report()
    description = describe_pipeline(pipeline)

    print("Artefacto:", SERIALIZED_PIPELINE_PATH)
    print("Clasificador:", description["classifier_name"])
    print("Hiperparametro C:", description["penalty_strength"])
    print("max_iter:", description["max_iter"], "| solver:", description["solver"])
    print("Clases:", description["classes"])
    print("Vocabulario TF-IDF:", description["vocabulary_size"])
    print("Rango de n-gramas:", description["ngram_range"])
    print("Lematizacion activa:", description["use_lemmatization"])

    tuning = metrics_report.get("tuning") or {}
    if tuning:
        print("Mejor F1 macro en CV:", tuning.get("best_cv_score"))
        print("Mejores hiperparametros:", tuning.get("best_params"))

    print("")
    print("Comprobaciones de coherencia:")

    checks = evaluate_consistency(description, metrics_report)
    all_passed = True
    for check_name, passed, detail in checks:
        status_label = "OK" if passed else "FALLA"
        print(f"  [{status_label}] {check_name}: {detail}")
        all_passed = all_passed and passed

    print("")
    if all_passed:
        print("Resultado: el artefacto es coherente con la configuracion y el reporte.")
        return 0

    print("Resultado: se detectaron incoherencias.")
    print("Regenere el modelo con: python -m src.models.train")
    return 1


if __name__ == "__main__":
    sys.exit(main())
