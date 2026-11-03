| Código | Nombre Clave | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| **CU-01** | Ingesta y Balance de Datos | Carga y depuración del corpus de reseñas hoteleras en español (>1,000 registros balanceados 50/50). | Completado |
| **CU-02** | Análisis Exploratorio de Datos (EDA) | Visualización estadística de balance de clases, longitud de textos, frecuencias y nubes de palabras en Jupyter. | Completado |
| **CU-03** | Partición Estratificada de Datos | División reproducible del dataset en conjuntos de entrenamiento (80%) y prueba aislada (20%). | Completado |
| **CU-04** | Normalización de Texto | Conversión a minúsculas, eliminación de etiquetas HTML/URLs, signos de puntuación y ruido textual. | Completado |
| **CU-05** | Tokenización Léxica | Segmentación de la cadena normalizada en unidades léxicas (tokens) individuales en español. | Completado |
| **CU-06** | Filtrado de Stop Words con Retención de Negación | Remoción de conectores funcionales preservando términos negativos clave (*no*, *nunca*, *jamás*, *sin*, *tampoco*). | Completado |
| **CU-07** | Reducción Morfológica (Stemming vs Lematización) | Comparación de raíces léxicas vía Snowball (NLTK) frente a lemas contextuales vía spaCy (*es_core_news_sm*). | Completado |
| **CU-08** | Vectorización TF-IDF con N-gramas | Transformación de texto preprocesado a matriz numérica ponderando unigramas y bigramas (1, 2) con escala sublineal. | Completado |
| **CU-09** | Transformador Scikit-Learn Unificado | Encapsulación del preprocesamiento en una clase compatible con `Pipeline` para garantizar reproducibilidad. | Completado |
| **CU-10** | Entrenamiento de Regresión Logística | Ajuste y optimización de clasificador lineal probabilístico con regularización L2 y validación cruzada. | Completado |
| **CU-11** | Entrenamiento de Random Forest | Ajuste de modelo de ensamble no lineal basado en árboles de decisión para contraste de rendimiento. | Completado |
| **CU-12** | Evaluación Comparativa de Rendimiento | Cálculo riguroso de métricas de clasificación en test set: Accuracy, Precision, Recall y F1-score macro/ponderado. | Completado |
| **CU-13** | Generación de Matriz de Confusión | Cuantificación y mapeo de Verdaderos Negativos, Falsos Positivos, Falsos Negativos y Verdaderos Positivos. | Completado |
| **CU-14** | Análisis Cualitativo de Errores | Extracción estructurada de casos mal clasificados para diagnóstico de ambigüedad, ironía o quejas sutiles. | Completado |
| **CU-15** | Serialización y Persistencia de Artefactos | Exportación del pipeline entrenado a formato `.joblib` y de las métricas de rendimiento a `.json`. | Completado |
| **CU-16** | Endpoint de Salud del Servicio (`GET /api/health`) | Verificación del estado de disponibilidad de la API y confirmación de carga del modelo en memoria. | Completado |
| **CU-17** | Endpoint de Inferencia Individual (`POST /api/predict`) | Clasificación de polaridad de una reseña con estimación de probabilidades y cálculo de confianza. | Completado |
| **CU-18** | Endpoint de Explicabilidad PLN (`POST /api/nlp-steps`) | Desglose interactivo paso a paso de cada fase de preprocesamiento aplicada a una reseña específica. | Completado |
| **CU-19** | Endpoint de Métricas de Modelo (`GET /api/metrics`) | Entrega de matriz de confusión, reporte por categoría y muestras de análisis de errores en formato JSON. | Completado |
| **CU-20** | Endpoint de Inferencia por Lote (`POST /api/predict-batch`) | Clasificación simultánea de múltiples reseñas con consolidación de totales y proporciones. | Completado |
| **CU-21** | Validación Estricta de Esquemas (Pydantic) | Control de entradas en API: rechazo de textos vacíos, validación de longitudes mínimas y tipado estricto. | Completado |
| **CU-22** | Servidor de Aplicación Estática | Montaje y distribución del bundle compilado del frontend directamente desde la instancia de FastAPI. | Completado |
| **CU-23** | Interfaz de Entrada y Casos Rápidos | Formulario con atajo `Ctrl+Enter` y botones de prueba (favorable, desfavorable, con negación, mixta). | Completado |
| **CU-24** | Visualizador de Predicción de Sentimiento | Panel de resultado con etiqueta semántica, porcentaje de confianza y barras proporcionales animadas. | Completado |
| **CU-25** | Visualizador Secuencial de Fases PLN | Inspección gráfica de las 4 fases de PLN con resaltado técnico de términos de negación retenidos. | Completado |
| **CU-26** | Dashboard de Métricas y Matriz 2x2 | Panel interactivo de evaluación con tarjetas de KPIs, matriz de confusión visual y tabla por categoría. | Completado |
| **CU-27** | Módulo de Inspección de Errores | Visor cualitativo de muestras de error reales con etiqueta real, predicha y probabilidad asociada. | Completado |
| **CU-28** | Procesamiento Masivo por CSV y Texto | Carga de archivos delimitados o pegado de múltiples líneas para inferencia concurrente en navegador. | Completado |
| **CU-29** | Exportación de Resultados a CSV | Generación y descarga en cliente de archivo CSV con identificador, texto, polaridad y probabilidades. | Completado |
| **CU-30** | Modal Unificado de Notificaciones | Ventana modal centralizada accesible para advertencias, confirmaciones y gestión de errores. | Completado |
| **CU-31** | Monitor de Conexión de API | Indicador en tiempo real del estado de enlace y comunicación entre la interfaz de usuario y el backend. | Completado |

