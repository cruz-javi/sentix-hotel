# Sentix-Hotel 🏨📊
### Plataforma Inteligente de Análisis de Sentimiento y Minería de Opinión en Reseñas de Hospedaje en Español

Proyecto Integrador para la materia **Tópicos y Programación Avanzada** (Primer Parcial).

---

## 👥 Equipo de Desarrollo
* **Javier:** Arquitectura general, pipeline unificado de NLP, Regresión Logística y API REST (FastAPI).
* **José:** Análisis Exploratorio de Datos (EDA), vectorización TF-IDF con N-gramas y evaluación comparativa de modelos.
* **Gabriel:** Normalización, tokenización, comparativa morfológica (Stemming vs. Lematización) y Random Forest.

---

## 🏛️ Arquitectura del Sistema (5 Capas)

```
[ Capa 1: Datos y EDA ]
           ↓
[ Capa 2: Pipeline de NLP ]  ──→  [ models/sentix_pipeline.joblib ]
           ↓                                     ↓
[ Capa 3: Modelado ML ]      ──→  [ models/metrics_report.json ]
                                                 ↓
[ Capa 5: Frontend Web ]     ←──  [ Capa 4: API REST (FastAPI) ]
```

1. **Capa de Datos y EDA:** Dataset de más de 4.400 reseñas de hoteles en español balanceadas 50/50, análisis de longitud y split estratificado 80/20 train/test con semilla fija (`random_state=42`).
2. **Capa de NLP:** Normalización, tokenización, stop words con **retención estricta de palabras de negación** (`no`, `nunca`, `jamás`, `tampoco`, `sin`), comparativa de Stemming (NLTK) vs. Lematización (spaCy), y vectorización TF-IDF con unigramas y bigramas.
3. **Capa de Machine Learning:** Regresión Logística multivariable (interpretable con pesos de coeficientes) vs. Random Forest Classifier, optimizados con validación cruzada ($k=5$) y exportados mediante `joblib`.
4. **Capa de Backend (FastAPI):** API REST desacoplada que carga el artefacto `.joblib`, valida con esquemas Pydantic y expone `/api/predict`, `/api/nlp-steps`, `/api/metrics` y `/api/health`.
5. **Capa de Frontend:** Interfaz web interactiva con simulador de reseñas, visualizador del pipeline paso a paso y panel de métricas.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio y configurar entorno
```bash
# Clonar el proyecto
git clone <URL_DEL_REPOSITORIO>
cd proyecto1

# Crear y activar entorno virtual
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate

# Instalar dependencias fijadas
pip install -r requirements.txt
```

### 2. Entrenar y Regenerar el Pipeline (1 solo comando)
El script reproduce el preprocesamiento, entrena el modelo y exporta el artefacto serializado:
```bash
python -m src.models.train
```

### 3. Ejecutar la Suite de Pruebas Automatizadas
```bash
python -m pytest tests/
```

### 4. Levantar la API Backend (FastAPI)
```bash
uvicorn api.main:app --reload --port 8000
```
La documentación interactiva Swagger estará disponible inmediatamente en:
👉 [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛠️ Endpoints Principales de la API

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servicio y confirmación de modelo en memoria. |
| `POST` | `/api/predict` | Clasifica una reseña (`{"text": "..."}`) y entrega sentimiento y probabilidades. |
| `POST` | `/api/nlp-steps` | Devuelve el desglose paso a paso (normalizado, tokens, sin stopwords, lemas). |
| `GET` | `/api/metrics` | Reporte de métricas ($F_1$-score, precision, recall) y matriz de confusión ($2 \times 2$). |

---

## 📂 Estructura del Repositorio

```text
proyecto1/
├── api/                     # Backend REST en FastAPI y esquemas Pydantic
├── data/
│   ├── raw/                 # Dataset crudo (hotel_reviews_es.csv)
│   └── processed/           # Particiones train/test estratificadas
├── docs/                    # Documentación técnica y diagramas
├── models/                  # Artefactos serializados (.joblib y métricas JSON)
├── notebooks/               # Jupyter Notebooks de EDA (01_eda_exploratorio.ipynb)
├── src/
│   ├── config.py            # Configuración centralizada e hiperparámetros
│   ├── nlp/                 # Módulos de limpieza, tokenización, stopwords y pipeline
│   └── models/              # Scripts de modelado, tuning y evaluación
├── tests/                   # Pruebas automatizadas con Pytest
├── requirements.txt         # Dependencias del proyecto
├── CONTRIBUCIONES.md        # Registro de aportes y trazabilidad por integrante
└── README.md
```
