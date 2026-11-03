"""
Pruebas Unitarias de Vectorización TF-IDF, Evaluación de Modelos y Morfología.
"""

import pytest
import joblib

from src.config import NGRAM_RANGE, SERIALIZED_PIPELINE_PATH
from src.nlp.vectorizer import create_tfidf_vectorizer, compare_ngrams_vocabulary
from src.nlp.morphology import (
    apply_stemming,
    apply_lemmatization,
    compare_stem_vs_lemma,
    is_spacy_model_available,
)
from src.models.evaluate import (
    calculate_classification_metrics,
    compute_confusion_matrix,
    find_error_cases,
)
from src.models.verify_artifact import (
    describe_pipeline,
    evaluate_consistency,
    load_metrics_report,
)


def test_vectorizer_uses_project_hyperparameters():
    vectorizer = create_tfidf_vectorizer()
    assert vectorizer.ngram_range == NGRAM_RANGE
    assert vectorizer.sublinear_tf is True


def test_compare_ngrams_vocabulary_detects_bigrams():
    # Los bigramas se repiten para que superen el min_df configurado en el vectorizador
    corpus = [
        "servicio excelente",
        "servicio excelente",
        "servicio pesimo",
        "servicio pesimo",
        "atencion excelente",
        "atencion pesima",
    ]
    comparison = compare_ngrams_vocabulary(corpus)

    assert comparison["bigrams_vocab_size"] > comparison["unigrams_vocab_size"]
    assert comparison["pure_bigrams_count"] > 0
    assert all(" " in bigram for bigram in comparison["sample_bigrams"])


def test_stemming_reduces_inflections_to_same_root():
    assert apply_stemming(["habitaciones"]) == apply_stemming(["habitacion"])
    assert apply_stemming([]) == []


@pytest.mark.skipif(
    not is_spacy_model_available(),
    reason="El modelo es_core_news_sm de spaCy no está instalado",
)
def test_lemmatization_returns_canonical_form():
    assert apply_lemmatization(["habitaciones"]) == ["habitación"]


def test_compare_stem_vs_lemma_structure():
    comparison = compare_stem_vs_lemma(["habitaciones", "limpieza"])

    assert len(comparison) == 2
    assert set(comparison[0].keys()) == {"original", "stemming_nltk", "lematizacion_spacy"}


def test_confusion_matrix_splits_quadrants():
    y_true = [1, 1, 0, 0]
    y_pred = [1, 0, 0, 1]
    result = compute_confusion_matrix(y_true, y_pred)

    assert result["true_positives"] == 1
    assert result["false_negatives"] == 1
    assert result["true_negatives"] == 1
    assert result["false_positives"] == 1
    assert result["matrix"] == [[1, 1], [1, 1]]


def test_classification_metrics_on_perfect_prediction():
    metrics = calculate_classification_metrics([0, 1, 0, 1], [0, 1, 0, 1])

    assert metrics["accuracy"] == 1.0
    assert metrics["precision_macro"] == 1.0
    assert metrics["recall_macro"] == 1.0
    assert metrics["f1_macro"] == 1.0


def test_classification_metrics_detects_classification_report():
    metrics = calculate_classification_metrics([0, 1, 1, 0], [0, 1, 0, 0])

    assert "classification_report" in metrics
    assert metrics["accuracy"] == 0.75
    assert metrics["classification_report"]["Positivo"]["support"] == 2.0


def test_find_error_cases_returns_only_discrepancies():
    texts = ["reseña uno", "reseña dos", "reseña tres"]
    y_true = [1, 0, 1]
    y_pred = [0, 0, 1]
    probabilities = [0.2, 0.1, 0.9]

    errors = find_error_cases(texts, y_true, y_pred, probabilities, n_cases=5)

    assert len(errors) == 1
    assert errors[0]["sample_index"] == 0
    assert errors[0]["error_type"] == "Falso Negativo"
    assert errors[0]["predicted_probability"] == 0.2


def test_find_error_cases_respects_limit():
    texts = ["a", "b", "c", "d"]
    y_true = [1, 1, 1, 1]
    y_pred = [0, 0, 0, 0]

    assert len(find_error_cases(texts, y_true, y_pred, n_cases=2)) == 2


def test_serialized_artifact_matches_configuration_and_report():
    """El artefacto versionado debe ser coherente con la configuración y su reporte."""
    pipeline = joblib.load(SERIALIZED_PIPELINE_PATH)
    checks = evaluate_consistency(describe_pipeline(pipeline), load_metrics_report())

    failed_checks = [detail for _, passed, detail in checks if not passed]
    assert failed_checks == [], failed_checks
