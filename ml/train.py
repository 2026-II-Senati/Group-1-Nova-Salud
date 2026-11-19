import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import TimeSeriesSplit, GridSearchCV
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1. RUTAS DINÁMICAS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_CSV = os.path.join(BASE_DIR, 'data', 'processed', 'dataset_nova_salud.csv')
RUTA_MODELO = os.path.join(BASE_DIR, 'modelo.pkl')

print("Iniciando entrenamiento HONESTO y evaluación temporal...")
df = pd.read_csv(RUTA_CSV, sep=';')

# 2. DEFINIR VARIABLES (ELIMINAMOS clientes_totales del día objetivo)
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
# MÉTODO DE REFERENCIA (NAIVE FORECAST)
# =====================================================================
# Predice que hoy se venderá exactamente lo mismo que ayer.
pred_naive = X_test['ventas_ayer']
mae_naive = mean_absolute_error(y_test, pred_naive)
rmse_naive = np.sqrt(mean_squared_error(y_test, pred_naive))
r2_naive = r2_score(y_test, pred_naive)

# =====================================================================
# MODELO 1: REGRESIÓN LINEAL
# =====================================================================
modelo_lineal = LinearRegression()
modelo_lineal.fit(X_train, y_train)
pred_lineal = modelo_lineal.predict(X_test)
mae_lineal = mean_absolute_error(y_test, pred_lineal)
rmse_lineal = np.sqrt(mean_squared_error(y_test, pred_lineal))
r2_lineal = r2_score(y_test, pred_lineal)

# =====================================================================
# MODELO 2: RANDOM FOREST CON GRIDSEARCHCV (Entrenando en Train, Validando en Val)
# =====================================================================
print("\nOptimizando Random Forest (esto puede tomar unos segundos)...")
parametros = {'n_estimators': [50, 100, 200], 'max_depth': [None, 10, 20]}
rf_base = RandomForestRegressor(random_state=42)

# Usamos X_val e y_val para encontrar los mejores hiperparámetros
grid_rf = GridSearchCV(estimator=rf_base, param_grid=parametros, cv=3, scoring='neg_mean_absolute_error', n_jobs=-1)
grid_rf.fit(X_val, y_val)

print(f"Mejores hiperparámetros: {grid_rf.best_params_}")

# Re-entrenamos el mejor modelo usando Train + Val (ahora sí, con todo el pasado)
mejor_rf = grid_rf.best_estimator_
mejor_rf.fit(pd.concat([X_train, X_val]), pd.concat([y_train, y_val]))

# Evaluamos en el conjunto de PRUEBA (el futuro que nunca vio)
pred_rf = mejor_rf.predict(X_test)
mae_rf = mean_absolute_error(y_test, pred_rf)
rmse_rf = np.sqrt(mean_squared_error(y_test, pred_rf))
r2_rf = r2_score(y_test, pred_rf)

# =====================================================================
# COMPARATIVA FINAL Y EXPORTACIÓN
# =====================================================================
print("\n--- RESULTADOS EN EL CONJUNTO DE PRUEBA (Futuro no visto) ---")
print(f"Naive (Ayer)   -> MAE: {mae_naive:.2f} | RMSE: {rmse_naive:.2f} | R2: {r2_naive:.4f}")
print(f"Reg. Lineal    -> MAE: {mae_lineal:.2f} | RMSE: {rmse_lineal:.2f} | R2: {r2_lineal:.4f}")
print(f"Random Forest  -> MAE: {mae_rf:.2f} | RMSE: {rmse_rf:.2f} | R2: {r2_rf:.4f}")

# Guardamos el modelo ganador (el que tenga menor MAE)
if mae_rf < mae_lineal and mae_rf < mae_naive:
    print("\n¡El ganador es Random Forest!")
    joblib.dump(mejor_rf, RUTA_MODELO)
else:
    print("\n¡El ganador es la Regresión Lineal!")
    joblib.dump(modelo_lineal, RUTA_MODELO)

print(f"\nModelo exportado a: {RUTA_MODELO}")