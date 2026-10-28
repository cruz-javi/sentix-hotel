"""
Módulo de Vectorización TF-IDF y Comparación de N-gramas.

Responsable: José (Capa 2D - NLP)
Transforma colecciones de textos procesados en matrices numéricas ponderadas por TF-IDF.
Permite evaluar el impacto de Unigramas frente a Unigramas + Bigramas.
"""

from typing import Tuple, List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from src.config import (
    NGRAM_RANGE,
    MAX_FEATURES,
    MIN_DF,
    MAX_DF,
    SUBLINEAR_TF,
)


def create_tfidf_vectorizer(
    ngram_range: Tuple[int, int] = NGRAM_RANGE,
    max_features: int = MAX_FEATURES,
    min_df: int = MIN_DF,
    max_df: float = MAX_DF,
    sublinear_tf: bool = SUBLINEAR_TF,
) -> TfidfVectorizer:
    """
    Instancia y configura un vectorizador TF-IDF con los hiperparámetros del proyecto.

    Args:
        ngram_range: Tupla con el rango de n-gramas (ej. (1, 1) o (1, 2)).
        max_features: Cantidad máxima de características del vocabulario.
        min_df: Frecuencia mínima de documento para incluir un término.
        max_df: Frecuencia máxima relativa para filtrar términos ubicuos.
        sublinear_tf: Si aplica escalado logarítmico a la frecuencia de término (1 + log(tf)).

    Returns:
        Objeto TfidfVectorizer configurado.
    """
    return TfidfVectorizer(
        ngram_range=ngram_range,
        max_features=max_features,
        min_df=min_df,
        max_df=max_df,
        sublinear_tf=sublinear_tf,
    )


def compare_ngrams_vocabulary(corpus: List[str]) -> Dict[str, Any]:
    """
    Compara el tamaño y características del vocabulario entre unigramas y bigramas.

    Args:
        corpus: Lista de reseñas preprocesadas.

    Returns:
        Diccionario con métricas de vocabulario y ejemplos de n-gramas capturados.
    """
    # 1. Vectorizador con solo unigramas (1, 1)
    vec_unigrams = create_tfidf_vectorizer(ngram_range=(1, 1))
    vec_unigrams.fit(corpus)
    unigram_features = vec_unigrams.get_feature_names_out()

    # 2. Vectorizador con unigramas + bigramas (1, 2)
    vec_bigrams = create_tfidf_vectorizer(ngram_range=(1, 2))
    vec_bigrams.fit(corpus)
    bigram_features = vec_bigrams.get_feature_names_out()

    # Filtrar solo los bigramas extraídos
    pure_bigrams = [feat for feat in bigram_features if " " in feat]

    return {
        "unigrams_vocab_size": len(unigram_features),
        "bigrams_vocab_size": len(bigram_features),
        "pure_bigrams_count": len(pure_bigrams),
        "sample_unigrams": list(unigram_features[:10]),
        "sample_bigrams": pure_bigrams[:10],
    }
