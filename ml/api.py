from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

app = FastAPI()
modelo = joblib.load('modelo.pkl')

class DatosPrediccion(BaseModel):
    ventas_ayer: float
    ventas_hace_7_dias: float
    promedio_7_dias: float
    dia_semana: int
    mes: int
    dia_mes: int
    clientes_totales: float
    # ¡Ojo aquí! Con mayúscula inicial para que coincida con el modelo
    Promo: int
    SchoolHoliday: int

@app.post("/predecir")
def predecir(datos: DatosPrediccion):
    df = pd.DataFrame([datos.model_dump()]) # Usamos model_dump() para evitar el warning de pydantic
    
    # El orden exacto de las columnas como se entrenó
    columnas = ['ventas_ayer', 'ventas_hace_7_dias', 'promedio_7_dias', 
                'dia_semana', 'mes', 'dia_mes', 'Promo', 'SchoolHoliday', 'clientes_totales']
    df = df[columnas]
    
    prediccion = modelo.predict(df)[0]
    return {"ventas_estimadas": round(float(prediccion), 2)}