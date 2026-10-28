# Documento Maestro: Análisis de Requerimientos y Definición del Proyecto Integrador

**Materia:** Tópicos y Programación Avanzada  
**Nivel:** Primer Parcial  
**Modalidad:** Proyecto Integrador Grupal (3 a 4 integrantes)  
**Fecha de Entrega:** Día anterior a la presentación, 23:59 (etiqueta `entrega-final`)  
**Fecha de Presentación:** 3 de noviembre  

---

## 1. Desglose Exhaustivo de Requerimientos y Restricciones

El proyecto consiste en el desarrollo de una aplicación web completa basada en texto que abarca desde la adquisición y análisis exploratorio de datos crudos hasta una interfaz de usuario interactiva, atravesando un pipeline reproducible de NLP, entrenamiento de modelos de Machine Learning y una API REST desacoplada.

### 1.1. Las 5 Capas Obligatorias del Sistema

```
┌────────────────────────────────────────────────────────┐
│  1. CAPA DE DATOS Y EDA (Análisis Exploratorio)        │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  2. CAPA DE PIPELINE DE NLP (Reproducible)             │
│     Normalización ➔ Tokenización ➔ Stop Words ➔        │
│     Stemming/Lematización ➔ N-gramas ➔ TF-IDF          │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│  3. CAPA DE MODELOS DE MACHINE LEARNING                │
│     Entrenamiento, Tuning CV, Comparación, Serializado │
└───────────────────────────┬────────────────────────────┘
                            │ Artefactos (.joblib)
┌───────────────────────────▼────────────────────────────┐
│  4. CAPA DE BACKEND (API REST - FastAPI)               │
│     Carga artefactos, valida inputs, expone endpoints  │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON
┌───────────────────────────▼────────────────────────────┐
│  5. CAPA DE FRONTEND (Interfaz Web)                    │
│     Predicción, paso a paso de NLP, panel de métricas  │
└────────────────────────────────────────────────────────┘
```

#### Capa 1: Datos y Análisis Exploratorio (EDA)
* **Dataset:** Dominio en español (mínimo ~1.000 registros etiquetados). Origen, licencia y fecha de recolección documentados.
* **EDA obligatorio:** 
  * Distribución y balanceo de clases.
  * Longitud de textos (distribución de caracteres y palabras).
  * Frecuencia de términos más comunes.
  * Análisis de valores nulos o atípicos.
* **Partición de datos:** División `Train` / `Test` estratificada con semilla fija (`random_state`). El conjunto de prueba queda aislado y jamás se toca durante el ajuste de hiperparámetros.
* **Tratamiento de desbalance:** Justificación técnica en caso de presentarse (técnicas de remuestreo, ponderación de clases `class_weight`, o métricas balanceadas como $F_1$-score macro/weighted).

#### Capa 2: Pipeline de Preprocesamiento NLP
Cada fase debe implementarse, justificarse y permitir visualización antes/después:
1. **Normalización:** Tratamiento de minúsculas, tildes, signos de puntuación, caracteres especiales, números, URLs y emojis (justificar explícitamente qué se conserva y qué se descarta).
2. **Tokenización:** Segmentación léxica con casos especiales del dominio.
3. **Stop Words:** Lista depurada en español. Justificar adiciones o eliminaciones clave (por ejemplo, preservar negaciones como *"no"*, *"nunca"*, *"sin"*).
4. **Stemming vs. Lematización:** **Requisito estricto:** Implementar ambos métodos, comparar su efecto directo en las métricas del modelo y justificar con evidencia empírica cuál queda en la versión final.
5. **N-gramas:** Comparar obligatoriamente unigramas `(1,1)` frente a unigramas + bigramas `(1,2)`.
6. **TF-IDF:** Vectorización con parámetros justificados y documentados (`max_features`, `min_df`, `max_df`, `sublinear_tf`).

#### Capa 3: Modelos de Machine Learning
* Debe seleccionarse **1 o 2 modelos** dentro de los 8 vistos en clase:
  * Regresión Logística, Naive Bayes, KNN, Árbol de Decisión, Random Forest, XGBoost, Regresión Lineal, K-Means.
* Si se eligen 2 modelos: enfrentamiento riguroso mediante métricas de clasificación (Accuracy, Precision, Recall, $F_1$-score, Matriz de Confusión) justificando cuál se promueve a producción.
* Si se elige 1 modelo: contrastación obligatoria contra una línea base (*Dummy Baseline* / clase mayoritaria).
* **Ajuste de hiperparámetros:** Búsqueda sistemática (`GridSearchCV` / `RandomizedSearchCV`) con validación cruzada ($k$-fold estratificado).
* **Análisis de errores:** Exposición de casos específicos donde el modelo falla y justificación analítica del porqué.

#### Capa 4: Backend (API REST)
* Framework libre justificado.
* **Regla de oro del docente:** El backend **debe cargar el pipeline y modelos serializados** (`.joblib` / `.pkl`). El backend **nunca** debe reimplementar el código de limpieza a mano ni duplicar lógica.
* **Endpoints mínimos requeridos:**
  * `POST /predict`: Infiere la clase con su probabilidad/confianza asociada.
  * `POST /nlp-steps`: Devuelve el desglose paso a paso del texto crudo (normalizado, tokens, sin stopwords, lemas/raíces).
  * `GET /metrics`: Retorna las métricas de rendimiento y matrices de confusión de los modelos.
  * `GET /health`: Estado y disponibilidad del servicio.
* **Validaciones robustas:** Rechazo de cadenas vacías, longitud excesiva o formatos incorrectos, con mensajes de error HTTP informativos (400/422).
* Pruebas automatizadas mínimas (`pytest`).

#### Capa 5: Frontend (Interfaz Web)
* Aplicación web interactiva que consume la API de forma asíncrona.
* **Funcionalidades obligatorias:**
  1. Input de texto individual y carga de archivos por lotes (CSV).
  2. Visualizador del resultado del modelo (clase predicha, probabilidad porcentual, gauge de confianza).
  3. **Visualizador del pipeline de NLP paso a paso:** Vista interactiva que enseña el texto en cada etapa de transformación.
  4. Panel de métricas del modelo y comparativa gráfica.

---

### 1.2. Reglas, Restricciones y Esquema de Evaluación

#### Ponderación de la Nota
* **Parte Grupal (40%):**
  * Pipeline de NLP (10 pts)
  * Modelos y comparación (10 pts)
  * Integración y funcionamiento punta a punta (10 pts)
  * Repositorio y documentación (5 pts)
  * Exposición grupal (5 pts)
* **Parte Individual (60%):**
  * Contribución comprobable en Git (20 pts): Commits individuales, constantes, sustanciales y de calidad.
  * Explicación oral de su parte (15 pts): Dominio técnico de sus commits.
  * Respuesta a preguntas (10 pts): Conocimiento integral del sistema.
  * **Modificación en vivo (15 pts):** Implementar en caliente un requerimiento asignado por el docente el día de la presentación, ejecutarlo, interpretar el resultado y subirlo con un commit individual.

#### Restricciones Críticas de Repositorio
1. **Un solo repositorio grupal** con el docente como colaborador desde el inicio.
2. **Prohibido cuentas compartidas o commits a nombre de otros:** Cada estudiante con su propio usuario y correo en Git.
3. **Flujo de ramas:** Una rama por funcionalidad integrada a `main` vía Pull Request revisado por un compañero.
4. **Historial inmutable:** Terminantemente prohibido el `force push` (`git push --force`) o el aplastamiento indiscriminado de commits (`squash`), ya que destruye la evidencia de autoría.
5. **Archivo `CONTRIBUCIONES.md` obligatorio:** Declaración jurada de los aportes de cada integrante, la cual debe correlacionar 1:1 con el historial de Git.
6. **Etiqueta final:** Creación del tag `entrega-final` antes de las 23:59 del día previo.

---

## 2. Conciliación y Selección Definitiva del Proyecto

### Proyecto Seleccionado:
> **"Sentix-Hotel: Plataforma Inteligente de Análisis de Sentimiento y Minería de Opinión en Reseñas de Hospedaje en Español"**

### Justificación de la Elección:
1. **Alineación directa con la guía del docente:** Figura explícitamente en la primera fila de temas sugeridos de la pauta (*"Reseñas de hoteles o restaurantes: Clasificar sentimiento / Regresión logística, Naive Bayes, Random Forest"*).
2. **Comprensión intuitiva universal:** Tanto los estudiantes como el evaluador entienden inmediatamente el dominio del problema. No hay jerga médica o burocrática confusa.
3. **La mejor arena para lucirse en NLP:**
   * Las reseñas en español tienen ironía, modismos, contracciones y emojis.
   * **El papel de las stopwords:** Es el escenario perfecto para demostrar por qué palabras como *"no"*, *"nunca"* o *"tampoco"* **no** deben removerse (caso contrario, *"no me gustó la habitación"* se preprocesaría como *"gustó habitación"*, invirtiendo el sentido).
   * **N-gramas:** La diferencia entre evaluar unigramas vs. bigramas (*"mal servicio"*, *"atención impecable"*) se refleja de forma evidente en el $F_1$-score.
4. **Blindaje ante la Modificación en Vivo (15 pts):**
   * Es sumamente fácil alterar una stop word, cambiar el umbral de probabilidad, alternar entre lematizador y stemmer, modificar un hiperparámetro de regularización o agregar un endpoint sin arriesgar la estabilidad del sistema.

### Modelos Seleccionados para el Enfrentamiento:
1. **Modelo Lineal / Probabilístico Interpretable:** **Regresión Logística** (con regularización $L_2$).
   * *Justificación:* Rápido, robusto para espacios vectoriales dispersos de alta dimensionalidad (TF-IDF) y con coeficientes directamente interpretables para extraer las palabras con mayor peso positivo y negativo.
2. **Modelo de Ensamble No Lineal:** **Random Forest Classifier** (o **XGBoost**).
   * *Justificación:* Captura relaciones no lineales e interacciones complejas entre términos sin asumir independencia condicional entre palabras.

### Dataset a Emplear:
* **Dataset:** *TripAdvisor Hotel Reviews en Español* o *Resto-Mex Sentiment Dataset*.
* **Volumen:** Más de 3.000 a 10.000 reseñas etiquetadas (supera con creces el mínimo de 1.000).
* **Clases:** Clasificación binaria (Positivo / Negativo) o triclase (Positivo / Neutro / Negativo).

---

## 3. Definición y Justificación del Stack Tecnológico

El documento del docente no impone un stack cerrado, pero define exigencias de arquitectura: lenguaje adecuado para NLP/ML (Python), framework libre para la API y framework libre para el frontend.

| Capa / Componente | Tecnología Seleccionada | Justificación Técnica y Académica |
| :--- | :--- | :--- |
| **Lenguaje Core** | **Python 3.11+** | Estándar de la industria para Machine Learning y NLP; máxima compatibilidad de librerías. |
| **Preprocesamiento NLP** | **NLTK + spaCy (`es_core_news_sm`)** | `NLTK` provee `SnowballStemmer` y listas base de stopwords en español. `spaCy` provee lematización morfológica contextual real en español, permitiendo la comparación empírica requerida. |
| **Modelado y Métricas** | **Scikit-Learn + XGBoost** | Implementación optimizada de `TfidfVectorizer`, `LogisticRegression`, `RandomForestClassifier`, `GridSearchCV` y cálculo de métricas ($F_1$, Matrices de Confusión). |
| **Empaquetado de Pipeline** | **Joblib / Scikit-Learn Pipeline** | Permite serializar el preprocesamiento junto con el estimador en un único artefacto `.joblib`, garantizando reproducibilidad idéntica entre entrenamiento y producción. |
| **Backend REST** | **FastAPI + Pydantic + Uvicorn** | Asíncrono, moderno y ultrarrápido. `Pydantic` valida automáticamente entradas (cadenas vacías, longitud, tipos), cumpliendo al 100% los requisitos de validación. Auto-genera documentación Swagger interactiva en `/docs`. |
| **Frontend Web** | **React + Vite + Tailwind CSS** | Desacoplamiento total cliente-servidor. Consume la API vía `fetch()` asíncrono. Permite construir una interfaz visual moderna y reactiva con visualización paso a paso del pipeline y gráficos interactivos (`Chart.js`). |
| **Pruebas Automatizadas** | **Pytest** | Permite verificar de forma automatizada los endpoints de la API, las funciones de limpieza de NLP y la carga del modelo serializado. |
| **Control de Entorno** | **Pip + `requirements.txt`** | Congelamiento estricto de versiones (`==`) para asegurar que cualquier persona levante el proyecto exactamente igual. |

---

## 4. Estrategia para la "Modificación en Vivo" (15 Puntos Individuales)

Para garantizar que el equipo no sufra contratiempos el día de la presentación, el código se estructurará de forma **modular y basada en configuración centralizada** (`src/config.py` o `config.yaml`):

```python
# Ejemplo de configuración modular desacoplada
CONFIG = {
    "nlp": {
        "strip_accents": False,
        "keep_negations": True,
        "custom_stopwords": ["hotel", "habitacion", "habitaciones"],
        "lemmatize": True,         # Flag para alternar en 1 segundo a Stemming
        "ngram_range": (1, 2),     # Fácil de cambiar a (1, 1) en vivo
        "max_features": 5000,
    },
    "model": {
        "selected": "logistic_regression",
        "hyperparameters": {"C": 1.0, "max_iter": 1000}
    }
}
```

Si el docente pide:
* *"Cambiar stemming por lematización"*: Se cambia un flag en configuración o se ejecuta el script con `--stemming`, se corre el reentrenamiento de 1 línea `python -m src.models.train` y la API recarga automáticamente el nuevo modelo.
* *"Añadir una validación en la API"*: Las validaciones en `FastAPI` se agregan en una función de validación de `Pydantic` de apenas 3 líneas.
* *"Mostrar una métrica adicional en el Frontend"*: La API ya calcula el reporte completo de clasificación en `/metrics`, bastando añadir la visualización en la tarjeta correspondiente.

---

## 5. Estructura de Directorios del Repositorio

```text
proyecto1/
├── .agents/skills/          # Skills de ingeniería, testing y diseño UI/UX
├── data/
│   ├── raw/                 # Dataset original de reseñas (.csv / .json)
│   └── processed/           # Datos limpios y splits train/test
├── notebooks/
│   ├── 01_eda_exploratorio.ipynb
│   └── 02_experimentos_nlp_modelos.ipynb
├── src/
│   ├── __init__.py
│   ├── config.py            # Hiperparámetros y configuración global
│   ├── nlp/
│   │   ├── __init__.py
│   │   ├── normalizer.py    # Limpieza, emojis, puntuación
│   │   ├── tokenizer.py     # Tokenización especializada
│   │   ├── stopwords.py     # Gestión y justificación de stopwords
│   │   └── pipeline.py      # Pipeline completo transformador
│   └── models/
│       ├── __init__.py
│       ├── train.py         # Script de entrenamiento reproducible
│       ├── evaluate.py      # Comparación de métricas y análisis de errores
│       └── predict.py       # Interfaz de inferencia
├── api/
│   ├── main.py              # Aplicación FastAPI
│   ├── schemas.py           # Esquemas Pydantic de entrada/salida
│   └── routes/              # Endpoints: /predict, /nlp-steps, /metrics, /health
├── frontend/                # Aplicación React/Vite + Tailwind
│   ├── src/
│   │   ├── components/      # ReviewInput, NlpStepsView, MetricsDashboard
│   │   └── App.jsx
│   └── package.json
├── models/                  # Artefactos exportados: pipeline_nlp.joblib, model.joblib
├── tests/
│   ├── test_nlp.py          # Pruebas unitarias de preprocesamiento
│   ├── test_models.py       # Pruebas de inferencia y consistencia
│   └── test_api.py          # Pruebas de endpoints FastAPI
├── docs/
│   └── informe_tecnico.md   # Informe técnico formal del proyecto
├── README.md                # Guía paso a paso de instalación y ejecución
├── CONTRIBUCIONES.md        # Trazabilidad individual de commits y tareas
└── requirements.txt         # Dependencias fijadas con versión
```

---

## 6. Distribución Sugerida de Roles y Commits en Git

Para asegurar que cada uno de los integrantes cumpla con los 20 puntos de contribución individual en Git y tenga un commit sustancial en NLP/ML:

1. **Integrante 1 (Datos y Normalización NLP):**
   * Adquisición y documentación del dataset.
   * Notebook de EDA (gráficos, distribuciones, desbalance).
   * Módulo `src/nlp/normalizer.py` y `src/nlp/stopwords.py`.
2. **Integrante 2 (Modelado NLP y Lematización/Stemming):**
   * Implementación y comparación de `Stemmer` vs `Lemmatizer`.
   * Vectorización TF-IDF con unigramas y bigramas.
   * Construcción del pipeline serializable unificado (`src/nlp/pipeline.py`).
3. **Integrante 3 (Machine Learning, Tuning y Evaluación):**
   * Entrenamiento de Regresión Logística y Random Forest/XGBoost.
   * Validación cruzada y búsqueda de hiperparámetros.
   * Análisis de errores y script de serialización de artefactos (`src/models/`).
4. **Integrante 4 (API Backend y Pruebas Automatizadas):**
   * Desarrollo de la API REST en FastAPI (`api/`).
   * Validación de entradas con Pydantic.
   * Pruebas automatizadas con Pytest (`tests/`).
   * Integración con el Frontend.
*(Nota: El desarrollo del Frontend se reparte de forma colaborativa o mediante commits compartidos `Co-authored-by`).*
