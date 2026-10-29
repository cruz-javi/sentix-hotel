"""
Módulo de Morfología: Stemming vs. Lematización.
Permite comparar la reducción a raíces léxicas frente a formas lematizadas contextuales.
"""

from typing import List, Dict, Any, Optional
import spacy
from nltk.stem.snowball import SnowballStemmer

from src.config import SPACY_MODEL_NAME

_SPACY_NLP: Optional[Any] = None
_SPANISH_STEMMER: Optional[SnowballStemmer] = None


def get_spacy_nlp():
    """Carga de forma perezosa el modelo de spaCy en español."""
    global _SPACY_NLP
    if _SPACY_NLP is None:
        try:
            _SPACY_NLP = spacy.load(SPACY_MODEL_NAME, disable=["parser", "ner"])
        except Exception:
            _SPACY_NLP = False
    return _SPACY_NLP


def get_spanish_stemmer() -> SnowballStemmer:
    """Carga de forma perezosa el stemmer de Snowball en español."""
    global _SPANISH_STEMMER
    if _SPANISH_STEMMER is None:
        _SPANISH_STEMMER = SnowballStemmer("spanish")
    return _SPANISH_STEMMER


def apply_stemming(tokens: List[str]) -> List[str]:
    """
    Aplica el algoritmo de Snowball Stemmer en español (NLTK) a una lista de tokens.

    Trunca sufijos para llegar a una raíz común (ej. 'habitaciones' -> 'habitac').
    """
    if not tokens:
        return []

    stemmer = get_spanish_stemmer()
    return [stemmer.stem(token) for token in tokens]


def apply_lemmatization(tokens: List[str]) -> List[str]:
    """
    Aplica lematización morfológica en español mediante spaCy.

    Convierte palabras a su forma canónica de diccionario (ej. 'habitaciones' -> 'habitación').
    """
    if not tokens:
        return []

    nlp = get_spacy_nlp()
    if nlp:
        text = " ".join(tokens)
        doc = nlp(text)
        return [token.lemma_ for token in doc if token.lemma_.strip()]
    else:
        # Si spaCy no está descargado aún, retorna los tokens en minúsculas
        return [t.lower() for t in tokens]


def compare_stem_vs_lemma(sample_tokens: List[str]) -> List[Dict[str, str]]:
    """
    Genera una tabla comparativa término a término entre Stemming y Lematización.

    Útil para la exposición del proyecto y la defensa de la elección de método.
    """
    stemmed = apply_stemming(sample_tokens)
    lemmatized = apply_lemmatization(sample_tokens)

    comparison = []
    for orig, stem, lemma in zip(sample_tokens, stemmed, lemmatized):
        comparison.append({
            "original": orig,
            "stemming_nltk": stem,
            "lematizacion_spacy": lemma,
        })
    return comparison
