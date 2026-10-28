"""
Herramienta CLI interactiva para probar el modelo de inferencia de Sentix-Hotel.

Uso:
    python -m src.models.predict "Excelente hotel, la comida estuvo deliciosa y el personal muy amable"
    python -m src.models.predict "Pésimo servicio, la habitación tenía humedad y no nos cambiaron las sábanas"
    python -m src.models.predict  (ejecuta ejemplos precargados)
"""

import sys
import joblib
from src.config import SERIALIZED_PIPELINE_PATH, DEFAULT_DECISION_THRESHOLD
from src.nlp.pipeline import TextPreprocessor


def predict_text(text: str):
    """Realiza la inferencia y muestra el desglose del pipeline de NLP."""
    if not SERIALIZED_PIPELINE_PATH.exists():
        print(f"Error: No se encontró el modelo en {SERIALIZED_PIPELINE_PATH}")
        print("Ejecute primero: python -m src.models.train")
        return

    # Cargar pipeline
    pipeline = joblib.load(SERIALIZED_PIPELINE_PATH)
    preprocessor = pipeline.named_steps["preprocessor"]

    # Desglose de NLP
    breakdown = preprocessor.get_step_by_step_breakdown(text)

    # Inferencia de probabilidades
    probabilities = pipeline.predict_proba([text])[0]
    prob_neg = float(probabilities[0])
    prob_pos = float(probabilities[1])

    predicted_class = 1 if prob_pos >= DEFAULT_DECISION_THRESHOLD else 0
    label = "POSITIVO" if predicted_class == 1 else "NEGATIVO"
    confidence = prob_pos if predicted_class == 1 else prob_neg

    color = "\033[92m" if predicted_class == 1 else "\033[91m"
    reset = "\033[0m"

    print("\n" + "=" * 65)
    print(f" RESEÑA EVALUADA: \"{text}\"")
    print("=" * 65)
    print(" PASO A PASO DEL PIPELINE DE NLP:")
    print(f"  1. Normalizado:        {breakdown['normalized_text']}")
    print(f"  2. Tokens:             {breakdown['tokens']}")
    print(f"  3. Sin Stopwords:      {breakdown['tokens_no_stopwords']} (¡negaciones retenidas!)")
    print(f"  4. Texto Procesado:    {breakdown['final_processed_text']}")
    print("-" * 65)
    print(f" RESULTADO DEL MODELO: {color}{label}{reset} (Confianza: {confidence:.2%})")
    print(f"  - Probabilidad Positiva: {prob_pos:.2%}")
    print(f"  - Probabilidad Negativa: {prob_neg:.2%}")
    print("=" * 65 + "\n")


def run_demo_examples():
    """Ejecuta ejemplos de prueba representativos para verificar el modelo."""
    examples = [
        "El hotel superó todas nuestras expectativas, las habitaciones muy limpias y el desayuno exquisito.",
        "Pésima experiencia, la habitación olía a humedad, no nos atendieron y no volvería jamás.",
        "Buena ubicación cerca de la playa, aunque el wifi fallaba a veces, en general recomendable.",
        "No me gustó nada la atención del personal de recepción, muy lentos y sin ganas de ayudar.",
    ]
    print("\n Ejcutando ejemplos de demostración de Sentix-Hotel...")
    for ex in examples:
        predict_text(ex)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = " ".join(sys.argv[1:])
        predict_text(input_text)
    else:
        run_demo_examples()
