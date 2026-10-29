"""
Módulo de Tokenización de Texto.
Segmenta el texto normalizado en una lista de unidades léxicas (tokens).
"""

import re
from typing import List


def tokenize_text(text: str) -> List[str]:
    """
    Divide un texto normalizado en una lista de palabras (tokens).

    Maneja palabras alfanuméricas del español y descarta elementos vacíos.

    Args:
        text: Cadena previamente normalizada.

    Returns:
        Lista de tokens limpios.
    """
    if not text or not isinstance(text, str):
        return []

    # Extrae secuencias alfanuméricas completas (incluyendo acentos del español)
    tokens = re.findall(r"\b[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+\b", text)
    return tokens
