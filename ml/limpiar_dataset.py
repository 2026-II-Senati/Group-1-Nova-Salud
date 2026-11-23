import pandas as pd
import os

# 1. RUTAS DINÁMICAS (Funcionan en cualquier PC)
# Detecta la carpeta actual donde está este script (la carpeta 'ml')
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Armamos las rutas de forma segura
RUTA_CSV_ENTRADA = os.path.join(BASE_DIR, 'data', 'raw', 'rossmann.csv')
RUTA_CSV_SALIDA = os.path.join(BASE_DIR, 'data', 'processed', 'dataset_nova_salud.csv')

print("Iniciando limpieza de datos de Rossmann...")

# 2. CARGAR DATOS
df = pd.read_csv(RUTA_CSV_ENTRADA, low_memory=False)

# 3. LIMPIAR FILAS INVÁLIDAS (Tiendas cerradas o sin ventas)
df = df[df['Open'] == 1]
df = df[df['Sales'] > 0]

# 4. LIMPIAR FECHA
df['Date'] = pd.to_datetime(df['Date'])

# 5. AGRUPAR POR DÍA
df_diario = df.groupby('Date').agg({
    'Sales': 'sum',
    'Customers': 'sum',
    'Promo': 'max',        
    'SchoolHoliday': 'max' 
}).reset_index()

df_diario = df_diario.rename(columns={
    'Date': 'fecha',
    'Sales': 'ventas_totales',
    'Customers': 'clientes_totales'
})

# 6. CREACIÓN DE VARIABLES (FEATURES)
df_diario['ventas_ayer'] = df_diario['ventas_totales'].shift(1)
df_diario['ventas_hace_7_dias'] = df_diario['ventas_totales'].shift(7)
df_diario['promedio_7_dias'] = df_diario['ventas_totales'].shift(1).rolling(window=7).mean()

df_diario['dia_semana'] = df_diario['fecha'].dt.dayofweek
df_diario['mes'] = df_diario['fecha'].dt.month
df_diario['dia_mes'] = df_diario['fecha'].dt.day

# Eliminar los primeros 7 días (porque no tienen historia completa)
df_diario = df_diario.dropna()

# 7. GUARDAR
os.makedirs(os.path.join(BASE_DIR, 'data', 'processed'), exist_ok=True)
df_diario.to_csv(RUTA_CSV_SALIDA, index=False, sep=';')

print(f"¡Limpieza terminada! Total de días: {len(df_diario)}")
print(f"Archivo guardado en: {RUTA_CSV_SALIDA}")