# DOCUMENTO DE DECISIÓN TÉCNICA Y CONSOLIDACIÓN DE PROYECTO (ADR)
## Proyecto Integrador: Sentix-Hotel

**Materia:** Tópicos y Programación Avanzada  
**Ciclo:** Primer Parcial  
**Fecha límite de entrega en repositorio:** Día previo a la presentación, 23:59 (etiqueta `entrega-final`)  
**Fecha de presentación y defensa:** 3 de noviembre  
**Esquema de calificación:** 40% Evaluación Grupal / 60% Evaluación Individual (Historial Git + Defensa Oral + Modificación en Vivo)  
**Estado del documento:** APROBADO Y CONSOLIDADO PARA DESARROLLO  

---

## 1. Declaración de Proyecto y Dominio

* **Nombre Oficial:** **Sentix-Hotel: Plataforma Inteligente de Análisis de Sentimiento y Minería de Opinión en Reseñas de Hospedaje en Español**
* **Dominio:** Industria turística y hotelera (análisis de experiencia del huésped).
* **Tarea de Machine Learning:** **Clasificación Binaria de Texto** (Sentimiento).
  * Clase 1: **Positivo** (Opinión favorable / Huésped satisfecho).
  * Clase 0: **Negativo** (Opinión desfavorable / Huésped insatisfecho).

> **¿Por qué esta decisión?**  
> 1. Es el primer tema recomendado en la pauta oficial del docente (*"Reseñas de hoteles: clasificar sentimiento"*), asegurando encaje exacto con los criterios de evaluación.  
> 2. El análisis binario evita ambigüedades subjetivas de 3 estrellas, produciendo una matriz de confusión nítida de $2 \times 2$ muy fácil de defender e interpretar en la presentación oral.

---

## 2. Dataset y Tratamiento de Datos (Capa 1)

* **Dataset Base:** *TripAdvisor Hotel Reviews en Español* (corpus público con miles de reseñas etiquetadas).
* **Volumen de muestra para el proyecto:** Entre **3.000 y 5.000 reseñas balanceadas** (supera con holgura el mínimo de 1.000 registros solicitado).
* **Partición de Datos:** 80% Entrenamiento (`train`), 20% Prueba (`test`), con **estratificación** y semilla pseudoaleatoria fija (`random_state = 42`).
* **Regla estricta:** El conjunto de prueba (`test set`) queda completamente sellado y solo se utiliza para la evaluación final; jamás se toca durante el ajuste de hiperparámetros.
* **Entregable de la capa:** Notebook [`notebooks/01_eda_exploratorio.ipynb`](file:///d:/universidad/electivas/Topicos/proyecto1/notebooks/01_eda_exploratorio.ipynb) con gráficos de balance de clases, distribución de longitud de textos (palabras y caracteres), n-gramas más frecuentes y detección de nulos.

> **¿Por qué esta decisión?**  
> La semilla fija garantiza reproducibilidad 100% idéntica en cualquier máquina del equipo o del docente. La estratificación asegura que la proporción positivo/negativo sea equitativa en entrenamiento y prueba.

---

## 3. Pipeline de Preprocesamiento de NLP (Capa 2)

El pipeline se implementa como un módulo modular serializable en [`src/nlp/`](file:///d:/universidad/electivas/Topicos/proyecto1/src/nlp/) que cumple con cada técnica exigida:

```
[ Texto Crudo ]
      ↓
[ 1. Normalización ] ──→ Minúsculas, limpieza de URLs/HTML, remoción de puntuación y números.
      ↓                  (Conservación justificada de signos que indican énfasis emocional).
[ 2. Tokenización ]  ──→ Segmentación por palabras mediante expresiones regulares robustas.
      ↓
[ 3. Stop Words ]    ──→ Lista en español (NLTK) con RETENCIÓN ESTRICTA de negaciones
      ↓                  ('no', 'nunca', 'jamás', 'sin', 'tampoco').
[ 4. Morfología ]    ──→ COMPARACIÓN OBLIGATORIA: Stemming (Snowball NLTK) vs. Lematización (spaCy).
      ↓                  Se documenta empíricamente cuál aporta mejor F1-score en la validación.
[ 5. N-gramas ]      ──→ COMPARACIÓN OBLIGATORIA: Unigramas (1,1) vs. Unigramas + Bigramas (1,2).
      ↓
[ 6. TF-IDF ]        ──→ Vectorización con TfidfVectorizer (max_features=5000, sublinear_tf=True).
```

> **¿Por qué esta decisión?**  
> En sentimiento, si se remueve la palabra *"no"*, la frase *"no me gustó la habitación"* se convierte en *"gustó habitación"*, invirtiendo por completo la predicción. Esta justificación técnica es clave para la defensa individual.

---

## 4. Modelos de Machine Learning y Serialización (Capa 3)

Se entrenan, ajustan y comparan dos familias de algoritmos vistas en clase:

1. **Modelo Lineal / Probabilístico (Interpretable):** **Regresión Logística (`LogisticRegression`)**
   * *Justificación:* Excelente con matrices dispersas de alta dimensionalidad (TF-IDF). Permite inspeccionar directamente los coeficientes para extraer las palabras que más pesan a favor o en contra del sentimiento.
2. **Modelo de Ensamble No Lineal:** **Random Forest Classifier (`RandomForestClassifier`)** (o **XGBoost**)
   * *Justificación:* Captura interacciones complejas no lineales entre palabras sin suponer independencia condicional.
3. **Ajuste de Hiperparámetros:** Búsqueda en grilla (`GridSearchCV`) con validación cruzada estratificada de 5 pliegues ($k=5$).
4. **Métricas de Evaluación:** Precision, Recall, $F_1$-score (Macro y Weighted) y Matriz de Confusión.
5. **Serialización del Pipeline:** Se exporta el pipeline completo (preprocesamiento + vectorizador + modelo ganador) mediante **`joblib`** en [`models/sentix_pipeline.joblib`](file:///d:/universidad/electivas/Topicos/proyecto1/models/sentix_pipeline.joblib).

> **¿Por qué esta decisión?**  
> El docente exige explícitamente comparar dos modelos y justificar cuál queda en producción. La Regresión Logística y Random Forest representan dos paradigmas matemáticos opuestos (lineal vs árboles de ensamble), ofreciendo una comparación teórica perfecta.

---

## 5. Backend: API REST Desacoplada (Capa 4)

* **Framework:** **FastAPI + Uvicorn + Pydantic** (Python 3.11+).
* **Regla Inviolable:** El backend **carga el artefacto serializado (`.joblib`)**; jamás reimplementa ni duplica funciones de limpieza de texto a mano.
* **Endpoints Mínimos Obligatorios:**
  * `POST /api/predict`: Recibe `{ "text": str }`, valida longitud y formato, y responde con `{ "sentiment": "Positivo"|"Negativo", "probability": float, "confidence": float }`.
  * `POST /api/nlp-steps`: Devuelve el desglose paso a paso del texto para que el frontend dibuje las transformaciones (normalizado, tokens, sin stopwords, lematizado).
  * `GET /api/metrics`: Devuelve las métricas de entrenamiento ($F_1$-score, precision, recall y matriz de confusión) para el panel de control.
  * `GET /api/health`: Endpoint de verificación de estado y versión del servicio.
* **Validación de Entradas:** Manejo de excepciones con respuestas claras (422/400 si el texto está vacío, contiene solo espacios o supera los 5.000 caracteres).
* **Pruebas Automatizadas:** Módulo de tests unitarios con `pytest` en [`tests/`](file:///d:/universidad/electivas/Topicos/proyecto1/tests/).

> **¿Por qué esta decisión?**  
> FastAPI genera automáticamente la documentación interactiva OpenAPI/Swagger en `/docs`, ejecuta peticiones de forma asíncrona y valida tipos estrictamente con Pydantic, cumpliendo los requisitos con código limpio y moderno.

---

## 6. Frontend: Interfaz Web Interactiva (Capa 5)

* **Tecnología:** **React + Vite + Tailwind CSS** (o SPA desacoplada consumiendo la API vía `fetch`).
* **Vistas y Componentes Principales:**
  1. **Simulador de Reseñas:** Área de texto interactiva con botón de predicción inmediata y carga de archivo `.csv` para predicción por lotes.
  2. **Medidor Visual de Sentimiento:** Badge de color (Verde/Rojo) con porcentaje de probabilidad y barra de nivel de confianza.
  3. **Visualizador Paso a Paso del Pipeline de NLP:** Cuadro que muestra en tiempo real las transformaciones del texto:
     $$\text{Texto Original} \longrightarrow \text{Normalizado} \longrightarrow \text{Tokens} \longrightarrow \text{Sin Stopwords} \longrightarrow \text{Lematizado/Raíces}$$
  4. **Panel de Métricas del Modelo:** Comparativa visual gráfica de métricas ($F_1$, Precision, Recall) y renderizado de la Matriz de Confusión.

> **¿Por qué esta decisión?**  
> El docente exige una vista paso a paso del preprocesamiento y un panel de métricas. React con Tailwind permite una interfaz visual impactante, responsiva y completamente desacoplada del backend.

---

## 7. Blindaje para la "Modificación en Vivo" (15 Puntos Individuales)

El docente pedirá a cada integrante realizar una modificación en tiempo real, ejecutarla, interpretar el resultado y subirla con su propio commit.  
Para evitar bloqueos o errores de sintaxis en ese momento, el sistema contará con un **archivo de configuración centralizada** en [`src/config.py`](file:///d:/universidad/electivas/Topicos/proyecto1/src/config.py):

| Posible Modificación del Docente | Cómo se Resuelve en Segundos |
| :--- | :--- |
| *"Agreguen o quiten una stop word y muestren cómo cambia"* | Se agrega la palabra al arreglo `CUSTOM_STOPWORDS` en `src/config.py` y se corre `python -m src.models.train`. |
| *"Cambien el rango de n-gramas a solo unigramas o agreguen trigramas"* | Se cambia `NGRAM_RANGE = (1, 1)` o `(1, 3)` en `src/config.py` y se reentrena. |
| *"Cambien de lematización a stemming"* | Se altera el flag booleano `USE_LEMMATIZATION = False` en `src/config.py`. |
| *"Cambien un hiperparámetro (ej. regularización C o n_estimators)"* | Se modifica el valor en el diccionario de hiperparámetros de `src/config.py`. |
| *"Agreguen una validación en la API (ej. rechazar textos de < 3 palabras)"* | Se añade una regla de validación de 3 líneas en el esquema Pydantic de `api/schemas.py`. |
| *"Muestren un dato nuevo en el Frontend"* | Se añade la propiedad que ya devuelve la API en el componente visual correspondiente. |

---

## 8. Estándares de Código y Reglas de Git para el Equipo

### 8.1. Estándares de Código (Reglas fijadas en `.agents/rules/` y `AGENTS.md`)
1. **Nombres autoexplicativos:** Prohibido usar variables crípticas (`t`, `x1`, `temp`). Usar nombres intencionales (`cleaned_review_text`, `predicted_label`, `model_accuracy`).
2. **Comentarios limpios:** Cero bloques de adornos (`### ===== ###`). Comentar únicamente el **por qué** de las decisiones críticas.
3. **Tipado y docstrings:** Funciones públicas con anotaciones de tipo (`def clean_text(text: str) -> str:`) y docstring breve.

### 8.2. Reglas Estrictas del Repositorio
* **Docente colaborador:** Agregado desde el día 1 en GitHub/GitLab.
* **Cuentas individuales obligatorias:** Cada integrante commitea exclusivamente con su nombre y correo configurados en Git. Cero cuentas compartidas.
* **Flujo de ramas:** Prohibido commitear directo en `main`. Se trabaja en ramas de funcionalidad (`feature/eda`, `feature/nlp-pipeline`, `feature/api-endpoints`) y se integra mediante Pull Request revisado por otro compañero.
* **Historial inmutable:** Terminantemente prohibido el `git push --force` o hacer `squash` generalizado que destruya la autoría de los commits.
* **Archivo `CONTRIBUCIONES.md`:** Debe mantenerse actualizado y reflejar con fidelidad la autoría de cada commit.
* **Etiqueta final:** Creación del tag `entrega-final` antes de las 23:59 del día anterior a la defensa.

---

## 9. Matriz Sugerida de Distribución de Roles y Commits

Para garantizar que todos tengan commits sustanciales en NLP/ML:

| Integrante | Rol Principal | Commits y Responsabilidades Principales |
| :--- | :--- | :--- |
| **Integrante 1** | Datos y Normalización NLP | Adquisición del dataset, documentación de origen y licencia, notebook de EDA (`01_eda_exploratorio.ipynb`), módulo de normalización y depuración de stopwords (`src/nlp/normalizer.py`, `src/nlp/stopwords.py`). |
| **Integrante 2** | Morfología y Vectorización | Implementación comparativa de Stemming vs. Lematización (`src/nlp/lemmatizer.py`), vectorización TF-IDF con unigramas y bigramas, y construcción del pipeline unificado (`src/nlp/pipeline.py`). |
| **Integrante 3** | Modelado ML y Evaluación | Entrenamiento de Regresión Logística y Random Forest con GridSearchCV, cálculo de métricas de clasificación, matrices de confusión, análisis de errores y serialización del artefacto `.joblib` (`src/models/`). |
| **Integrante 4** | Backend API y Pruebas | Configuración de FastAPI, carga de modelo serializado, esquemas Pydantic con validación, endpoints `/predict`, `/nlp-steps`, `/metrics`, y pruebas unitarias con Pytest (`api/` y `tests/`). |

*(El desarrollo de la interfaz de Frontend se realiza de forma transversal o con commits compartidos usando la línea `Co-authored-by: Nombre <correo>` en el mensaje del commit).*

---

## 10. Estructura Oficial del Repositorio

```text
proyecto1/
├── .agents/                 # Configuración de agente y 23 skills de ingeniería/diseño
│   └── rules/               # Reglas de estilo y código limpio
├── data/
│   ├── raw/                 # Dataset crudo original de reseñas (.csv)
│   └── processed/           # Datos procesados y splits train/test
├── notebooks/
│   ├── 01_eda_exploratorio.ipynb
│   └── 02_experimentos_modelos.ipynb
├── src/
│   ├── __init__.py
│   ├── config.py            # Hiperparámetros, umbrales y flags centralizados
│   ├── nlp/
│   │   ├── __init__.py
│   │   ├── normalizer.py    # Limpieza, minúsculas, puntuación
│   │   ├── stopwords.py     # Listas en español con retención de negación
│   │   ├── morphology.py    # Stemming (NLTK) vs Lematización (spaCy)
│   │   └── pipeline.py      # Pipeline transformador de NLP serializable
│   └── models/
│       ├── __init__.py
│       ├── train.py         # Script reproducible: datos crudos -> modelo guardado
│       └── evaluate.py      # Reporte de métricas, matriz de confusión y errores
├── api/
│   ├── __init__.py
│   ├── main.py              # Aplicación FastAPI y middleware CORS
│   ├── schemas.py           # Modelos Pydantic de entrada y salida
│   └── routes/              # Endpoints: /predict, /nlp-steps, /metrics, /health
├── frontend/                # Interfaz web React/Vite + Tailwind
│   ├── src/
│   │   ├── components/      # ReviewInput, StepByStepPipeline, MetricsDashboard
│   │   └── App.jsx
│   └── package.json
├── models/                  # Artefacto exportado: sentix_pipeline.joblib
├── tests/
│   ├── test_nlp.py          # Pruebas de limpieza y lematización
│   ├── test_models.py       # Pruebas de inferencia del modelo
│   └── test_api.py          # Pruebas de los endpoints REST
├── docs/
│   ├── informe_tecnico.md   # Informe técnico final
│   └── outputs/             # Documentos de análisis y actas de decisión
├── AGENTS.md                # Reglas automáticas para asistentes de código
├── README.md                # Guía de instalación y ejecución desde cero
├── CONTRIBUCIONES.md        # Trazabilidad de aportes por cada integrante
└── requirements.txt         # Dependencias con versiones fijadas
```
