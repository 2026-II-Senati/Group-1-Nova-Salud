import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# 1. RUTAS DINÁMICAS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_CSV = os.path.join(BASE_DIR, 'data', 'processed', 'dataset_nova_salud.csv')
RUTA_MODELO = os.path.join(BASE_DIR, 'modelo.pkl')

print("Iniciando entrenamiento y optimización...")
df = pd.read_csv(RUTA_CSV, sep=';')

# 2. DEFINIR VARIABLES
X = df[['ventas_ayer', 'ventas_hace_7_dias', 'promedio_7_dias', 
        'dia_semana', 'mes', 'dia_mes', 'Promo', 'SchoolHoliday', 'clientes_totales']]
y = df['ventas_totales']

# 3. DIVIDIR DATOS (80% train, 20% test, sin mezclar para series de tiempo)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

print(f"Días para entrenar: {len(X_train)}")
print(f"Días para probar: {len(X_test)}")

# =====================================================================
# MODELO 1: REGRESIÓN LINEAL
# =====================================================================
print("\nEntrenando Regresión Lineal...")
modelo_lineal = LinearRegression()
modelo_lineal.fit(X_train, y_train)
pred_lineal = modelo_lineal.predict(X_test)
mae_lineal = mean_absolute_error(y_test, pred_lineal)
rmse_lineal = np.sqrt(mean_squared_error(y_test, pred_lineal))
r2_lineal = r2_score(y_test, pred_lineal)

print(f"MAE: {mae_lineal:.2f} | RMSE: {rmse_lineal:.2f} | R2: {r2_lineal:.4f}")

# =====================================================================
# MODELO 2: RANDOM FOREST CON GRIDSEARCHCV
# =====================================================================
print("\nOptimizando Random Forest (esto puede tomar unos segundos)...")
parametros = {
    'n_estimators': [50, 100, 200],      
    'max_depth': [None, 10, 20]          
}

rf_base = RandomForestRegressor(random_state=42)
grid_rf = GridSearchCV(estimator=rf_base, param_grid=parametros, cv=3, scoring='r2', n_jobs=-1)
grid_rf.fit(X_train, y_train)

print("\n--- RESULTADOS DE LA OPTIMIZACIÓN ---")
print(f"Mejores hiperparámetros: {grid_rf.best_params_}")
print(f"Mejor score de validación cruzada: {grid_rf.best_score_:.4f}")

mejor_rf = grid_rf.best_estimator_
pred_rf = mejor_rf.predict(X_test)
mae_rf = mean_absolute_error(y_test, pred_rf)
rmse_rf = np.sqrt(mean_squared_error(y_test, pred_rf))
r2_rf = r2_score(y_test, pred_rf)

print(f"MAE: {mae_rf:.2f} | RMSE: {rmse_rf:.2f} | R2: {r2_rf:.4f}")

# =====================================================================
# COMPARATIVA FINAL Y EXPORTACIÓN
# =====================================================================
print("\n--- RESUMEN FINAL ---")
if mae_rf < mae_lineal:
    print("¡El ganador es Random Forest (Optimizado)!")
    mejor_modelo = mejor_rf
    nombre_ganador = "Random Forest"
else:
    print("¡El ganador es Regresión Lineal!")
    mejor_modelo = modelo_lineal
    nombre_ganador = "Regresión Lineal"

joblib.dump(mejor_modelo, RUTA_MODELO)
print(f"\nModelo ({nombre_ganador}) exportado exitosamente a: {RUTA_MODELO}")