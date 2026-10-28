# Plan Maestro y Cronograma de Implementación (Versión 2.0)
## Proyecto Integrador: Sentix-Hotel

**Materia:** Tópicos y Programación Avanzada  
**Ventana de Desarrollo:** Martes 27 de octubre al Domingo 1 de noviembre de 2026  
**Fecha de Entrega Oficial:** Lunes 2 de noviembre, 23:59 (Etiqueta `entrega-final`)  
**Fecha de Exposición y Defensa:** Martes 3 de noviembre  
**Equipo de Desarrollo:** Javier, José y Gabriel  

---

## 1. Principio Rector: Responsabilidad Compartida y Dominio Integral

El esquema de evaluación docente pondera un **40% de nota grupal** y un **60% de nota individual** (evaluando commits en el repositorio, defensa oral de cualquier parte del sistema y la modificación en vivo).

Por tanto, el proyecto se organiza bajo dos pilares:
1. **Liderazgo Técnico de Componente:** Cada integrante lidera e implementa módulos específicos e independientes para reflejar una autoría clara, constante y sustancial en el historial de Git (con commits distribuidos equitativamente tanto en NLP como en Machine Learning).
2. **Revisión Cruzada y Conocimiento Total:** Todo el código se integra mediante Pull Requests (PRs) que son revisados por los compañeros. Al finalizar cada jornada y durante el simulacro de integración, **los tres integrantes deben comprender con precisión cómo funciona cada línea de código**, asegurando que cualquiera pueda responder las preguntas del docente o ejecutar la modificación en vivo asignada.

---

## 2. Cronograma de Implementación Día a Día

```mermaid
gantt
    title Cronograma de Desarrollo Sentix-Hotel (v2.0)
    dateFormat  YYYY-MM-DD
    section Javier
    Base del Repositorio, Dataset y Config      :done, j1, 2026-10-27, 1d
    Stopwords con Negación y Pipeline Core      :active, j2, 2026-10-28, 1d
    Regresión Logística con GridSearchCV        :j3, 2026-10-29, 1d
    Serialización Joblib y FastAPI Base         :j4, 2026-10-30, 1d
    Endpoints Avanzados (/nlp-steps) y Tests    :j5, 2026-10-31, 1d
    Integración E2E y Simulacro de Defensa      :j6, 2026-11-01, 1d

    section José
    Capa de Datos: EDA y Split Estratificado    :s1, 2026-10-28, 1d
    NLP: Vectorización TF-IDF y N-gramas        :s2, 2026-10-29, 1d
    ML: Métricas, Matriz de Confusión y Errores :s3, 2026-10-30, 1d
    Frontend: Entrada de Reseñas y Sentimiento  :s4, 2026-10-31, 1d
    Integración E2E y Registro CONTRIBUCIONES   :s5, 2026-11-01, 1d

    section Gabriel
    NLP: Normalización y Tokenización           :g1, 2026-10-28, 1d
    NLP: Comparativa Stemming vs Lematización   :g2, 2026-10-29, 1d
    ML: Modelo Random Forest y Tuning           :g3, 2026-10-30, 1d
    Frontend: Visualizador NLP y Dashboard      :g4, 2026-10-31, 1d
    Integración E2E y Documentación README      :g5, 2026-11-01, 1d
```

---

### Martes 27 de Octubre (Hoy): Configuración y Cimientos del Proyecto
* **Líder de la jornada:** **Javier**
* **Objetivo:** Dejar desplegada la base del proyecto, el dataset y el entorno para que José y Gabriel comiencen sus módulos inmediatamente.
* **Entregables:**
  1. Inicialización del repositorio en GitHub con invitaciones a José, Gabriel y al docente como colaborador.
  2. Creación de la estructura de carpetas estándar (`data/`, `notebooks/`, `src/nlp/`, `src/models/`, `api/`, `frontend/`, `tests/`, `docs/`).
  3. Congelamiento de dependencias en `requirements.txt` (`pandas`, `scikit-learn`, `nltk`, `spacy`, `fastapi`, `uvicorn`, `pydantic`, `pytest`, `joblib`).
  4. Descarga y preparación del dataset de reseñas de hospedaje en español en `data/raw/hotel_reviews_es.csv`.
  5. Archivo de configuración centralizada `src/config.py` con constantes fijas (`RANDOM_STATE = 42`, rutas y parámetros).

---

### Miércoles 28 de Octubre: Capa 1 (Datos & EDA) y Capa 2A (Limpieza NLP)
* **Objetivo:** Conocer a profundidad las características estadísticas del texto y construir los módulos base de preprocesamiento.
* **Tareas Asignadas:**
  * **José (Capa de Datos y EDA):**
    * *Archivo:* `notebooks/01_eda_exploratorio.ipynb`
    * *Tareas:* Carga de datos, análisis de valores faltantes, visualización del balance de clases (Positivas vs. Negativas), distribución de longitud de textos (palabras y caracteres), cálculo de términos más comunes y partición estratificada 80/20 train/test fijando `random_state=42`.
  * **Gabriel (Capa de NLP - Normalización y Tokenización):**
    * *Archivo:* `src/nlp/normalizer.py` y `src/nlp/tokenizer.py`
    * *Tareas:* Implementar funciones para conversión a minúsculas, eliminación de etiquetas HTML/URLs, tratamiento de puntuación, conservación de tildes o normalización justificada, y segmentación léxica de tokens.
  * **Javier (Capa de NLP - Stop Words y Pipeline Base):**
    * *Archivo:* `src/nlp/stopwords.py` y `src/nlp/pipeline.py`
    * *Tareas:* Depuración de stop words en español reteniendo de forma estricta las palabras de negación (`no`, `nunca`, `jamás`, `tampoco`, `sin`), y clase preliminar `TextPreprocessor` que conecta normalizador + tokenizador + stopwords.
* **Revisión Cruzada:** Al finalizar, revisión y aprobación conjunta de Pull Requests.

---

### Jueves 29 de Octubre: Capa 2B (Morfología, TF-IDF) y Capa 3A (Modelo Lineal)
* **Objetivo:** Ejecutar las dos comparaciones obligatorias de NLP exigidas por el docente y entrenar el primer modelo.
* **Tareas Asignadas:**
  * **Gabriel (Capa de NLP - Stemming vs. Lematización):**
    * *Archivo:* `src/nlp/morphology.py`
    * *Tareas:* Implementar reducción por raíces con `SnowballStemmer` (NLTK) y reducción por lemas con `es_core_news_sm` (spaCy). Construir la tabla comparativa con ejemplos de reseñas antes/después para defender la elección en la exposición.
  * **José (Capa de NLP - Vectorización TF-IDF y N-gramas):**
    * *Archivo:* `src/nlp/vectorizer.py`
    * *Tareas:* Configuración de `TfidfVectorizer` parametrizado desde `src/config.py`. Implementar la función de experimento para contrastar Unigramas `(1,1)` vs. Unigramas + Bigramas `(1,2)` documentando `max_features=5000` y `sublinear_tf=True`.
  * **Javier (Capa de Machine Learning - Regresión Logística):**
    * *Archivo:* `src/models/logistic_regression.py`
    * *Tareas:* Entrenamiento del modelo lineal con `GridSearchCV` (5-fold estratificado sobre el hiperparámetro `C`), extracción de coeficientes de mayor impacto positivo y negativo para interpretabilidad del modelo.
* **Revisión Cruzada:** Explicación técnica de 10 minutos entre los 3 para entender cómo interactúan los lemas con los n-gramas y los coeficientes lineales.

---

### Viernes 30 de Octubre: Capa 3B (Segundo Modelo, Evaluación) y Capa 4A (API Base)
* **Objetivo:** Enfrentar ambos modelos de Machine Learning, documentar métricas y montar el backend REST.
* **Tareas Asignadas:**
  * **Gabriel (Capa de Machine Learning - Random Forest Classifier):**
    * *Archivo:* `src/models/random_forest.py`
    * *Tareas:* Implementación y ajuste de hiperparámetros del modelo de ensamble (`n_estimators`, `max_depth`, `random_state=42`). Registro de tiempos de cómputo y comparación conceptual frente al modelo lineal.
  * **José (Capa de Evaluación y Análisis de Errores):**
    * *Archivo:* `src/models/evaluate.py` y `notebooks/02_experimentos_modelos.ipynb`
    * *Tareas:* Cálculo de métricas sobre el conjunto de test aislado (Accuracy, Precision, Recall, $F_1$-score), generación de matrices de confusión ($2 \times 2$) y documentación analítica de 5 casos específicos donde los modelos fallen.
  * **Javier (Serialización y Capa de Backend API):**
    * *Archivo:* `src/models/train.py`, `models/sentix_pipeline.joblib`, `api/main.py`
    * *Tareas:* Script reproducible de entrenamiento completo que serializa el pipeline ganador con `joblib`. Inicialización de `FastAPI` con middleware CORS, carga del modelo serializado y endpoints `/api/health` y `/api/predict`.
* **Revisión Cruzada:** Revisión de las matrices de confusión y justificación técnica del modelo que quedará en producción.

---

### Sábado 31 de Octubre: Capa 4B (API Avanzada) y Capa 5 (Frontend Web)
* **Objetivo:** Dejar la API completamente blindada con validaciones y la interfaz web interactiva de punta a punta.
* **Tareas Asignadas:**
  * **Javier (Capa de Backend - Endpoints Avanzados y Pruebas):**
    * *Archivo:* `api/schemas.py`, `api/routes/`, `tests/test_api.py`
    * *Tareas:* Esquemas Pydantic con validación de entradas (rechazo de textos vacíos o límites de longitud con código HTTP 422), endpoint `POST /api/nlp-steps` (para el desglose paso a paso), endpoint `GET /api/metrics` y suite de tests con `pytest`.
  * **José (Capa de Frontend - Entrada de Reseñas y Sentimiento):**
    * *Archivo:* `frontend/src/components/ReviewInput.jsx` y `frontend/src/components/SentimentResult.jsx`
    * *Tareas:* Formulario interactivo con ejemplos precargados y soporte para archivo CSV, llamada asíncrona a `/api/predict`, badge dinámico de sentimiento (Positivo/Negativo) y barra porcentual de confianza.
  * **Gabriel (Capa de Frontend - Visualizador NLP y Métricas):**
    * *Archivo:* `frontend/src/components/NlpPipelineView.jsx` y `frontend/src/components/MetricsDashboard.jsx`
    * *Tareas:* Componente visual que consume `/api/nlp-steps` y dibuja las cajas de transformación del texto (Original $\to$ Normalizado $\to$ Tokens $\to$ Sin Stopwords $\to$ Lematizado), y panel de métricas con la matriz de confusión.
* **Revisión Cruzada:** Prueba de integración local levantando backend y frontend al unísono.

---

### Domingo 1 de Noviembre: Integración E2E, Simulacro de Defensa y Cierre
* **Objetivo:** Probar el sistema completo de punta a punta y blindar a los 3 integrantes para la presentación.
* **Tareas Conjuntas:**
  1. **Pruebas de Sistema Completo:** Verificación de predicciones individuales y por lotes en la interfaz web consumiendo la API de FastAPI.
  2. **Documentación Oficial:**
     * **José:** Redacción de `CONTRIBUCIONES.md` detallando las tareas y commits de cada integrante en estricta concordancia con el historial de Git.
     * **Gabriel:** Redacción de `README.md` con instrucciones claras para clonar, instalar dependencias y levantar backend y frontend desde cero.
     * **Javier:** Informe técnico preliminar en `docs/informe_tecnico.md`.
  3. **Simulacro de "Modificación en Vivo" (15 pts individuales):**
     * Cada integrante ensaya un cambio en vivo en menos de 2 minutos sobre `src/config.py` o la API:
       * **José:** Cambiar rango de n-gramas a solo unigramas `(1, 1)` y mostrar el impacto en métricas.
       * **Gabriel:** Cambiar el flag `USE_LEMMATIZATION = False` para usar stemming y añadir una nueva stopword.
       * **Javier:** Variar el hiperparámetro de regularización `C` o añadir una validación extra en la API.
  4. **Preparación de Rama de Entrega:** Asegurar que todos los PRs estén integrados en `main` sin errores ni advertencias.

---

### Lunes 2 de Noviembre: Día de Amortiguamiento (Buffer Day) y Entrega Final
* Preparación de diapositivas de la presentación grupal.
* Verificación final de que cada integrante tenga sus commits limpios y bien atribuidos en Git.
* Creación y push del tag evaluable antes de las 23:59:
  ```bash
  git tag -a entrega-final -m "Versión oficial evaluable - Proyecto Sentix-Hotel"
  git push origin entrega-final
  ```

---

## 3. Protocolo de Git y GitHub (Antibloqueos y Cero Colisiones)

Para trabajar de manera fluida, sin pisarse el código y garantizando la trazabilidad exigida por el docente:

### 1. Reglas Fundamentales
* **`main` está protegida:** Nadie sube cambios directamente a la rama principal. Todo cambio entra mediante Pull Request revisado y aprobado.
* **Identidad personal configurada:** Antes de realizar el primer commit, cada integrante debe verificar en su terminal:
  ```bash
  git config user.name "Tu Nombre Completo"
  git config user.email "tu_correo@universidad.edu"
  ```
  *(El docente evaluará los correos y usuarios para la nota individual).*
* **Historial inmutable:** Queda prohibido el `git push --force` y los squash masivos que borren los nombres de los autores.

### 2. Nomenclatura de Ramas
Cada tarea se desarrolla en una rama independiente: `feature/<nombre>-<tarea>`
* Ejemplos:
  * `feature/javier-repo-base`
  * `feature/jose-eda-notebook`
  * `feature/gabriel-nlp-normalizer`
  * `feature/jose-tfidf-vectorizer`
  * `feature/gabriel-morphology-stem-lemma`
  * `feature/javier-fastapi-backend`

### 3. Ciclo de Trabajo Diario
```bash
# 1. Actualizar main local
git checkout main
git pull origin main

# 2. Crear y cambiar a la rama de la tarea
git checkout -b feature/jose-eda-notebook

# 3. Desarrollar y verificar localmente en los archivos asignados
# 4. Registrar los cambios con formato Conventional Commits
git add notebooks/01_eda_exploratorio.ipynb
git commit -m "feat(eda): analisis exploratorio y division estratificada de datos"

# 5. Subir la rama a GitHub
git push -u origin feature/jose-eda-notebook

# 6. Abrir Pull Request en GitHub para revisión y merge a main
```

---

## 4. Matriz de Cumplimiento de la Rúbrica por Integrante

| Integrante | Aporte Principal en NLP | Aporte Principal en Machine Learning | Capa de Sistema Asociada |
| :--- | :--- | :--- | :--- |
| **Javier** | Stopwords con retención de negación y Pipeline unificado | Modelo Lineal (Regresión Logística + GridSearchCV) | Backend REST (FastAPI) e Integración |
| **José** | Vectorización TF-IDF y Comparativa Unigramas vs. Bigramas | Evaluación Comparativa, Métricas ($F_1$) y Matriz de Confusión | Capa de Datos (EDA) y Entrada Frontend |
| **Gabriel** | Normalización, Tokenización y Comparativa Stemming vs. Lematización | Modelo de Ensamble (Random Forest Classifier) | Visualizador NLP Frontend y Dashboard |

Todos los integrantes cubren componentes sustanciales de NLP y Machine Learning, asegurando una nota individual sobresaliente y un conocimiento transversal del proyecto.
