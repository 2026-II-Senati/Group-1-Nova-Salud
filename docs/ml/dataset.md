# Origen del dataset y proceso de limpieza

Este documento describe de dónde proviene el historial de ventas que usamos para entrenar el modelo de pronóstico de Nova Salud y qué transformaciones aplica `ml/limpiar_dataset.py`.

## 1. Origen de los datos

| Aspecto | Detalle |
|---|---|
| Fuente | [Rossmann Store Sales](https://www.kaggle.com/competitions/rossmann-store-sales/data), competencia publicada en Kaggle (2015) |
| Tipo de datos | Ventas reales de una cadena de droguerías alemana, publicadas para una competencia. No son datos de Nova Salud. |
| Archivo usado | `ml/data/raw/rossmann.csv` |
| Registros | 1 001 599 filas, una por tienda y día |
| Tiendas | 1 115 |
| Periodo | Del 1 de enero de 2013 al 17 de julio de 2015 |
| Escala monetaria | La del archivo original. No se convierte a soles. |

Columnas del archivo de origen: `Store`, `DayOfWeek`, `Date`, `Sales`, `Customers`, `Open`, `Promo`, `StateHoliday`, `SchoolHoliday` e `Id`.

> El archivo no se sube al repositorio porque `.gitignore` excluye `ml/data/`. Para reproducir el entrenamiento, se descarga desde Kaggle y se guarda como `ml/data/raw/rossmann.csv`.

Usamos este conjunto porque Nova Salud todavía no tiene un historial de ventas suficiente para entrenar un modelo. Los resultados sirven para demostrar el funcionamiento técnico del módulo; no representan las ventas reales de la botica.

## 2. Transformaciones de `limpiar_dataset.py`

| Paso | Qué hace | Registros |
|---|---|---|
| 1. Lectura | Carga `rossmann.csv` con pandas. | 1 001 599 |
| 2. Tiendas cerradas | Elimina las filas con `Open = 0`. | −170 627 |
| 3. Días sin ventas | Elimina las filas abiertas con `Sales = 0`. | −54 |
| 4. Fechas | Convierte `Date` al tipo fecha. | 830 918 |
| 5. Agregación diaria | Agrupa por fecha: suma `Sales` y `Customers`, y toma el máximo de `Promo` y `SchoolHoliday`. | 928 días |
| 6. Variables nuevas | Calcula `ventas_ayer`, `ventas_hace_7_dias`, `promedio_7_dias`, `dia_semana`, `mes` y `dia_mes`. | 928 días |
| 7. Nulos | Elimina los primeros 7 días, que no tienen historial suficiente para los rezagos. | 921 días |
| 8. Exportación | Guarda `ml/data/processed/dataset_nova_salud.csv` con separador `;`. | 921 días |

Comprobamos que las 928 fechas son consecutivas: no falta ningún día del calendario después de agrupar.

## 3. Tabla de modelado

| Columna | Descripción |
|---|---|
| `fecha` | Día de la observación |
| `ventas_totales` | Variable objetivo: suma de ventas del día |
| `ventas_ayer` | Ventas del día anterior |
| `ventas_hace_7_dias` | Ventas del mismo día de la semana anterior |
| `promedio_7_dias` | Promedio de los 7 días anteriores |
| `dia_semana` | 0 = lunes … 6 = domingo |
| `mes`, `dia_mes` | Mes (1–12) y día del mes (1–31) |
| `Promo` | 1 si al menos una tienda abierta tuvo promoción |
| `SchoolHoliday` | 1 si al menos una tienda abierta tuvo feriado escolar |
| `clientes_totales` | Se conserva en el CSV, pero **no** se usa como entrada del modelo: solo se conoce al cerrar el día, así que su uso sería una fuga de información. |

## 4. Limitaciones conocidas

- Los domingos abren muy pocas tiendas, por eso la venta total de ese día es de unos 0,2 millones, frente a unos 7 millones de los demás días.
- Entre julio y diciembre de 2014 hay menos tiendas con registros (entre 760 y 810 por día, frente a unas 930). La suma diaria baja en ese periodo sin que haya bajado la demanda.
- Los datos pertenecen a otra empresa y a otro país. Para usar el modelo con la botica, habría que volver a entrenarlo con el historial propio de Nova Salud.
