"""
Módulo de Normalización de Texto.

Responsable: Gabriel (Capa 2A - NLP)
Realiza la limpieza básica de caracteres, minúsculas, remoción de URLs/HTML
y estandarización de signos respetando el significado semántico.
"""

import re
import unicodedata
from typing import Optional


def to_lowercase(text: str) -> str:
    """Convierte el texto completo a minúsculas."""
    if not text:
        return ""
    return text.lower().strip()


def remove_urls_and_html(text: str) -> str:
    """Elimina enlaces web (http/https/www) y etiquetas HTML de la reseña."""
    if not text:
        return ""
    # Remover URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    # Remover etiquetas HTML
    text = re.sub(r"<.*?>", "", text)
    return text


def clean_special_characters(text: str, keep_accents: bool = True) -> str:
    """
    Limpia caracteres especiales, manteniendo letras del español y puntuación básica.

    Args:
        text: Cadena de texto a procesar.
        keep_accents: Si es True, conserva tildes y la letra 'ñ'.
    """
    if not text:
        return ""

    if not keep_accents:
        # Descompone caracteres y descarta tildes
        text = "".join(
            c for c in unicodedata.normalize("NFD", text)
            if unicodedata.category(c) != "Mn"
        )

    # Conserva letras en español (incluyendo á, é, í, ó, ú, ñ), números y espacios
    text = re.sub(r"[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]", " ", text)
    # Colapsa espacios múltiples a uno solo
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_text(text: str, keep_accents: bool = True) -> str:
    """
    Aplica la secuencia completa de normalización sobre el texto crudo.

    Args:
        text: Reseña original ingresada por el usuario.
        keep_accents: Flag para conservar o remover tildes.

    Returns:
        Texto normalizado y limpio en minúsculas.
    """
    if not isinstance(text, str) or not text.strip():
        return ""

    text = to_lowercase(text)
    text = remove_urls_and_html(text)
    text = clean_special_characters(text, keep_accents=keep_accents)
    return text
