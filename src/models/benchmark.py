import time
import pandas as pd
from sklearn.model_selection import train_test_split
from src.config import RAW_DATASET_PATH, RANDOM_STATE, TEST_SIZE
from src.nlp.pipeline import TextPreprocessor
from src.models.logistic_regression import build_logistic_regression_pipeline
from src.models.random_forest import build_random_forest_pipeline
from src.models.evaluate import calculate_classification_metrics

df = pd.read_csv(RAW_DATASET_PATH)
X_train, X_test, y_train, y_test = train_test_split(
    df["review_text"].astype(str).tolist(),
    df["sentiment"].astype(int).tolist(),
    test_size=TEST_SIZE,
    stratify=df["sentiment"],
    random_state=RANDOM_STATE,
)

# 1. Regresión Logística (Lematización + Bigramas) - Modelo de Producción
t0 = time.time()
pipe_lr = build_logistic_regression_pipeline()
pipe_lr.fit(X_train, y_train)
t_train_lr = time.time() - t0

t0 = time.time()
preds_lr = pipe_lr.predict(X_test)
probs_lr = pipe_lr.predict_proba(X_test)[:, 1]
t_infer_lr = (time.time() - t0) / len(X_test) * 1000
metrics_lr = calculate_classification_metrics(y_test, preds_lr, probs_lr)

# 2. Random Forest (Lematización + Bigramas)
t0 = time.time()
pipe_rf = build_random_forest_pipeline()
pipe_rf.fit(X_train, y_train)
t_train_rf = time.time() - t0

t0 = time.time()
preds_rf = pipe_rf.predict(X_test)
probs_rf = pipe_rf.predict_proba(X_test)[:, 1]
t_infer_rf = (time.time() - t0) / len(X_test) * 1000
metrics_rf = calculate_classification_metrics(y_test, preds_rf, probs_rf)

# 3. Regresión Logística solo con Unigramas (1, 1)
pipe_unigram = build_logistic_regression_pipeline()
pipe_unigram.set_params(vectorizer__ngram_range=(1, 1))
pipe_unigram.fit(X_train, y_train)
preds_unigram = pipe_unigram.predict(X_test)
probs_unigram = pipe_unigram.predict_proba(X_test)[:, 1]
metrics_unigram = calculate_classification_metrics(y_test, preds_unigram, probs_unigram)

# 4. Regresión Logística con Stemming en vez de Lematización
prep_stem = TextPreprocessor(use_lemmatization=False)
pipe_stem = build_logistic_regression_pipeline(preprocessor=prep_stem)
pipe_stem.fit(X_train, y_train)
preds_stem = pipe_stem.predict(X_test)
probs_stem = pipe_stem.predict_proba(X_test)[:, 1]
metrics_stem = calculate_classification_metrics(y_test, preds_stem, probs_stem)

print("--- RESULTADOS DEL BENCHMARK EXPERIMENTAL ---")
print(f"1. Regresion Logistica (Lema + Bigramas): Acc={metrics_lr['accuracy']:.4f}, F1={metrics_lr['f1_macro']:.4f}, Precision={metrics_lr['precision_macro']:.4f}, Recall={metrics_lr['recall_macro']:.4f}, Train={t_train_lr:.2f}s, Latencia={t_infer_lr:.2f}ms")
print(f"2. Random Forest (Lema + Bigramas):      Acc={metrics_rf['accuracy']:.4f}, F1={metrics_rf['f1_macro']:.4f}, Precision={metrics_rf['precision_macro']:.4f}, Recall={metrics_rf['recall_macro']:.4f}, Train={t_train_rf:.2f}s, Latencia={t_infer_rf:.2f}ms")
print(f"3. Regresion Logistica (Solo Unigramas): Acc={metrics_unigram['accuracy']:.4f}, F1={metrics_unigram['f1_macro']:.4f}, Precision={metrics_unigram['precision_macro']:.4f}, Recall={metrics_unigram['recall_macro']:.4f}")
print(f"4. Regresion Logistica (Con Stemming):   Acc={metrics_stem['accuracy']:.4f}, F1={metrics_stem['f1_macro']:.4f}, Precision={metrics_stem['precision_macro']:.4f}, Recall={metrics_stem['recall_macro']:.4f}")

