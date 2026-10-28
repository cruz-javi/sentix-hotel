"""
Módulo de Morfología: Stemming (NLTK) vs. Lematización (spaCy).

Responsable: Gabriel (Capa 2C - NLP)
Permite comparar empíricamente la reducción a raíces léxicas (stemming) frente
a la reducción morfológica por lemas contextuales (lematización).
"""

from typing import List, Dict, Any
from src.config import SPACY_MODEL_NAME

# Variable global para cachear el modelo spaCy cargado
_SPACY_NLP = None


def get_spacy_nlp():
    """Carga de forma perezosa el modelo de spaCy en español."""
    global _SPACY_NLP
    if _SPACY_NLP is None:
        try:
            import spacy
            _SPACY_NLP = spacy.load(SPACY_MODEL_NAME, disable=["parser", "ner"])
        except Exception:
            # Fallback seguro si el modelo descargado de spaCy aún no está presente
            _SPACY_NLP = False
    return _SPACY_NLP


def apply_stemming(tokens: List[str]) -> List[str]:
    """
    Aplica el algoritmo de Snowball Stemmer en español (NLTK) a una lista de tokens.

    Trunca sufijos para llegar a una raíz común (ej. 'habitaciones' -> 'habitac').
    """
    if not tokens:
        return []

    from nltk.stem.snowball import SnowballStemmer
    stemmer = SnowballStemmer("spanish")
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
