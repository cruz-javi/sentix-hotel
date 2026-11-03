"""
Pipeline Integral de Preprocesamiento de NLP para Sentix-Hotel.
Transformador Scikit-Learn (BaseEstimator, TransformerMixin) que integra
normalización, tokenización, filtrado de stopwords y morfología de forma reproducible.
"""

from typing import List, Dict, Any, Union
from sklearn.base import BaseEstimator, TransformerMixin

from src.nlp.normalizer import normalize_text
from src.nlp.tokenizer import tokenize_text
from src.nlp.stopwords import remove_stopwords
from src.nlp.morphology import apply_stemming, apply_lemmatization
from src.config import USE_LEMMATIZATION


class TextPreprocessor(BaseEstimator, TransformerMixin):
    """
    Transformador de Scikit-Learn que ejecuta el pipeline completo de NLP sobre reseñas.

    Convierte colecciones de textos crudos en textos depurados listos para vectorización.
    """

    def __init__(
        self,
        use_lemmatization: bool = USE_LEMMATIZATION,
        include_custom_stopwords: bool = True,
        keep_accents: bool = True,
    ):
        self.use_lemmatization = use_lemmatization
        self.include_custom_stopwords = include_custom_stopwords
        self.keep_accents = keep_accents

    def fit(self, X, y=None):
        """No requiere aprendizaje de estado; retorna a sí mismo."""
        return self

    def _extract_lexical_units(self, text: str) -> Dict[str, Any]:
        """
        Ejecuta las tres primeras fases del pipeline sobre un texto crudo.

        Centraliza normalización, tokenización y filtrado de stop words para que la
        transformación masiva y el desglose paso a paso no puedan divergir.

        Args:
            text: Reseña cruda en español.

        Returns:
            Diccionario con texto normalizado, tokens y tokens sin stop words.
        """
        normalized = normalize_text(text, keep_accents=self.keep_accents)
        if not normalized:
            return {"normalized_text": "", "tokens": [], "tokens_no_stopwords": []}

        tokens = tokenize_text(normalized)
        tokens_no_stopwords = remove_stopwords(
            tokens, include_custom=self.include_custom_stopwords
        )
        return {
            "normalized_text": normalized,
            "tokens": tokens,
            "tokens_no_stopwords": tokens_no_stopwords,
        }

    def _reduce_morphology(self, tokens: List[str]) -> List[str]:
        """Aplica la reducción morfológica activa: lematización o stemming."""
        if self.use_lemmatization:
            return apply_lemmatization(tokens)
        return apply_stemming(tokens)

    def transform_single(self, text: str) -> str:
        """
        Ejecuta el pipeline completo sobre un único texto.

        Args:
            text: Reseña cruda en español.

        Returns:
            Cadena preprocesada con lemas o raíces separados por espacio.
        """
        lexical_units = self._extract_lexical_units(text)
        reduced_tokens = self._reduce_morphology(lexical_units["tokens_no_stopwords"])
        return " ".join(reduced_tokens)

    def transform(self, X: Union[List[str], Any]) -> List[str]:
        """
        Transforma una colección completa de textos.

        Args:
            X: Serie de pandas, arreglo numpy o lista de cadenas.

        Returns:
            Lista de textos preprocesados.
        """
        return [self.transform_single(str(text)) for text in X]

    def get_step_by_step_breakdown(self, text: str) -> Dict[str, Any]:
        """
        Retorna la transformación del texto en cada etapa individual.

        Utilizado por el endpoint /api/nlp-steps del backend para alimentar
        la vista interactiva del frontend requerida por la rúbrica del docente.
        """
        lexical_units = self._extract_lexical_units(text)
        no_stopwords = lexical_units["tokens_no_stopwords"]

        # Se calculan ambas morfologías para evidenciar la comparativa exigida por el curso
        stemmed = apply_stemming(no_stopwords)
        lemmatized = apply_lemmatization(no_stopwords)
        active_tokens = lemmatized if self.use_lemmatization else stemmed

        return {
            "original_text": text,
            "normalized_text": lexical_units["normalized_text"],
            "tokens": lexical_units["tokens"],
            "tokens_no_stopwords": no_stopwords,
            "stemmed_tokens": stemmed,
            "lemmatized_tokens": lemmatized,
            "active_morphology": "lemmatization" if self.use_lemmatization else "stemming",
            "final_processed_text": " ".join(active_tokens),
        }
