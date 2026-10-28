# Reglas de Proyecto: Sentix-Hotel

## Estándares de Codificación y Convenciones

1. **Nombres autoexplicativos:** Variables y funciones en `snake_case` con nombres intencionales (`cleaned_review_text`, `predicted_label`, `model_accuracy`). Prohibidas variables de una o dos letras sin sentido (`t`, `x1`, `temp`).
2. **Comentarios limpios y sin adornos:** Cero bloques innecesarios de caracteres o separadores (`### ==== ###`). Comentar únicamente el **por qué** de las decisiones críticas de negocio o matemáticas (ej. retención de palabras de negación en stop words).
3. **Tipado y docstrings:** Uso de type hints en Python (`text: str -> str`) y docstrings concisos en funciones principales.
4. **Desacoplamiento estricto de capas:** El pipeline de NLP reside en `src/nlp/`, los modelos en `src/models/`, el backend en `api/` y el frontend en `frontend/`. El backend carga los modelos serializados y jamás reimplementa el preprocesamiento a mano.
5. **Configuración centralizada:** Hiperparámetros, rangos de n-gramas, umbrales y stop words centralizados en `src/config.py` para permitir la modificación en vivo durante la defensa en cuestión de segundos.
