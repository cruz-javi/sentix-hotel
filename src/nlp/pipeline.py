"""
Pipeline Integral de Preprocesamiento de NLP para Sentix-Hotel.

Responsable: Javier (Capa 2E - NLP)
Encapsula la secuencia completa de normalización, tokenización, stop words
y morfología en un transformador compatible con Scikit-Learn (BaseEstimator, TransformerMixin).
Garantiza reproducibilidad idéntica entre entrenamiento y producción.
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

    def transform_single(self, text: str) -> str:
        """
        Ejecuta el pipeline completo sobre un único texto.

        Args:
            text: Reseña cruda en español.

        Returns:
            Cadena preprocesada con lemas o raíces separados por espacio.
        """
        # 1. Normalización
        normalized = normalize_text(text, keep_accents=self.keep_accents)
        if not normalized:
            return ""

        # 2. Tokenización
        tokens = tokenize_text(normalized)

        # 3. Filtrado de Stop Words (conservando negaciones)
        filtered_tokens = remove_stopwords(
            tokens, include_custom=self.include_custom_stopwords
        )

        # 4. Reducción morfológica (Lematización o Stemming)
        if self.use_lemmatization:
            reduced_tokens = apply_lemmatization(filtered_tokens)
        else:
            reduced_tokens = apply_stemming(filtered_tokens)

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
        # Etapa 1: Normalización
        normalized = normalize_text(text, keep_accents=self.keep_accents)

        # Etapa 2: Tokens
        tokens = tokenize_text(normalized)

        # Etapa 3: Tokens sin Stop Words (con negaciones retenidas)
        no_stopwords = remove_stopwords(
            tokens, include_custom=self.include_custom_stopwords
        )

        # Etapa 4: Raíces y Lemas
        stemmed = apply_stemming(no_stopwords)
        lemmatized = apply_lemmatization(no_stopwords)

        return {
            "original_text": text,
            "normalized_text": normalized,
            "tokens": tokens,
            "tokens_no_stopwords": no_stopwords,
            "stemmed_tokens": stemmed,
            "lemmatized_tokens": lemmatized,
            "active_morphology": "lemmatization" if self.use_lemmatization else "stemming",
            "final_processed_text": " ".join(lemmatized if self.use_lemmatization else stemmed),
        }
