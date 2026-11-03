# Registro de Contribuciones y Trazabilidad de Autoría
## Proyecto Integrador: Sentix-Hotel
**Materia:** Tópicos y Programación Avanzada (Primer Parcial)  
**Integrantes:** Javier y José  

Este documento registra formalmente la división de tareas y la contribución comprobable de cada integrante, manteniendo estricta correspondencia con el historial de commits en Git según lo solicitado por el docente en las Secciones 6.1, 6.2 y 7 de la guía del proyecto integrador.

---

## 1. Registro de Aportes por Integrante

### 1.1 Javier
* **Rol Principal:** Arquitectura del Sistema, Pipeline de PLN, Backend REST y Frontend UI.
* **Aportes y Tareas:**
  * Inicialización de la arquitectura desacoplada en 5 capas, entorno (`requirements.txt`), `.gitignore` y configuración global (`src/config.py`).
  * Implementación del módulo de normalización de texto y limpieza de caracteres conservando tildes, diéresis y la letra `ñ` (`src/nlp/normalizer.py`).
  * Implementación del tokenizador léxico especializado en español (`src/nlp/tokenizer.py`).
  * Implementación del módulo de stop words con retención estricta de términos de negación (`src/nlp/stopwords.py`).
  * Construcción del transformador Scikit-Learn `TextPreprocessor` (`src/nlp/pipeline.py`) y del método de desglose paso a paso para la API.
  * Desarrollo del backend en FastAPI, validación de esquemas Pydantic y endpoints `/predict`, `/predict-batch`, `/nlp-steps`, `/metrics`, `/health` (`api/`).
  * Desarrollo de la interfaz web en React 18, Vite y Tailwind CSS bajo la regla 60-30-10, cero emojis y modal unificado de feedback (`frontend/`).
  * Pruebas automatizadas de la API y el preprocesamiento (`tests/test_api.py`, `tests/test_nlp.py`).

### 1.2 José
* **Rol Principal:** Análisis Exploratorio de Datos (EDA), Vectorización TF-IDF, Modelado ML, Benchmark y Auditoría.
* **Aportes y Tareas:**
  * Adquisición, curación y balanceo del corpus de reseñas hoteleras en español (`data/raw/hotel_reviews_es.csv`).
  * Desarrollo y ejecución completa del notebook de análisis exploratorio (`notebooks/01_eda_exploratorio.ipynb`).
  * Análisis de balance de clases (50/50), distribución de longitudes de texto y valores nulos.
  * Partición estratificada de datos 80/20 train/test (`data/processed/`).
  * Comparación morfológica obligatoria entre Stemming (*SnowballStemmer* de NLTK) y Lematización (*spaCy* `es_core_news_sm`) (`src/nlp/morphology.py`).
  * Implementación de la vectorización TF-IDF y comparación empírica de Unigramas vs. Unigramas + Bigramas (`src/nlp/vectorizer.py`).
  * Implementación y calibración del modelo de ensamble Random Forest Classifier con 100 árboles de decisión (`src/models/random_forest.py`).
  * Pipeline de Regresión Logística con búsqueda en grilla y validación cruzada estratificada ($k=5$ pliegues) (`src/models/train.py`, `src/models/logistic_regression.py`).
  * Ejecución del benchmark comparativo empírico entre Regresión Logística y Random Forest (`src/models/benchmark.py`).
  * Cálculo de métricas ($F_1$-score, Precision, Recall), generación de la matriz de confusión y extracción de casos de error (`src/models/evaluate.py`).
  * Refactor de centralización de configuración en tiempo de ejecución: creación del endpoint `/api/config` y consumo dinámico en el Frontend.
  * Herramienta de auditoría de consistencia del modelo (`src/models/verify_artifact.py`) y suite de pruebas de modelado (`tests/test_models.py`).
  * Automatización de arranque para Windows (`start.ps1`), contenedorización (`Dockerfile`, `docker-compose.yml`) y congelamiento de versiones transitivas (`requirements.lock.txt`).

---

## 2. Declaración de Compromiso y Honestidad Académica

Todos los integrantes del equipo participaron activamente en el diseño, desarrollo, pruebas y documentación del sistema. Cada miembro comprende la totalidad del flujo de datos, desde la entrada de texto crudo en el frontend hasta la predicción matemática del modelo en el backend, estando plenamente capacitado para su defensa individual y para la implementación de las modificaciones en vivo requeridas por el docente.
