import pandas as pd
import os

# 1. RUTAS
# Pon aquí el nombre exacto de tu archivo Excel (asegúrate de que esté en data/raw/)
RUTA_EXCEL = 'C:\\Users\\Edward\\Documents\\Clone\\Group-1-Nova-Salud\\ml\\data\\raw\\Pharmacy_data.xlsx' 
RUTA_SALIDA = 'C:\\Users\\Edward\\Documents\\Clone\\Group-1-Nova-Salud\\ml\\data\\processed\\dataset_nova_salud.csv'

print("Iniciando limpieza de datos...")

# 2. CARGAR DATOS DE LAS PESTAÑAS
ventas = pd.read_excel(RUTA_EXCEL, sheet_name='FactSales')
productos = pd.read_excel(RUTA_EXCEL, sheet_name='DimProduct')

# 3. UNIR TABLAS
# Usamos 'ProductID' porque es el nombre de la columna en FactSales
df = pd.merge(ventas, productos, on='ProductID', how='left')

# 4. LIMPIAR FECHA
# DateKey viene como número (20240101), lo convertimos a texto y luego a fecha real
df['DateKey'] = pd.to_datetime(df['DateKey'].astype(str), format='%Y%m%d')

# 5. LIMPIAR PRECIO
# RevenueEUR tiene el símbolo € y comas. Quitamos el € y cambiamos coma por punto.
# Usamos regex=False para que no se confunda con caracteres especiales.
df['RevenueEUR'] = df['RevenueEUR'].astype(str).str.replace('€', '', regex=False).str.replace(',', '.', regex=False)
df['RevenueEUR'] = pd.to_numeric(df['RevenueEUR'], errors='coerce') # Convierte a número

# 6. CONVERTIR A SOLES
df['ventas_totales'] = df['RevenueEUR'] * 4.0

# 7. RENOMBRAR
df = df.rename(columns={
    'DateKey': 'fecha',
    'UnitsSold': 'cantidad'
})

# 8. SELECCIONAR Y AGRUPAR
df = df[['fecha', 'cantidad', 'ventas_totales']]
df = df.dropna() # Quitar filas con valores vacíos

# Sumar todas las ventas del día
df_diario = df.groupby('fecha').agg({
    'cantidad': 'sum',
    'ventas_totales': 'sum' 
}).reset_index()

# 9. GUARDAR
os.makedirs('C:\\Users\\Edward\\Documents\\Clone\\Group-1-Nova-Salud\\ml\\data\\processed', exist_ok=True)
df_diario.to_csv(RUTA_SALIDA, index=False)

print(f"¡Limpieza terminada! Archivo guardado en: {RUTA_SALIDA}")
print(f"Total de días registrados: {len(df_diario)}")