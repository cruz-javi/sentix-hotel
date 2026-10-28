# Registro de Contribuciones y Trazabilidad de Autoría

**Proyecto:** Sentix-Hotel  
**Materia:** Tópicos y Programación Avanzada  
**Integrantes:** Javier, José y Gabriel  

Este documento registra formalmente la división de tareas y la contribución comprobable de cada integrante, manteniendo estricta correspondencia con el historial de commits en Git según lo solicitado por el docente.

---

## 📅 Registro de Aportes por Integrante

### 1. Javier
* **Rol Principal:** Arquitectura General, Pipeline Unificado de NLP y Backend REST.
* **Aportes y Tareas:**
  * Inicialización de la arquitectura del proyecto, entorno (`requirements.txt`), `.gitignore` y configuración global (`src/config.py`).
  * Adquisición y balanceo del dataset en español (`data/raw/hotel_reviews_es.csv`).
  * Implementación del módulo de stopwords con retención estricta de términos de negación (`src/nlp/stopwords.py`).
  * Construcción del pipeline transformador de Scikit-Learn (`src/nlp/pipeline.py`) y desglose paso a paso para la API.
  * Entrenamiento y ajuste de Regresión Logística con GridSearchCV (`src/models/logistic_regression.py`).
  * Script reproducible de entrenamiento y serialización con Joblib (`src/models/train.py`).
  * Desarrollo del backend en FastAPI, esquemas Pydantic y endpoints `/predict`, `/nlp-steps`, `/metrics`, `/health` (`api/`).
  * Suite de pruebas automatizadas con Pytest (`tests/`).

### 2. José
* **Rol Principal:** Análisis Exploratorio de Datos (EDA), Vectorización TF-IDF y Evaluación de Modelos.
* **Aportes y Tareas:**
  * Desarrollo y ejecución del notebook de análisis exploratorio (`notebooks/01_eda_exploratorio.ipynb`).
  * Análisis de balance de clases, distribución de longitudes de texto y valores nulos.
  * Partición estratificada de datos 80/20 train/test (`data/processed/`).
  * Implementación de la vectorización TF-IDF y comparación empírica de Unigramas vs. Unigramas + Bigramas (`src/nlp/vectorizer.py`).
  * Cálculo de métricas ($F_1$-score, Precision, Recall), generación de la matriz de confusión y extracción de casos de error (`src/models/evaluate.py`).
  * Componentes de interfaz de usuario para entrada de reseñas en el Frontend.

### 3. Gabriel
* **Rol Principal:** Normalización de Texto, Tokenización, Morfología y Modelo de Ensamble.
* **Aportes y Tareas:**
  * Implementación del módulo de normalización de texto y limpieza de URLs/HTML/signos (`src/nlp/normalizer.py`).
  * Implementación del tokenizador léxico especializado en español (`src/nlp/tokenizer.py`).
  * Comparación morfológica obligatoria entre Stemming (*SnowballStemmer* NLTK) y Lematización (*spaCy*) (`src/nlp/morphology.py`).
  * Implementación y calibración del modelo de ensamble Random Forest Classifier (`src/models/random_forest.py`).
  * Componentes de visualización paso a paso del pipeline de NLP y dashboard de métricas en el Frontend.

---

## 📌 Declaración de Compromiso y Honestidad Académica
Todos los integrantes del equipo participaron activamente en el diseño, desarrollo y pruebas del sistema. Cada miembro comprende la totalidad del flujo de datos, desde la entrada de texto crudo en el frontend hasta la predicción matemática del modelo en el backend.
