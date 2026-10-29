# Reglas de Proyecto: Sentix-Hotel

## Estándares de Codificación y Convenciones

1. **Nombres autoexplicativos:** Variables y funciones en `snake_case` con nombres intencionales (`cleaned_review_text`, `predicted_label`, `model_accuracy`). Prohibidas variables de una o dos letras sin sentido (`t`, `x1`, `temp`).
2. **Comentarios limpios, técnicos y sin nombres:** Cero bloques innecesarios de caracteres o separadores (`### ==== ###`). Prohibido colocar nombres de participantes, autores o roles ("Responsable: X", "Autor: Y") en comentarios, docstrings o código. Comentar únicamente el **por qué** técnico o de negocio de decisiones críticas (ej. retención de negaciones en stop words).
3. **Tipado y docstrings:** Uso de type hints en Python (`text: str -> str`) y docstrings concisos, directos y funcionales.
4. **Desacoplamiento estricto de capas:** El pipeline de NLP reside en `src/nlp/`, los modelos en `src/models/`, el backend en `api/` y el frontend en `frontend/`. El backend carga los modelos serializados y jamás reimplementa el preprocesamiento a mano.
5. **Configuración centralizada:** Hiperparámetros, rangos de n-gramas, umbrales y stop words centralizados en `src/config.py` para permitir la modificación en vivo durante la defensa en cuestión de segundos.
6. **Diseño de Frontend (60-30-10 y sobriedad):**
   - **Paleta 60-30-10:** 60% fondo dominante neutro/oscuro, 30% estructura/tarjetas/bordes, 10% acento funcional (azul/índigo y estados semánticos precisos).
   - **Cero emojis:** Prohibido el uso de emojis en componentes, textos o alertas. Utilizar exclusivamente iconografía vectorial SVG (Lucide) sobria y consistente.
   - **Cero datos irrelevantes:** No exponer nombres de integrantes ni datos de autoría en la interfaz de usuario.
   - **Feedback modal unificado:** Gestionar avisos, errores y confirmaciones a través de un único modal de feedback reutilizable.
