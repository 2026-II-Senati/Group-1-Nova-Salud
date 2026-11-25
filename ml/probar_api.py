import requests

url = "http://127.0.0.1:8000/predecir"

datos_prueba = {
    "ventas_ayer": 500000,
    "ventas_hace_7_dias": 480000,
    "promedio_7_dias": 490000,
    "dia_semana": 3,
    "mes": 11,
    "dia_mes": 15,
    "Promo": 1,
    "SchoolHoliday": 0
}

print("Enviando datos al modelo...")
respuesta = requests.post(url, json=datos_prueba)

if respuesta.status_code == 200:
    resultado = respuesta.json()
    print("\n¡PREDICCIÓN EXITOSA! ✅")
    print(f"Ventas estimadas: {resultado['ventas_estimadas']:.2f}")
else:
    print(f"Error del servidor: {respuesta.status_code}")
    print(respuesta.text)
