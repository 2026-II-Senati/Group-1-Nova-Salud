import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

RUTA_CSV = 'C:\\Users\\User\\Group-1-Nova-Salud\\ml\\data\\processed\\dataset_nova_salud.csv'
RUTA_MODELO = 'C:\\Users\\User\\Group-1-Nova-Salud\\ml\\modelo.pkl'

print("Iniciando entrenamiento del modelo con Rossmann...")
df = pd.read_csv(RUTA_CSV, sep=';')

# Le damos al modelo MUCHAS más pistas
X = df[['ventas_ayer', 'ventas_hace_7_dias', 'promedio_7_dias', 
        'dia_semana', 'mes', 'dia_mes', 'Promo', 'SchoolHoliday', 'clientes_totales']]
y = df['ventas_totales']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

# Modelo 1: Lineal
modelo_lineal = LinearRegression(fit_intercept=True)
modelo_lineal.fit(X_train, y_train)
pred_lineal = modelo_lineal.predict(X_test)
mae_lineal = mean_absolute_error(y_test, pred_lineal)
r2_lineal = r2_score(y_test, pred_lineal)

# Modelo 2: Random Forest
modelo_rf = RandomForestRegressor(n_estimators=100, random_state=42)
modelo_rf.fit(X_train, y_train)
pred_rf = modelo_rf.predict(X_test)
mae_rf = mean_absolute_error(y_test, pred_rf)
r2_rf = r2_score(y_test, pred_rf)

print("\n--- RESULTADOS ---")
print(f"Regresión Lineal -> MAE: {mae_lineal:.2f} | R2: {r2_lineal:.2f}")
print(f"Random Forest    -> MAE: {mae_rf:.2f} | R2: {r2_rf:.2f}")

if mae_rf < mae_lineal:
    print("\n¡El ganador es Random Forest!")
    joblib.dump(modelo_rf, RUTA_MODELO)
else:
    print("\n¡El ganador es Regresión Lineal!")
    joblib.dump(modelo_lineal, RUTA_MODELO)