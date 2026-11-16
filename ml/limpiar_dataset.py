import pandas as pd
import os

# 1. RUTAS
RUTA_CSV = 'C:\\Users\\User\\Group-1-Nova-Salud\\ml\\data\\raw\\rossmann.csv' 
RUTA_SALIDA = 'C:\\Users\\User\\Group-1-Nova-Salud\\ml\\data\\processed\\dataset_nova_salud.csv'

print("Iniciando limpieza de datos de Rossmann...")

# 2. CARGAR DATOS
# Usamos low_memory=False porque el archivo es grande (1 millón de filas)
df = pd.read_csv(RUTA_CSV, low_memory=False)

# 3. LIMPIAR FILAS INVÁLIDAS
# En Rossmann, las tiendas cerradas tienen Sales = 0. Esas filas no nos sirven para predecir.
df = df[df['Open'] == 1]
df = df[df['Sales'] > 0]

# 4. LIMPIAR FECHA
df['Date'] = pd.to_datetime(df['Date'])

# 5. AGRUPAR POR DÍA (Sumando las ventas de TODAS las tiendas)
# Como Nova Salud es una botica, sumaremos todas las tiendas para simular la "venta global diaria"
df_diario = df.groupby('Date').agg({
    'Sales': 'sum',
    'Customers': 'sum',
    'Promo': 'max',        # 1 si al menos una tienda tuvo promo
    'SchoolHoliday': 'max' # 1 si fue feriado escolar
}).reset_index()

df_diario = df_diario.rename(columns={
    'Date': 'fecha',
    'Sales': 'ventas_totales',
    'Customers': 'clientes_totales'
})

# =====================================================================
# 6. CREACIÓN DE VARIABLES (FEATURES)
# =====================================================================
# Rezagos (Ventas de días anteriores)
df_diario['ventas_ayer'] = df_diario['ventas_totales'].shift(1)
df_diario['ventas_hace_7_dias'] = df_diario['ventas_totales'].shift(7)

# Promedio de los últimos 7 días (para capturar tendencia)
df_diario['promedio_7_dias'] = df_diario['ventas_totales'].shift(1).rolling(window=7).mean()

# Variables de calendario
df_diario['dia_semana'] = df_diario['fecha'].dt.dayofweek
df_diario['mes'] = df_diario['fecha'].dt.month
df_diario['dia_mes'] = df_diario['fecha'].dt.day

# Eliminar los primeros 7 días (porque no tienen historia completa)
df_diario = df_diario.dropna()

# 7. GUARDAR
os.makedirs('C:\\Users\\User\\Group-1-Nova-Salud\\ml\\data\\processed', exist_ok=True)
df_diario.to_csv(RUTA_SALIDA, index=False, sep=';')

print(f"¡Limpieza terminada! Total de días: {len(df_diario)}")
print(f"Columnas finales: {df_diario.columns.tolist()}")