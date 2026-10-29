# Tablero de Tareas y Plan de Implementación Flexible (v3.0)
## Proyecto Integrador: Sentix-Hotel

**Materia:** Tópicos y Programación Avanzada  
**Modalidad de Trabajo:** Tablero dinámico de tareas (Kanban / Backlog colaborativo)  
**Fecha Límite de Entrega:** Lunes 2 de noviembre de 2026, 23:59 (Tag `entrega-final`)  
**Fecha de Exposición:** Martes 3 de noviembre  
**Equipo:** Javier, José y Gabriel  

---

## 1. Filosofía del Tablero y Regla de Oro de Evaluación

> **Flexibilidad Total con Responsabilidad Individual:**  
> No hay asignaciones forzadas por día ni por persona. **Cualquier integrante puede tomar cualquier tarea que esté en estado `[PENDIENTE]`** según sus tiempos y disponibilidad.
> 
> **Requisito obligatorio de la rúbrica docente (60% nota individual):**  
> Para asegurar la máxima calificación individual, **cada uno de los 3 integrantes debe elegir y completar al menos una tarea con el tag `[RÚBRICA NLP]` y al menos una tarea con el tag `[RÚBRICA ML]`**. El resto de tareas (datos, backend, frontend, tests y documentación) se eligen libremente.

---

## 2. Flujo de Trabajo para Tomar una Tarea

1. **Elegir:** Revisa el tablero y selecciona una tarea en estado `[PENDIENTE]`.
2. **Crear Rama:** En tu terminal, crea tu rama de trabajo con tu nombre y el identificador de la tarea:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/<tu-nombre>-<id-tarea>
   # Ejemplo: git checkout -b feature/jose-eda-notebook
   ```
3. **Desarrollar:** Trabaja exclusivamente en los archivos indicados en la ficha de la tarea.
4. **Verificar:** Ejecuta los comandos de prueba indicados en el *Criterio de Aceptación*.
5. **Subir y PR:** Haz commit con formato Conventional Commits y abre Pull Request en GitHub:
   ```bash
   git add <archivos-modificados>
   git commit -m "feat(<modulo>): descripcion clara de lo realizado"
   git push -u origin feature/<tu-nombre>-<id-tarea>
   ```
6. **Completar:** Una vez revisado y mergeado por un compañero, la tarea pasa a `[COMPLETADA]`.

---

## 3. Matriz Visual de Tareas y Estado General

```
[ P0: FUNDACIÓN Y PREPROCESAMIENTO NLP ]
├── TASK-CORE-01: Estructura base, config y requirements.txt ──────── [COMPLETADA]
├── TASK-DATA-01: Dataset limpio de 4.468 reseñas en español ─────── [COMPLETADA]
├── TASK-DATA-02: Notebook 01 de Análisis Exploratorio (EDA) ──────── [PENDIENTE]
├── TASK-NLP-01: Normalización de texto y limpieza de caracteres ─── [COMPLETADA]
├── TASK-NLP-02: Tokenización léxica especializada ───────────────── [COMPLETADA]
├── TASK-NLP-03: Stopwords con retención estricta de negaciones ──── [COMPLETADA]
├── TASK-NLP-04: Comparativa morfológica: Stemming vs Lematización ─ [PENDIENTE]
└── TASK-NLP-05: Vectorización TF-IDF y comparativa de N-gramas ──── [PENDIENTE]

[ P1: MODELADO DE MACHINE LEARNING Y EVALUACIÓN ]
├── TASK-ML-01: Regresión Logística con GridSearchCV e interpretabilidad [COMPLETADA]
├── TASK-ML-02: Modelo de Ensamble: Random Forest Classifier y Tuning ── [PENDIENTE]
├── TASK-ML-03: Módulo de evaluación, métricas F1 y Matriz de Confusión ─ [COMPLETADA]
├── TASK-ML-04: Script reproducible de entrenamiento y serialización ─── [COMPLETADA]
└── TASK-ML-05: Análisis cualitativo de 5 casos de error del modelo ──── [PENDIENTE]

[ P1: BACKEND API REST (FASTAPI) ]
├── TASK-API-01: Servidor FastAPI, schemas Pydantic y CORS ────────────── [COMPLETADA]
├── TASK-API-02: Endpoints /predict, /nlp-steps, /metrics y /health ───── [COMPLETADA]
└── TASK-API-03: Suite de pruebas unitarias y de integración (pytest) ─── [COMPLETADA]

[ P2: FRONTEND WEB INTERACTIVO ]
├── TASK-UI-01: Interfaz web base con simulador de reseñas y badges ───── [COMPLETADA]
├── TASK-UI-02: Visualizador interactivo del pipeline paso a paso ─────── [COMPLETADA]
├── TASK-UI-03: Carga por lotes (archivo CSV) con tabla masiva ────────── [COMPLETADA]
└── TASK-UI-04: Panel de control de métricas y Matriz de Confusión 2x2 ── [COMPLETADA]

[ P3: INTEGRACIÓN, DOCUMENTACIÓN Y SIMULACRO DE DEFENSA ]
├── TASK-DOC-01: Documento oficial CONTRIBUCIONES.md (concordancia Git) ── [EN PROGRESO]
├── TASK-DOC-02: Documento oficial README.md con guía de ejecución ────── [COMPLETADA]
├── TASK-DOC-03: Informe técnico formal en docs/informe_tecnico.md ─────── [PENDIENTE]
└── TASK-DEF-01: Simulacro de "Modificación en Vivo" para cada integrante [PENDIENTE]
```

---

## 4. Fichas Detalladas de Tareas Disponibles

---

### BLOQUE: DATOS Y ANÁLISIS EXPLORATORIO (EDA)

#### `TASK-DATA-02`: Ejecución y Documentación del Notebook de EDA
* **Prioridad:** **Alta (P0)**
* **Estado:** `[PENDIENTE]`
* **Capa:** Capa 1 (Datos y EDA)
* **Tag de Rúbrica:** `[Capa de Datos]`
* **Rama recomendada:** `feature/<nombre>-eda-notebook`
* **Archivos asociados:** [`notebooks/01_eda_exploratorio.ipynb`](file:///d:/universidad/electivas/Topicos/proyecto1/notebooks/01_eda_exploratorio.ipynb)
* **Descripción técnica:**
  1. Abrir y ejecutar el notebook `notebooks/01_eda_exploratorio.ipynb`.
  2. Verificar los gráficos de balanceo de clases (positivas vs. negativas).
  3. Analizar la distribución de longitud de palabras y caracteres (destacar si los clientes insatisfechos escriben más texto).
  4. Extraer el top 20 de palabras más comunes antes de la limpieza.
  5. Ejecutar la celda de partición estratificada 80/20 (`train_test_split` con `random_state=42`) y verificar que se generen los CSV en `data/processed/`.
  6. Escribir conclusiones interpretativas en celdas de Markdown para la defensa.
* **Criterio de Aceptación:**
  * El notebook se ejecuta de arriba a abajo sin errores (`Kernel -> Restart & Run All`).
  * Los archivos `data/processed/train_reviews.csv` y `data/processed/test_reviews.csv` quedan generados.

---

### BLOQUE: PROCESAMIENTO DE LENGUAJE NATURAL (NLP)

#### `TASK-NLP-04`: Comparativa Morfológica: Stemming vs. Lematización
* **Prioridad:** **Alta (P0)**
* **Estado:** `[PENDIENTE]`
* **Capa:** Capa 2 (NLP)
* **Tag de Rúbrica:** `[RÚBRICA NLP - OBLIGATORIO DOCENTE]`
* **Rama recomendada:** `feature/<nombre>-morphology-stem-lemma`
* **Archivos asociados:** [`src/nlp/morphology.py`](file:///d:/universidad/electivas/Topicos/proyecto1/src/nlp/morphology.py), [`tests/test_nlp.py`](file:///d:/universidad/electivas/Topicos/proyecto1/tests/test_nlp.py)
* **Descripción técnica:**
  1. Revisar la función `compare_stem_vs_lemma()` en `src/nlp/morphology.py`.
  2. Crear una prueba o función de demostración que tome 5 oraciones típicas de hoteles (ej. *"habitaciones cómodas"*, *"el personal atendió amablemente"*, *"estuvimos descansando"*).
  3. Generar una tabla comparativa término a término mostrando:
     * Palabra original $\to$ Raíz truncada por Stemming (NLTK) $\to$ Lema canónico por Lematización (spaCy).
  4. Redactar una breve justificación técnica en el archivo (o en `docs/`): explicar por qué la lematización es superior semánticamente en español frente al truncamiento tosco del stemming.
* **Criterio de Aceptación:**
  * La función retorna ejemplos claros y verificables.
  * Se añade un test unitario en `tests/test_nlp.py` que verifique la comparativa y pase con `python -m pytest tests/test_nlp.py`.

---

#### `TASK-NLP-05`: Vectorización TF-IDF y Comparativa Unigramas vs. Bigramas
* **Prioridad:** **Alta (P0)**
* **Estado:** `[PENDIENTE]`
* **Capa:** Capa 2 (NLP)
* **Tag de Rúbrica:** `[RÚBRICA NLP - OBLIGATORIO DOCENTE]`
* **Rama recomendada:** `feature/<nombre>-tfidf-ngrams`
* **Archivos asociados:** [`src/nlp/vectorizer.py`](file:///d:/universidad/electivas/Topicos/proyecto1/src/nlp/vectorizer.py), [`src/config.py`](file:///d:/universidad/electivas/Topicos/proyecto1/src/config.py)
* **Descripción técnica:**
  1. En `src/nlp/vectorizer.py`, completar la función `compare_ngrams_vocabulary(corpus)`.
  2. Ajustar un vectorizador con solo unigramas `(1, 1)` y otro con unigramas + bigramas `(1, 2)` usando las reseñas de `data/processed/train_reviews.csv`.
  3. Extraer y mostrar ejemplos de bigramas altamente informativos capturados (ej. *"buen servicio"*, *"mala atención"*, *"no recomiendo"*, *"habitacion sucia"*).
  4. Demostrar cómo los bigramas permiten capturar modificadores + sustantivos que un unigrama aislado pierde.
* **Criterio de Aceptación:**
  * La función devuelve el conteo de vocabulario y ejemplos reales de bigramas del dataset.
  * Añadir un test en `tests/test_nlp.py` que valide la extracción de n-gramas.

---

### BLOQUE: MACHINE LEARNING Y EVALUACIÓN

#### `TASK-ML-02`: Implementación y Calibración de Random Forest Classifier
* **Prioridad:** **Media (P1)**
* **Estado:** `[PENDIENTE]`
* **Capa:** Capa 3 (Machine Learning)
* **Tag de Rúbrica:** `[RÚBRICA ML - OBLIGATORIO DOCENTE]`
* **Rama recomendada:** `feature/<nombre>-random-forest-model`
* **Archivos asociados:** [`src/models/random_forest.py`](file:///d:/universidad/electivas/Topicos/proyecto1/src/models/random_forest.py), [`src/config.py`](file:///d:/universidad/electivas/Topicos/proyecto1/src/config.py)
* **Descripción técnica:**
  1. En `src/models/random_forest.py`, afinar `train_random_forest_cv()` usando `RandomForestClassifier` y `GridSearchCV` sobre `train_reviews.csv`.
  2. Evaluar el modelo sobre `test_reviews.csv` calculando Accuracy y $F_1$-score.
  3. Comparar contra la Regresión Logística (analizar tiempo de entrenamiento vs. desempeño).
  4. Extraer la importancia de características (`feature_importances_`) para ver qué palabras pesan más en los árboles.
* **Criterio de Aceptación:**
  * El script entrena el Random Forest sin errores.
  * Registra las métricas comparativas frente al modelo lineal para documentar en el informe técnico.

---

#### `TASK-ML-05`: Análisis Cualitativo de Errores del Modelo
* **Prioridad:** **Media (P1)**
* **Estado:** `[PENDIENTE]`
* **Capa:** Capa 3 (Machine Learning)
* **Tag de Rúbrica:** `[RÚBRICA ML - OBLIGATORIO DOCENTE]`
* **Rama recomendada:** `feature/<nombre>-error-analysis`
* **Archivos asociados:** [`src/models/evaluate.py`](file:///d:/universidad/electivas/Topicos/proyecto1/src/models/evaluate.py), [`docs/informe_tecnico.md`](file:///d:/universidad/electivas/Topicos/proyecto1/docs/)
* **Descripción técnica:**
  1. Ejecutar la función `find_error_cases()` en `src/models/evaluate.py` sobre el conjunto de test.
  2. Seleccionar 5 casos concretos donde el modelo se equivocó (ej. un Falso Positivo y un Falso Negativo).
  3. Redactar el análisis del **por qué falló el modelo** en cada caso:
     * ¿Fue por sarcasmo / ironía? (ej. *"Maravilloso si te gusta esperar dos horas en recepción"*).
     * ¿Fue por opiniones mixtas con muchas palabras positivas pero que concluyen negativo?
     * ¿Fue por errores ortográficos o modismos no capturados por el vocabulario TF-IDF?
* **Criterio de Aceptación:**
  * Documentar los 5 casos con su texto, etiqueta real, etiqueta predicha y explicación técnica en `models/metrics_report.json` o en `docs/informe_tecnico.md`.

---

### BLOQUE: CIERRE, DOCUMENTACIÓN Y DEFENSA

#### `TASK-DOC-03`: Elaboración del Informe Técnico Oficial
* **Prioridad:** **Media (P2)**
* **Estado:** `[PENDIENTE]`
* **Capa:** Documentación
* **Tag de Rúbrica:** `[Evaluación Grupal - Documentación]`
* **Rama recomendada:** `feature/<nombre>-informe-tecnico`
* **Archivos asociados:** `docs/informe_tecnico.md`
* **Descripción técnica:**
  1. Redactar el informe técnico en base a los documentos de decisión ya existentes en `doc/outputs/`.
  2. Secciones obligatorias según pauta:
     * Descripción del problema y del dataset (origen, volumen, balance 50/50).
     * Decisiones técnicas de NLP (justificación de stopwords con negación, tabla Stemming vs Lematización, N-gramas).
     * Tabla comparativa de modelos (Regresión Logística vs. Random Forest).
     * Análisis cualitativo de errores.
     * Arquitectura del sistema de 5 capas (con el diagrama Mermaid).
* **Criterio de Aceptación:**
  * Informe técnico en Markdown completo, conciso y listo para el docente.

---

#### `TASK-DEF-01`: Simulacro de "Modificación en Vivo" (15 Puntos Individuales)
* **Prioridad:** **Crítica (P3 - Domingo 1 Nov)**
* **Estado:** `[PENDIENTE]`
* **Capa:** Preparación para la Defensa
* **Tag de Rúbrica:** `[Evaluación Individual - Modificación en Vivo]`
* **Participantes:** Javier, José y Gabriel (los 3 ensayan)
* **Descripción técnica:**
  * Simular las preguntas que hará el docente el día de la presentación y verificar que cada uno pueda hacer el cambio en menos de 2 minutos:
    * **Simulacro 1 (NLP Stopwords):** Agregar una stopword al arreglo `CUSTOM_STOPWORDS` en `src/config.py` (ej. `"hotel"`, `"playa"`), reentrenar con `python -m src.models.train` y mostrar cómo cambia el vocabulario en la API.
    * **Simulacro 2 (NLP N-gramas o Lematización):** Cambiar `USE_LEMMATIZATION = False` en `src/config.py` para usar stemming, o cambiar `NGRAM_RANGE = (1, 1)` para usar solo unigramas, y verificar que las métricas se recalculen.
    * **Simulacro 3 (API / Backend):** Agregar una regla de validación en `api/schemas.py` (ej. rechazar textos de menos de 5 palabras) o cambiar el umbral de decisión a `0.60`.
    * **Simulacro 4 (Frontend):** Mostrar un dato adicional en la tarjeta de resultados o cambiar el estilo de un badge.
* **Criterio de Aceptación:**
  * Los 3 integrantes ejecutan su modificación en vivo con soltura, realizan el commit y explican el cambio con propiedad.

---

## 5. Tabla de Registro de Elección de Tareas (Para que el equipo anote sus nombres)

| ID Tarea | Nombre de la Tarea | Tag de Rúbrica | Asignado a | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `TASK-CORE-01` | Estructura base, config y requirements.txt | Core / Setup | Javier | ✅ Completada |
| `TASK-DATA-01` | Dataset de 4.468 reseñas hoteleras balanceadas | Capa de Datos | Javier | ✅ Completada |
| `TASK-NLP-01` | Normalización y limpieza de texto | NLP Base | Gabriel | ✅ Completada |
| `TASK-NLP-02` | Tokenización léxica especializada | NLP Base | Gabriel | ✅ Completada |
| `TASK-NLP-03` | Stopwords con retención estricta de negaciones | [RÚBRICA NLP] | Javier | ✅ Completada |
| `TASK-ML-01` | Regresión Logística con GridSearchCV | [RÚBRICA ML] | Javier | ✅ Completada |
| `TASK-API-01` | Backend FastAPI, esquemas Pydantic y CORS | Backend REST | Javier | ✅ Completada |
| `TASK-API-02` | Endpoints `/predict`, `/nlp-steps`, `/metrics` | Backend REST | Javier | ✅ Completada |
| `TASK-UI-01` | Frontend interactivo y visualizador de NLP | Frontend Web | Javier | ✅ Completada |
| `TASK-DATA-02` | **Ejecución y Documentación del Notebook de EDA** | **Capa de Datos** | *Disponible* | ⏳ Pendiente |
| `TASK-NLP-04` | **Comparativa Stemming vs. Lematización** | **[RÚBRICA NLP]** | *Disponible* | ⏳ Pendiente |
| `TASK-NLP-05` | **TF-IDF y Comparativa Unigramas vs. Bigramas** | **[RÚBRICA NLP]** | *Disponible* | ⏳ Pendiente |
| `TASK-ML-02` | **Random Forest Classifier y Tuning** | **[RÚBRICA ML]** | *Disponible* | ⏳ Pendiente |
| `TASK-ML-05` | **Análisis Cualitativo de 5 Casos de Error** | **[RÚBRICA ML]** | *Disponible* | ⏳ Pendiente |
| `TASK-DOC-03` | **Informe Técnico Oficial en `docs/`** | **Documentación** | *Disponible* | ⏳ Pendiente |
| `TASK-DEF-01` | **Simulacro de Modificación en Vivo (Los 3)** | **Defensa Oral** | *Todos* | ⏳ Pendiente |
