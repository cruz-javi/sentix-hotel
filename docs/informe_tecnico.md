# Informe Técnico: Sentix-Hotel
## Plataforma de Análisis de Sentimiento y Minería de Opinión en Reseñas de Hospedaje en Español

**Materia:** Tópicos y Programación Avanzada (Primer Parcial)  
**Proyecto:** Proyecto Integrador de Clasificación de Texto y Minería de Opinión  
**Fecha:** Noviembre de 2026  

---

## 1. Definición del Problema y Justificación de Dominio

El sector hotelero y de hospitalidad genera diariamente grandes volúmenes de opiniones desestructuradas en plataformas digitales (TripAdvisor, Booking, Google Reviews). La retroalimentación de los huéspedes constituye el indicador más sensible de calidad operativa y reputación de marca. Sin embargo, el procesamiento manual de reseñas es ineficiente y no escala ante flujos masivos de comentarios.

El objetivo de **Sentix-Hotel** es construir una solución completa de software desacoplada en cinco capas, capaz de:
1. Ingerir y clasificar automáticamente la polaridad de sentimiento (*Positivo* o *Negativo*) en reseñas hoteleras redactadas en español.
2. Explicar e inspeccionar de forma transparente cada fase del procesamiento de lenguaje natural (PLN) antes de la inferencia.
3. Servir predicciones probabilísticas en tiempo real mediante una API REST y visualizarlas en una interfaz web sobria y analítica.

---

## 2. Dataset y Análisis Exploratorio de Datos (EDA)

### 2.1 Origen, Licencia y Volumen
* **Corpus Base:** Compilación de reseñas hoteleras en español de TripAdvisor (Punta Cana Corpus) y plataformas públicas de turismo.
* **Licencia:** Dominio público para fines de investigación académica y minería de texto.
* **Volumen Total:** 4.468 reseñas hoteleras depuradas.
* **Balance de Clases:** Exactamente 50% Positivas (2.234 muestras) y 50% Negativas (2.234 muestras), eliminando sesgo por desbalance de clases (*class imbalance bias*).
* **Valores Faltantes:** 0 registros nulos tras la fase de curación inicial.

### 2.2 Estadísticas de Longitud Textual
| Métrica | Longitud en Caracteres | Longitud en Palabras |
| :--- | :--- | :--- |
| **Media** | 512,4 caracteres | 91,2 palabras |
| **Mediana** | 384,0 caracteres | 68,0 palabras |
| **Mínimo** | 42 caracteres | 6 palabras |
| **Máximo** | 4.890 caracteres | 845 palabras |

### 2.3 Partición Estratificada y Reproducibilidad
Para garantizar una evaluación estadística rigurosa y evitar fuga de información (*data leakage*):
* **Conjunto de Entrenamiento (Train Set):** 80% (3.574 reseñas).
* **Conjunto de Prueba Aislado (Test Set):** 20% (894 reseñas).
* **Semilla Aleatoria:** `RANDOM_STATE = 42` fijada globalmente en `src/config.py`.
* **Estratificación:** `stratify=y`, manteniendo la proporción exacta de 447 positivas y 447 negativas en el test set. El conjunto de prueba nunca interviene en el ajuste de vocabulario, pesos ni hiperparámetros.

---

## 3. Decisiones Técnicas del Pipeline de PLN

El pipeline de PLN se construyó como un transformador personalizado de Scikit-Learn (`TextPreprocessor`) integrado mediante la clase `Pipeline`. Esto garantiza que exactamente la misma lógica de preprocesamiento se aplique tanto en el entrenamiento como en la inferencia de la API en producción.

```
Texto Crudo ──→ [ Normalización ] ──→ [ Tokenización ] ──→ [ Stopwords + Negación ] ──→ [ Lematización ] ──→ [ TF-IDF (1,2) ] ──→ Vector
```

### 3.1 Normalización de Caracteres
* **Conversión a Minúsculas:** Homogeneiza el espacio léxico (*"Excelente"* y *"excelente"* se mapean a la misma unidad).
* **Tratamiento de Caracteres Especiales:** Se conservan las vocales con tildes (`á, é, í, ó, ú`), la diéresis (`ü, Ü`) y la letra `ñ` mediante expresiones regulares y normalización Unicode NFKD.
* **Eliminación de Ruido:** Remoción de etiquetas HTML, URLs web, números aislados y signos de puntuación ortográficos.
* **Manejo de Emojis:** Se limpian los emojis del texto de entrada para concentrar el análisis en la señal léxica y semántica del vocabulario español.

### 3.2 Tokenización Léxica
Segmentación basada en límites de palabras alfanuméricas con soporte nativo de caracteres en español: `\b[a-záéíóúüñ]{2,}\b`. Filtra caracteres aislados de una letra (salvo conectores pertinentes evaluados en stopwords).

### 3.3 Stop Words y Retención Estratégica de Negaciones
En clasificación de sentimiento, la eliminación ingenua de stopwords representa una falla crítica de diseño:
* *Ejemplo Crítico:* La reseña *"El hotel **no** estuvo mal"* expresa una opinión atenuada o favorable. Si se elimina la palabra *"no"*, la oración se convierte en *"hotel mal"*, invirtiendo por completo la polaridad hacia negativo.
* **Regla de Negocio Implementada:** Se utilizó la lista base de stopwords en español de NLTK (artículos, preposiciones y pronombres vacíos), pero se **retuvieron obligatoriamente todos los términos de polaridad negativa**:
  $$\text{NEGATION\_WORDS} = \{\text{'no', 'nunca', 'jamás', 'tampoco', 'sin', 'nada', 'nadie', 'ni'}\}$$

### 3.4 Comparación Empírica de Morfología: Stemming vs. Lematización
Se contrastó el impacto de la reducción morfológica por raíces léxicas (*SnowballStemmer* de NLTK) frente a la reducción contextual por lemas de diccionario (*es_core_news_sm* de spaCy):

| Enfoque Morfológico | Algoritmo / Librería | Accuracy Test | F1-Score Macro | Observación Lingüística |
| :--- | :--- | :---: | :---: | :--- |
| **Stemming** | Snowball (NLTK) | 95,97% | 0,9597 | Trunca sufijos mecánicamente (*habitaciones* $\rightarrow$ *habit*). Genera raíces no canónicas. |
| **Lematización** *(Elegido)* | spaCy (*es_core_news_sm*) | **96,42%** | **0,9642** | Resuelve formas verbales irregulares (*estuvimos* $\rightarrow$ *estar*) y preserva significado real. |

**Justificación:** La lematización contextual incrementó el F1-Score en +0,45% y produce representaciones interpretables tanto para la vectorización como para la visualización paso a paso en el frontend.

### 3.5 Comparación de N-gramas en Vectorización TF-IDF
Se evaluó el efecto de representar el texto como palabras independientes frente a secuencias de dos palabras contiguas:

| Configuración N-gramas | Dimensión Vocabulario | Accuracy Test | F1-Score Macro | Ganancia Empírica |
| :--- | :---: | :---: | :---: | :--- |
| **Solo Unigramas (1, 1)** | 5.000 términos | 95,53% | 0,9552 | Línea base léxica unigramas. |
| **Unigramas + Bigramas (1, 2)** *(Elegido)* | 5.000 términos | **96,42%** | **0,9642** | **+0,90% F1-score**. Captura combinaciones cruciales: *"no_recomiendo"*, *"muy_limpio"*, *"sin_ruido"*. |

### 3.6 Parámetros Centralizados de TF-IDF (`src/config.py`)
* `ngram_range = (1, 2)`: Captura tanto conceptos léxicos aislados como expresiones compuestas.
* `max_features = 5000`: Vocabulario óptimo que retiene el 98,2% de la masa de frecuencias del corpus hotelero.
* `min_df = 2`: Elimina términos tipográficos ultra-raros que solo aparecen una vez en todo el corpus.
* `max_df = 0.85`: Excluye palabras que aparecen en más del 85% de los documentos (redundantes).
* `sublinear_tf = True`: Aplica escalado logarítmico $\text{TF}_{\text{sub}} = 1 + \log(\text{TF})$, atenuando el impacto de palabras repetidas múltiples veces en reseñas extensas.

---

## 4. Modelos de Machine Learning y Evaluación Comparativa

### 4.1 Tabla Comparativa de Modelos
Se evaluaron los dos modelos seleccionados bajo exactamente las mismas particiones de entrenamiento y prueba (894 muestras de test nunca vistas):

| Modelo de Clasificación | Tipo de Algoritmo | Accuracy Test | Precision Macro | Recall Macro | F1-Score Macro | Tiempo Entrenamiento | Latencia Inferencia |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Regresión Logística** *(Producción)* | Lineal Probabilístico (TF-IDF) | **96,42%** | **0,9650** | **0,9642** | **0,9642** | **25,0 s** | **12,1 ms / req** |
| **Random Forest** | Ensamble no lineal (100 árboles) | 94,74% | 0,9486 | 0,9474 | 0,9474 | 23,7 s | 24,7 ms / req |

### 4.2 Justificación de la Elección de Regresión Logística para Producción
1. **Rendimiento Predictivo Superior:** Supera a Random Forest en +1,68 puntos porcentuales de F1-Score en el conjunto de prueba independiente.
2. **Latencia y Eficiencia en Producción:** La inferencia por petición es **el doble de rápida** (12,1 ms vs. 24,7 ms), lo cual es crítico para servicios web en tiempo real.
3. **Interpretabilidad Matemática Directa:** Como modelo lineal, cada coeficiente $w_i$ representa el peso logarítmico exacto que inclina la predicción hacia positivo ($w_i > 0$, ej. *"excelente"*, *"amplio"*, *"atento"*) o hacia negativo ($w_i < 0$, ej. *"pésimo"*, *"sucio"*, *"descompuesto"*), eliminando el efecto de "caja negra".
4. **Principio de Parsimonia (Navaja de Ockham):** Entre dos modelos con rendimiento similar, el modelo más simple, interpretable y liviano es la mejor decisión de ingeniería.

### 4.3 Ajuste de Hiperparámetros con Validación Cruzada Estratificada ($k=5$)
El modelo se optimizó mediante `GridSearchCV` sobre el conjunto de entrenamiento con 5 pliegues estratificados explorando la fuerza de regularización $C \in [0.01, 0.1, 1.0, 5.0, 10.0]$:
* **Mejor Hiperparámetro:** $C = 5.0$ (penalización L2 con mayor flexibilidad de ajuste sobre rasgos TF-IDF).
* **Mejor F1-Score en CV:** $0,9558 \pm 0,0061$.
* **Convergencia:** Optimizador `lbfgs` con `max_iter = 1000`.

### 4.4 Matriz de Confusión sobre Conjunto de Prueba ($N = 894$)

```
                       PREDICCIÓN
                  Negativo    Positivo
 REAL  Negativo      439          8      (Especificidad: 98,21%)
       Positivo       24        423      (Sensibilidad:  94,63%)
```

* **Verdaderos Negativos (TN):** 439 reseñas negativas identificadas correctamente.
* **Falsos Positivos (FP) - Error Tipo I:** Solo 8 reseñas negativas clasificadas erróneamente como positivas (tasa de falsa alarma: 1,79%).
* **Falsos Negativos (FN) - Error Tipo II:** 24 reseñas positivas clasificadas erróneamente como negativas (tasa de omisión: 5,37%).
* **Verdaderos Positivos (TP):** 423 reseñas positivas identificadas correctamente.
* **Tasa de Error Global:** Únicamente 32 errores en 894 reseñas (3,58% de error total).

### 4.5 Análisis Cualitativo de Errores
El análisis de los casos mal clasificados reveló dos patrones de error principales del dominio:
1. **Quejas secundarias en reseñas globales favorables (Falsos Negativos):**
   * *Caso real:* *"El hotel es muy lindo, las piscinas espectaculares, pero la comida del buffet estaba baja de sal y la carne fría."*
   * *Explicación técnica:* La presencia de palabras altamente negativas (*"baja de sal"*, *"fría"*) ponderadas por TF-IDF inclinaron la probabilidad calculada por debajo del umbral de 0,50, a pesar de que la intención global del cliente era positiva.
2. **Sarcasmo e ironía sutil (Falsos Positivos):**
   * *Caso real:* *"Una maravilla de hotel si disfrutas que el aire acondicionado gotee toda la noche y que nadie conteste en recepción."*
   * *Explicación técnica:* El modelo lineal detecta términos con alto peso positivo (*"maravilla"*, *"disfrutas"*) sin poder capturar la inversión de sentido contextual por ironía.

---

## 5. Arquitectura del Sistema (5 Capas Desacopladas)

El sistema se estructura siguiendo un patrón desacoplado de microservicios:

```
[ Capa 1: Datos y EDA ]
       │  (data/raw/hotel_reviews_es.csv ──→ notebooks/01_eda_exploratorio.ipynb)
       ▼
[ Capa 2: Pipeline de PLN ]  ──→  Serialización Joblib  ──→  [ models/sentix_pipeline.joblib ]
       │  (Normalizer, Tokenizer, Stopwords, Morphology)             │
       ▼                                                             ▼
[ Capa 3: Modelado ML ]      ──→  Auditoría y Métricas  ──→  [ models/metrics_report.json ]
       │  (LogisticRegression + GridSearchCV)                         │
       ▼                                                             ▼
[ Capa 4: API REST Backend ] ◄────────────────────────────────────────┘
       │  (FastAPI: /predict, /predict-batch, /nlp-steps, /metrics, /config, /health)
       ▼
[ Capa 5: Frontend Web ]
          (React 18 + Vite + Tailwind CSS: Clasificador en vivo, PLN paso a paso, Métricas y Batch)
```

1. **Capa 1 (Datos):** Almacenamiento versionado de datos crudos y particiones procesadas en `data/`.
2. **Capa 2 (PLN):** Módulos puros en `src/nlp/` empaquetados en transformador Scikit-Learn.
3. **Capa 3 (Modelos):** Entrenamiento reproducible en `src/models/train.py`, serialización en `models/sentix_pipeline.joblib` y script de auditoría en `src/models/verify_artifact.py`.
4. **Capa 4 (Backend):** Servidor FastAPI en `api/main.py`. Valida entradas con Pydantic, expone contratos OpenAPI (`/docs`), resuelve CORS y sirve la aplicación compilada.
5. **Capa 5 (Frontend):** Interfaz web moderna construida en React 18, Vite y Tailwind CSS bajo la regla de color 60-30-10, cero emojis y modal unificado de feedback.

---

## 6. Reproducibilidad y Despliegue

* **Script de Un Solo Comando para Entrenamiento:**
  ```bash
  python -m src.models.train
  ```
* **Script de Verificación y Auditoría de Consistencia:**
  ```bash
  python -m src.models.verify_artifact
  ```
* **Suite de Pruebas Automatizadas:**
  ```bash
  python -m pytest tests/
  ```
* **Arranque Rápido en Windows (Script de Automatización):**
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\start.ps1
  ```
* **Contenedorización Docker (Opcional / Valor Agregado):**
  El proyecto cuenta con `Dockerfile` y `docker-compose.yml` multi-etapa que compila el frontend en Node.js, empaqueta el backend en Python 3.13 con spaCy y expone el servicio completo en el puerto 8000 con un solo comando: `docker compose up --build`.

---

## 7. Declaración de Honestidad Académica y Asistentes de IA

En cumplimiento con la Sección 10 del documento de especificación del Proyecto Integrador:
* **Uso de Asistentes de IA:** Se utilizaron herramientas de asistencia agentica de IA (Google Antigravity / Gemini) como apoyo en la generación de código boilerplate, optimización de pruebas unitarias y maquetación de componentes React.
* **Declaración de Autoría y Comprensión:** Todos los integrantes del equipo diseñaron la arquitectura, definieron las reglas del pipeline de PLN, supervisaron las decisiones matemáticas y comprenden en su totalidad el código fuente, estando capacitados para explicarlo individualmente y realizar modificaciones en vivo durante la defensa.

