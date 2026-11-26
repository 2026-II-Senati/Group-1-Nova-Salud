# Figuras del informe final del módulo de ML

Imágenes usadas en `docs/ml/informe-final-ml.md`. Los gráficos `ml-*.png` y los dos diagramas se regeneran con:

```bash
cd ml
python graficos_informe.py
```

| Archivo | Contenido |
|---|---|
| diagrama-situacion-actual.png | Flujo actual de ventas e inventario (adaptado de PS2I-108) |
| diagrama-sistema-propuesto-ml.png | Funcionamiento del sistema con el módulo de ML (adaptado de PS2I-108) |
| ml-serie-tramos.png | Venta diaria y tramos de entrenamiento, validación y prueba |
| ml-dia-semana.png | Venta media por día de la semana |
| ml-tiendas-por-dia.png | Tiendas con registro por día |
| ml-comparacion-metricas.png | MAE, RMSE y R² en el tramo de prueba |
| ml-real-vs-estimado.png | Venta real frente a la estimada por el Random Forest |
| ml-importancia-variables.png | Importancia de las variables del modelo |
| ml-flujo-endpoint.png | Flujo de POST /api/ml/prediccion |
| ml-pantalla-predicciones.png | Captura de la pantalla de Predicciones |
