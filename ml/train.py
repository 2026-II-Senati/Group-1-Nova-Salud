import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import TimeSeriesSplit, GridSearchCV
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1. RUTAS DINÁMICAS (funciona sin importar desde dónde se ejecute)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_CSV = os.path.join(BASE_DIR, 'data', 'processed', 'dataset_nova_salud.csv')
RUTA_MODELO = os.path.join(BASE_DIR, 'modelo.pkl')

print("Iniciando entrenamiento y evaluación...")
df = pd.read_csv(RUTA_CSV, sep=';')

# 2. VARIABLES (sin clientes_totales del día objetivo)
X = df[['ventas_ayer', 'ventas_hace_7_dias', 'promedio_7_dias',
        'dia_semana', 'mes', 'dia_mes', 'Promo', 'SchoolHoliday']]
y = df['ventas_totales']

# 3. DIVISIÓN TEMPORAL EN 3 BLOQUES (Train 70%, Val 15%, Test 15%)
n = len(df)
train_end = int(n * 0.70)
val_end = int(n * 0.85)

X_train, y_train = X.iloc[:train_end], y.iloc[:train_end]
X_val, y_val = X.iloc[train_end:val_end], y.iloc[train_end:val_end]
X_test, y_test = X.iloc[val_end:], y.iloc[val_end:]

print(f"Bloques -> Entrenamiento: {len(X_train)} | Validación: {len(X_val)} | Prueba: {len(X_test)}")

# =====================================================================
# ETAPA 1: COMPARAR LOS MODELOS SOLO EN VALIDACIÓN
# =====================================================================

# --- Referencia: Naive (predice que hoy se vende lo mismo que ayer) ---
pred_naive_val = X_val['ventas_ayer']
mae_naive_val = mean_absolute_error(y_val, pred_naive_val)

# --- Modelo 1: Regresión Lineal (entrena en train, se mide en val) ---
modelo_lineal = LinearRegression()
modelo_lineal.fit(X_train, y_train)
pred_lineal_val = modelo_lineal.predict(X_val)
mae_lineal_val = mean_absolute_error(y_val, pred_lineal_val)

# --- Modelo 2: Random Forest (búsqueda SOLO con train, respetando el tiempo) ---
print("\nOptimizando Random Forest (esto puede tomar unos segundos)...")
parametros = {'n_estimators': [50, 100, 200], 'max_depth': [None, 10, 20]}
rf_base = RandomForestRegressor(random_state=42)

# TimeSeriesSplit hace pliegues que respetan el orden de las fechas
tscv = TimeSeriesSplit(n_splits=3)
grid_rf = GridSearchCV(estimator=rf_base, param_grid=parametros, cv=tscv,
                       scoring='neg_mean_absolute_error', n_jobs=-1)
grid_rf.fit(X_train, y_train)
print(f"Mejores hiperparámetros: {grid_rf.best_params_}")

mejor_rf = grid_rf.best_estimator_
pred_rf_val = mejor_rf.predict(X_val)
mae_rf_val = mean_absolute_error(y_val, pred_rf_val)

print("\n--- RESULTADOS EN VALIDACIÓN (aquí se elige al ganador) ---")
print(f"Naive (Ayer)   -> MAE: {mae_naive_val:.2f}")
print(f"Reg. Lineal    -> MAE: {mae_lineal_val:.2f}")
print(f"Random Forest  -> MAE: {mae_rf_val:.2f}")

# =====================================================================
# ETAPA 2: ELEGIR GANADOR CON VALIDACIÓN
# =====================================================================
if mae_rf_val <= mae_lineal_val:
    print("\nGanador en validación: Random Forest")
    ganador = mejor_rf
    nombre_ganador = "Random Forest"
else:
    print("\nGanador en validación: Regresión Lineal")
    ganador = modelo_lineal
    nombre_ganador = "Regresión Lineal"

if mae_naive_val < min(mae_lineal_val, mae_rf_val):
    print("Aviso: el Naive superó a los modelos. Revisar features con el equipo.")

# =====================================================================
# ETAPA 3: REENTRENAR EL GANADOR CON TRAIN + VAL Y EVALUAR EN PRUEBA
# =====================================================================
X_train_val = pd.concat([X_train, X_val])
y_train_val = pd.concat([y_train, y_val])
ganador.fit(X_train_val, y_train_val)

pred_test = ganador.predict(X_test)
mae_test = mean_absolute_error(y_test, pred_test)
rmse_test = np.sqrt(mean_squared_error(y_test, pred_test))
r2_test = r2_score(y_test, pred_test)

# Naive en prueba, solo como referencia
pred_naive_test = X_test['ventas_ayer']
mae_naive_test = mean_absolute_error(y_test, pred_naive_test)
rmse_naive_test = np.sqrt(mean_squared_error(y_test, pred_naive_test))
r2_naive_test = r2_score(y_test, pred_naive_test)

print("\n--- RESULTADO FINAL EN PRUEBA (una sola vez, para el informe) ---")
print(f"Naive (Ayer)          -> MAE: {mae_naive_test:.2f} | RMSE: {rmse_naive_test:.2f} | R2: {r2_naive_test:.4f}")
print(f"{nombre_ganador:<21} -> MAE: {mae_test:.2f} | RMSE: {rmse_test:.2f} | R2: {r2_test:.4f}")

# =====================================================================
# EXPORTACIÓN DEL MODELO
# =====================================================================
joblib.dump(ganador, RUTA_MODELO)
print(f"\nModelo exportado a: {RUTA_MODELO}")
