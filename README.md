# Sentix-Hotel
### Plataforma Inteligente de Análisis de Sentimiento y Minería de Opinión en Reseñas de Hospedaje en Español

Proyecto Integrador para la materia **Tópicos y Programación Avanzada** (Primer Parcial).

---

## 1. Documentación Oficial para la Presentación y Evaluación

En cumplimiento con los entregables obligatorios establecidos en la Sección 7 de la guía del proyecto:

* **Informe Técnico Oficial:** [`docs/informe_tecnico.md`](docs/informe_tecnico.md) (Problema, dataset, decisiones de PLN, comparativa empírica de modelos y arquitectura).
* **Diapositivas de la Exposición:** [`docs/diapositivas_presentacion.html`](docs/diapositivas_presentacion.html) (Presentación interactiva de 10 minutos con métricas, gráficos y temporizador, ejecutable en cualquier navegador).
* **Registro de Aportes y Commits:** [`CONTRIBUCIONES.md`](CONTRIBUCIONES.md) (Trazabilidad comprobable de tareas y commits por integrante).
* **Notebook de EDA y Experimentos:** [`notebooks/01_eda_exploratorio.ipynb`](notebooks/01_eda_exploratorio.ipynb) (Ejecutado con outputs y distribuciones visuales).

---

## 2. Arquitectura del Sistema (5 Capas Desacopladas)

```text
[ Capa 1: Datos y EDA ]
       │  (data/raw/hotel_reviews_es.csv ──→ notebooks/01_eda_exploratorio.ipynb)
       ▼
[ Capa 2: Pipeline de PLN ]  ──→  Serialización Joblib  ──→  [ models/sentix_pipeline.joblib ]
       │  (Normalizer, Tokenizer, Stopwords, Morphology)             │
       ▼                                                             ▼
[ Capa 3: Modelado ML ]      ──→  Auditoría y Métricas  ──→  [ models/metrics_report.json ]
       │  (LogisticRegression + GridSearchCV)                         │
       ▼                                                             ▼
[ Capa 4: Backend REST ] ◄────────────────────────────────────────┘
       │  (FastAPI: /predict, /predict-batch, /nlp-steps, /metrics, /config, /health)
       ▼
[ Capa 5: Frontend UI ]
          (React 18 + Vite + Tailwind CSS: Clasificador en vivo, PLN paso a paso, Métricas y Batch)
```

1. **Capa 1 (Datos):** Corpus de 4.468 reseñas en español balanceadas 50/50 y split estratificado 80/20 train/test con semilla fija (`random_state=42`).
2. **Capa 2 (PLN):** Normalización (tildes, diéresis), tokenización, stop words con **retención estricta de palabras de negación** (`no`, `nunca`, `jamás`, `sin`, `tampoco`), comparativa de Stemming (NLTK) vs. Lematización (spaCy), y vectorización TF-IDF con unigramas y bigramas.
3. **Capa 3 (Modelado):** Regresión Logística optimizada con validación cruzada ($k=5$, $F_1=96,42\%$) frente a Random Forest ($F_1=94,74\%$), exportada mediante Joblib.
4. **Capa 4 (Backend):** API REST en FastAPI que carga el pipeline serializado sin reimplementar preprocesamiento a mano, valida con Pydantic y sirve la interfaz web.
5. **Capa 5 (Frontend):** Aplicación web interactiva en React 18, Vite y Tailwind CSS bajo la regla 60-30-10, cero emojis y modal unificado de feedback.

---

## 3. Puesta en Marcha y Ejecución

### Opción A: Arranque Rápido en Windows (Recomendado, un solo comando)
El script automatiza la verificación del entorno virtual, dependencias, modelo de spaCy, compilación del frontend y levanta la API sirviendo la interfaz web completa:
```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```
* **Aplicación Web:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
* **Documentación Swagger API:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Opción B: Arranque Manual con Entorno Virtual
```bash
# 1. Activar entorno virtual
# En Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# En Windows (Git Bash):
source .venv/Scripts/activate

# 2. Iniciar el servidor unificado
python run.py
```

### Opción C: Despliegue en Contenedores Docker (Valor Agregado)
Para levantar la solución completa en cualquier sistema operativo sin dependencias locales:
```bash
docker compose up --build
```

---

## 4. Auditoría, Pruebas y Reproducibilidad

El proyecto cuenta con scripts reproducibles de un solo comando:

```bash
# 1. Ejecutar las 26 pruebas automatizadas de API, PLN y modelos
python -m pytest tests/

# 2. Auditar coherencia entre el artefacto serializado, config y métricas
python -m src.models.verify_artifact

# 3. Reentrenar el pipeline completo desde los datos crudos
python -m src.models.train

# 4. Ejecutar el benchmark comparativo entre modelos y técnicas de PLN
python -m src.models.benchmark
```

---

## 5. Endpoints de la API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servicio y confirmación de modelo cargado en memoria. |
| `POST` | `/api/predict` | Clasificación individual de polaridad y probabilidades estimadas. |
| `POST` | `/api/predict-batch` | Clasificación masiva por lote para procesamiento de archivos CSV. |
| `POST` | `/api/nlp-steps` | Desglose paso a paso de las 4 fases de PLN aplicadas al texto. |
| `GET` | `/api/metrics` | Reporte completo de métricas ($F_1$, precisión, recall, matriz $2 \times 2$ y análisis de errores). |
| `GET` | `/api/config` | Configuración efectiva del pipeline en tiempo de ejecución (`src/config.py`). |
| `GET` | `/docs` | Documentación interactiva Swagger UI. |

---

## 6. Estructura del Repositorio

```text
proyecto1/
├── api/                     # Backend REST en FastAPI y esquemas Pydantic
├── data/
│   ├── raw/                 # Dataset crudo (hotel_reviews_es.csv)
│   └── processed/           # Particiones train/test estratificadas
├── docs/                    # Documentación oficial para la presentación
│   ├── informe_tecnico.md   # Informe técnico breve solicitado por el docente
│   └── diapositivas_presentacion.html # Diapositivas interactivas (10 min)
├── models/                  # Artefactos serializados (.joblib y métricas JSON)
├── notebooks/               # Jupyter Notebook de EDA ejecutado con outputs
├── src/
│   ├── config.py            # Configuración centralizada e hiperparámetros
│   ├── nlp/                 # Normalización, tokenización, stopwords y pipeline
│   └── models/              # Modelado, tuning CV, evaluación y benchmark
├── tests/                   # 26 pruebas unitarias y de integración (Pytest)
├── frontend/                # Interfaz de usuario en React + Vite + Tailwind CSS
├── Dockerfile               # Contenedorización multi-etapa
├── docker-compose.yml       # Orquestación de contenedores
├── CONTRIBUCIONES.md        # Trazabilidad de aportes por integrante
├── requirements.txt         # Dependencias principales del proyecto
├── requirements.lock.txt    # Fijación exacta de dependencias transitivas
├── start.ps1                # Script de arranque en un solo paso (Windows)
└── README.md                # Guía general del proyecto
```
