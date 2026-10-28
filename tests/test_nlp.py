"""
Pruebas Unitarias para el Pipeline de Preprocesamiento de NLP.
"""

import pytest
from src.nlp.normalizer import normalize_text, to_lowercase, remove_urls_and_html
from src.nlp.tokenizer import tokenize_text
from src.nlp.stopwords import remove_stopwords, get_spanish_stopwords
from src.nlp.pipeline import TextPreprocessor


def test_normalizer_lowercase_and_html():
    raw = "<p>EXCELENTE HOTEL con piscina https://hotel.com</p>"
    cleaned = normalize_text(raw)
    assert "<p>" not in cleaned
    assert "https" not in cleaned
    assert cleaned.islower()
    assert "excelente hotel con piscina" in cleaned


def test_tokenizer_segments_words():
    text = "la atención fue increíble, 100% recomendado!"
    tokens = tokenize_text(text)
    assert "atención" in tokens
    assert "fue" in tokens
    assert "increíble" in tokens
    assert "100" in tokens
    assert "recomendado" in tokens


def test_stopwords_strictly_preserves_negations():
    """Prueba crítica: 'no', 'nunca', 'jamás', 'sin' no deben eliminarse."""
    tokens = ["el", "servicio", "no", "fue", "bueno", "nunca", "volveré", "sin", "duda"]
    filtered = remove_stopwords(tokens)

    # Las palabras de parada normales deben eliminarse
    assert "el" not in filtered
    assert "fue" not in filtered

    # Las negaciones DEBEN conservarse
    assert "no" in filtered
    assert "nunca" in filtered
    assert "sin" in filtered


def test_preprocessor_pipeline_step_by_step():
    preprocessor = TextPreprocessor()
    sample = "No me gustó la comida del restaurante."
    breakdown = preprocessor.get_step_by_step_breakdown(sample)

    assert "original_text" in breakdown
    assert "normalized_text" in breakdown
    assert "tokens" in breakdown
    assert "tokens_no_stopwords" in breakdown
    assert "no" in breakdown["tokens_no_stopwords"]
    assert len(breakdown["final_processed_text"]) > 0
