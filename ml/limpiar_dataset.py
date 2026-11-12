import pandas as pd
import os

# 1. Definir rutas de archivos
# Asumimos que los archivos del ZIP se llaman así. ¡Cámbialos si se llaman distinto!
RUTA_VENTAS = 'data/raw/FactSales.csv' 
RUTA_PRODUCTOS = 'data/raw/DimProduct.csv'
RUTA_SALIDA = 'data/processed/dataset_nova_salud.csv'

print("Iniciando limpieza de datos...")

# 2. Cargar los datos
try:
    ventas = pd.read_csv(RUTA_VENTAS)
    productos = pd.read_csv(RUTA_PRODUCTOS)
    print("Datos cargados correctamente.")
except FileNotFoundError:
    print("Error: No se encontraron los archivos. Revisa las rutas en el script.")
    exit()

# 3. Unir ventas con productos (JOIN) usando el ID del producto
# Aquí unimos la tabla de ventas con la de productos para saber qué se vendió
df = pd.merge(ventas, productos, on='ProductID', how='left')

# 4. Limpieza y Transformación
# Convertir la fecha a formato datetime
df['Date'] = pd.to_datetime(df['Date'])

# Convertir de Euros a Soles (asumiendo un cambio de 4.0)
TIPO_CAMBIO_EUR_A_PEN = 4.0
df['Precio_PEN'] = df['Revenue'] * TIPO_CAMBIO_EUR_A_PEN

# Renombrar columnas para que coincidan con lo que espera el modelo
df = df.rename(columns={
    'Date': 'fecha',
    'Units': 'cantidad',
    'Precio_PEN': 'precio_unitario',
    'Product': 'producto'
})

# Eliminar columnas que no usaremos (para no ensuciar el dataset)
columnas_a_mantener = ['fecha', 'cantidad', 'precio_unitario', 'producto']
df = df[columnas_a_mantener]

# Eliminar nulos o cantidades en 0 (ventas inválidas)
df = df.dropna()
df = df[df['cantidad'] > 0]

# 5. Agrupar por DÍA
# El modelo de predicción necesita saber cuánto se vendió en total CADA DÍA, no transacción por transacción.
df_diario = df.groupby('fecha').agg({
    'cantidad': 'sum',
    'precio_unitario': 'sum' # Sumamos todos los ingresos del día
}).reset_index()

# Renombrar a "ventas_totales" para que sea más claro
df_diario = df_diario.rename(columns={'precio_unitario': 'ventas_totales'})

# 6. Guardar el CSV limpio
os.makedirs('data/processed', exist_ok=True)
df_diario.to_csv(RUTA_SALIDA, index=False)

print(f"¡Limpieza terminada! Archivo guardado en: {RUTA_SALIDA}")
print(f"Total de días registrados: {len(df_diario)}")