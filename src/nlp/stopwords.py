"""
Módulo de Gestión de Stop Words en Español con Retención de Negaciones.

Responsable: Javier (Capa 2B - NLP)
Filtra palabras funcionales de alta frecuencia pero PRESERVA términos de negación
('no', 'nunca', 'jamás', 'sin', 'tampoco') para no invertir la polaridad de sentimiento.
"""

from typing import List, Set
from src.config import NEGATION_WORDS, CUSTOM_STOPWORDS

# Lista base de palabras vacías en español (estándar NLTK / ISO)
DEFAULT_SPANISH_STOPWORDS: Set[str] = {
    "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por",
    "un", "para", "con", "una", "su", "al", "lo", "como", "mas", "más", "pero",
    "sus", "le", "ya", "o", "este", "si", "sí", "porque", "esta", "entre",
    "cuando", "muy", "sobre", "tambien", "también", "me", "hasta", "hay",
    "donde", "quien", "desde", "todo", "nos", "durante", "todos", "uno", "les",
    "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e", "esto", "mi",
    "antes", "algunos", "que", "unos", "yo", "otro", "otras", "otra", "el",
    "tanto", "esa", "estos", "mucho", "quienes", "nada", "muchos", "cual",
    "sea", "poco", "ella", "estar", "estas", "algunas", "algo", "nosotros",
    "mi", "mis", "tu", "tus", "te", "ti", "nosotras", "vosotros", "vosotras",
    "ellos", "ellas", "mio", "mia", "mios", "mias", "tuyo", "tuya", "tuyos",
    "tuyas", "suyo", "suya", "suyos", "suyas", "nuestro", "nuestra", "nuestros",
    "nuestras", "vuestro", "vuestra", "vuestros", "vuestras", "esos", "esas",
    "estoy", "estas", "esta", "estamos", "estais", "estan", "este", "estes",
    "estemos", "esteis", "esten", "estare", "estaras", "estara", "estaremos",
    "estareis", "estaran", "estaria", "estarias", "estariamos", "estariais",
    "estarian", "estaba", "estabas", "estabamos", "estabais", "estaban",
    "estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron",
    "estuviera", "estuvieras", "estuvieramos", "estuvierais", "estuvieran",
    "estuviese", "estuvieses", "estuviesemos", "estuvieseis", "estuviesen",
    "estando", "estado", "estada", "estados", "estadas", "estad", "he", "has",
    "ha", "hemos", "habeis", "han", "haya", "hayas", "hayamos", "hayais",
    "hayan", "habre", "habras", "habra", "habremos", "habreis", "habran",
    "habria", "habrias", "habriamos", "habriais", "habrian", "habia", "habias",
    "habiamos", "habiais", "habian", "hube", "hubiste", "hubo", "hubimos",
    "hubisteis", "hubieron", "hubiera", "hubieras", "hubieramos", "hubierais",
    "hubieran", "hubiese", "hubieses", "hubiesemos", "hubieseis", "hubiesen",
    "habiendo", "habido", "habida", "habidos", "habidas", "soy", "eres", "es",
    "somos", "sois", "son", "sea", "seas", "seamos", "seais", "sean", "sere",
    "seras", "sera", "seremos", "sereis", "seran", "seria", "serias", "seriamos",
    "seriais", "serian", "era", "eras", "eramos", "erais", "eran", "fui",
    "fuiste", "fue", "fuimos", "fuisteis", "fueron", "fuera", "fueras", "fueramos",
    "fuerais", "fueran", "fuese", "fueses", "fuesemos", "fueseis", "fuesen",
    "siendo", "sido", "tengo", "tienes", "tiene", "tenemos", "teneis", "tienen",
    "tenga", "tengas", "tengamos", "tengais", "tengan", "tendre", "tendras",
    "tendra", "tendremos", "tendreis", "tendran", "tendria", "tendrias",
    "tendriamos", "tendriais", "tendrian", "tenia", "tenias", "teniamos",
    "teniais", "tenian", "tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis",
    "tuvieron", "tuviera", "tuvieras", "tuvieramos", "tuvierais", "tuvieran",
    "tuviese", "tuvieses", "tuviesemos", "tuvieseis", "tuviesen", "teniendo",
    "tenido", "tenida", "tenidos", "tenidas", "tened"
}


def get_spanish_stopwords(include_custom: bool = True) -> Set[str]:
    """
    Retorna el conjunto de stopwords depuradas para análisis de sentimiento.

    Excluye estrictamente las palabras de negación de NEGATION_WORDS para
    que permanezcan en el vocabulario del modelo.
    """
    stopwords = set(DEFAULT_SPANISH_STOPWORDS)

    if include_custom:
        stopwords.update(CUSTOM_STOPWORDS)

    # REMOCIÓN CRÍTICA: quitamos negaciones de la lista de descarte
    for negation in NEGATION_WORDS:
        stopwords.discard(negation)

    return stopwords


def remove_stopwords(tokens: List[str], include_custom: bool = True) -> List[str]:
    """
    Filtra una lista de tokens eliminando stopwords excepto las negaciones.

    Args:
        tokens: Lista de palabras generada por el tokenizador.
        include_custom: Si se incorporan palabras del dominio hotelero.

    Returns:
        Lista de tokens significativos.
    """
    if not tokens:
        return []

    stop_set = get_spanish_stopwords(include_custom=include_custom)
    return [token for token in tokens if token.lower() not in stop_set]
