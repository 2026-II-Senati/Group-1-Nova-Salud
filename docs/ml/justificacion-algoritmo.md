# Justificación del algoritmo seleccionado

Este documento resume qué algoritmos comparamos para pronosticar las ventas del día siguiente, qué resultados obtuvo cada uno y por qué elegimos Random Forest.

## 1. Planteamiento

- **Problema:** regresión. El modelo estima un importe: `ventas_totales` del día siguiente.
- **Variables de entrada (8):** `ventas_ayer`, `ventas_hace_7_dias`, `promedio_7_dias`, `dia_semana`, `mes`, `dia_mes`, `Promo` y `SchoolHoliday`.
- **Variable excluida:** `clientes_totales`, porque solo se conoce cuando el día ya terminó. En la primera versión, con esta variable, el modelo daba un R² de 0,987, un valor inflado por fuga de información.

## 2. División de los datos

Dividimos los 921 días en orden cronológico, sin mezclarlos:

| Tramo | Proporción | Días | Periodo |
|---|---:|---:|---|
| Entrenamiento | 70 % | 644 | 08/01/2013 – 13/10/2014 |
| Validación | 15 % | 138 | 14/10/2014 – 28/02/2015 |
| Prueba | 15 % | 139 | 01/03/2015 – 17/07/2015 |

La validación sirve para comparar los algoritmos. Después, el modelo elegido se vuelve a entrenar con los tramos de entrenamiento y validación, y se evalúa una sola vez con la prueba.

## 3. Algoritmos comparados

| Algoritmo | Por qué lo incluimos |
|---|---|
| Naive (venta del día anterior) | Referencia mínima: si un modelo no supera este método, no aporta valor. |
| Regresión lineal | Modelo simple e interpretable; supone relaciones aditivas. |
| Random Forest | Combina muchos árboles de decisión y puede captar relaciones no lineales, como el efecto conjunto del día de la semana y las promociones. Se optimizó con GridSearchCV probando 50, 100 y 200 árboles y profundidades máximas de 10, 20 o sin límite. Configuración final: 200 árboles y profundidad máxima 10. |

## 4. Resultados en el tramo de prueba

| Modelo | MAE | RMSE | R² |
|---|---:|---:|---:|
| Naive (venta del día anterior) | 3 236 495,73 | 4 914 451,99 | −1,1385 |
| Regresión lineal | 2 280 803,59 | 2 953 200,32 | 0,2278 |
| **Random Forest (200 árboles, profundidad 10)** | **738 848,52** | **1 415 388,88** | **0,8226** |

MAE y RMSE están en la escala monetaria del archivo Rossmann. El R² no es un porcentaje de precisión: indica qué parte de la variación de las ventas explica el modelo, y puede ser negativo cuando el modelo funciona peor que predecir siempre el promedio.

## 5. Por qué elegimos Random Forest

1. **Menor error en las tres métricas.** Su MAE es un 77,2 % menor que el del Naive y un 67,6 % menor que el de la regresión lineal.
2. **Reconoce el patrón semanal.** Los domingos abren muy pocas tiendas y la venta total cae mucho. El Naive falla cada domingo y cada lunes (por eso su R² es negativo); el Random Forest usa `dia_semana` y `ventas_hace_7_dias` para anticipar ese cambio.
3. **Capta relaciones no lineales.** La regresión lineal solo suma efectos; su R² de 0,2278 muestra que no alcanza para combinar día de la semana, promociones y feriados.
4. **Resultado defendible.** El R² de 0,8226 se obtiene sin usar información del día que se predice, así que refleja lo que el modelo puede estimar en una consulta real.

## 6. Limitaciones

Las métricas corresponden a las tiendas Rossmann y no validan el desempeño con las ventas de Nova Salud. Para usar el modelo en la botica, habría que volver a entrenarlo con su propio historial.

## Referencias

- Géron, A. (2022). *Hands-on machine learning with Scikit-Learn, Keras, and TensorFlow* (3rd ed.). O’Reilly Media.
- Hyndman, R. J., & Athanasopoulos, G. (2021). *Forecasting: Principles and practice* (3rd ed.). OTexts. https://otexts.com/fpp3/
- Kaggle. (2015). *Rossmann store sales*. https://www.kaggle.com/competitions/rossmann-store-sales/data
