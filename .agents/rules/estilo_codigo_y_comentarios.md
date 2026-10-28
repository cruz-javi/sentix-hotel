---
name: estilo-codigo-y-comentarios
description: Reglas y estándares para escritura de código limpio, nombrado autoexplicativo y comentarios sin adornos para facilitar la lectura y defensa del proyecto.
---

# Guía de Estilo, Código Limpio y Convenciones de Comentarios
**Proyecto:** Sentix-Hotel (Tópicos y Programación Avanzada)

El objetivo central de estas reglas es que cualquier integrante del equipo pueda abrir cualquier archivo de código durante la **defensa individual** frente al docente y explicar su funcionamiento con total fluidez, sin tropezar con variables crípticas, código enredado ni comentarios redundantes.

---

## 1. Nombres Autoexplicativos (Self-Documenting Code)

* **Prohibido el uso de variables de una o dos letras**, salvo iteradores matemáticos triviales (`i`, `j` en bucles breves) o convenciones estándar consagradas de Data Science (`X`, `y` para matriz de características y vector objetivo).
  * ❌ *Mal:* `t = clean(d)`, `res = clf.pred(x2)`, `df3 = f(df)`
  *  *Bien:* `cleaned_text = clean_review_text(raw_review)`, `predicted_sentiment = model.predict(vectorized_text)`
* **Convención de nomenclatura (Python):**
  * **Variables y funciones:** `snake_case` con verbos activos para funciones.
    * Ejemplos: `normalize_text()`, `tokenize_review()`, `calculate_metrics()`.
  * **Clases:** `PascalCase`.
    * Ejemplos: `HotelReviewPipeline`, `SentimentPredictor`.
  * **Constantes e hiperparámetros globales:** `SCREAMING_SNAKE_CASE`.
    * Ejemplos: `RANDOM_STATE = 42`, `DEFAULT_MAX_FEATURES = 5000`, `NGRAM_RANGE = (1, 2)`.

---

## 2. Comentarios Limpios, Breves y sin Adornos

Los comentarios existen para explicar el **POR QUÉ** de una decisión técnica o de negocio, nunca para repetir lo obvio del **QUÉ**.

### Reglas para comentar:
1. **Cero adornos visuales innecesarios:**
   * ❌ *Prohibido:* 
     ```python
     ###################################################
     # ============= LIMPIEZA DE DATOS ================
     ###################################################
     ```
   *  *Permitido:*
     ```python
     # Limpieza y normalización de caracteres
     ```
2. **No comentar obviedades:**
   * ❌ *Mal:*
     ```python
     # Retorna el texto en minúsculas
     return text.lower()
     ```
   *  *Bien:* No colocar comentario; el código ya se explica solo.
3. **Comentar justificaciones clave para la defensa oral:**
   *  *Ejemplo ideal:*
     ```python
     # Conservamos las negaciones ('no', 'nunca', 'sin') en las stop words
     # porque eliminarlas invierte la polaridad del sentimiento en la reseña.
     custom_stop_words = [w for w in spanish_stop_words if w not in NEGATION_WORDS]
     ```
4. **Formato:** Máximo 1 o 2 líneas breves en español neutro y técnico justo encima de la línea que lo requiere.

---

## 3. Tipado Estático y Docstrings Concisos

Para facilitar la navegación en el IDE y evitar errores de tipos:
* **Uso de Type Hints:** En todas las funciones públicas.
* **Docstring conciso (formato Google o NumPy simplificado):**
  ```python
  def preprocess_review(text: str, use_lemmatization: bool = True) -> str:
      """
      Limpia el texto crudo y aplica lematización o stemming según la configuración.

      Args:
          text: Cadena con la reseña original del cliente.
          use_lemmatization: Si es True aplica lemas (spaCy); si es False aplica raíces (NLTK).

      Returns:
          Texto preprocesado listo para vectorización con TF-IDF.
      """
  ```

---

## 4. Modularidad y Responsabilidad Única (SRP)

* **Funciones cortas y enfocadas:** Cada función debe realizar una única tarea y tener idealmente entre 5 y 25 líneas.
* **Desacoplamiento estricto de capas:**
  * El módulo de preprocesamiento (`src/nlp/`) no debe tener dependencias de la API (`FastAPI`) ni del frontend.
  * La API solo recibe peticiones, invoca al pipeline serializado y entrega JSON.
  * El frontend solo renderiza la respuesta de la API.

---

## 5. Preparación para la "Modificación en Vivo"

Cualquier parámetro susceptible de ser cuestionado o cambiado por el docente (umbral de probabilidad, stop words, rango de n-gramas, tipo de algoritmo) debe estar centralizado en un archivo de configuración (`src/config.py`) o como argumento por defecto de la función:

* ❌ *Mal:* `TfidfVectorizer(ngram_range=(1, 2), max_features=5000)` quemado en medio de un archivo gigante.
*  *Bien:* 
  ```python
  from src.config import NGRAM_RANGE, MAX_FEATURES
  vectorizer = TfidfVectorizer(ngram_range=NGRAM_RANGE, max_features=MAX_FEATURES)
  ```
Esto garantiza que si el docente pide *"cámbienlo a unigramas y reentrenen"*, el cambio se haga en **3 segundos** editando un solo archivo.
