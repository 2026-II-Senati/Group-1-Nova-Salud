# Módulo de Pronóstico Diario de Ventas – Avance del informe (puntos 1 al 6)

Proyecto Nova Salud · Taller de Desarrollo de Aplicaciones con Machine Learning · SENATI 2026

# Introducción

La gestión de ventas requiere registrar operaciones y disponer de información que permita examinar su comportamiento. El sistema web Nova Salud centraliza productos, existencias y ventas, y ofrece consultas e indicadores. Sobre esta base, el proyecto incorpora un módulo de pronóstico diario de ventas mediante aprendizaje automático.

La solución estimará el importe agregado del día siguiente a partir de ventas históricas y variables de calendario. Su desarrollo utilizará Rossmann Store Sales como fuente externa de datos. El resultado se presentará dentro de Nova Salud en un entorno de demostración identificado, sin atribuir el comportamiento de las tiendas de origen a la operación real de la botica.

El proceso comprenderá preparación del historial, comparación de regresión lineal y bosque aleatorio, validación temporal, prueba final y exportación. La integración utilizará React, el backend de Node.js con Express y un servicio de inferencia en Python con FastAPI. El entrenamiento será independiente de las consultas.

Este avance presenta las generalidades de la empresa, la realidad problemática, los objetivos, las justificaciones, los fundamentos conceptuales y las tecnologías del módulo. La evaluación se basará en información disponible antes del día objetivo y conservará un periodo final separado de la selección del algoritmo.

# 1. Generalidades de la empresa

## 1.1. Denominación y ubicación

La Botica Nova Salud S.A.C., identificada con RUC 20601234567, está ubicada en la avenida Arequipa 2450, distrito de Lince, Lima, y se dedica a la comercialización minorista de medicamentos y productos farmacéuticos. Su actividad vincula la atención al cliente con la recepción de productos, el control de existencias y el registro de ventas. El proyecto se desarrolla sobre el sistema web Nova Salud, destinado a organizar la información de estas operaciones.

El ámbito de intervención comprende el sistema de información de ventas. La ampliación añadirá una consulta predictiva y permitirá demostrar el funcionamiento de un modelo de regresión dentro de la plataforma.

## 1.2. Giro del negocio

Nova Salud pertenece al sector farmacéutico minorista. Su operación comprende la recepción y organización de productos, la consulta de disponibilidad, la venta y el seguimiento de cantidades. La coordinación de estas actividades permite relacionar los ingresos de mercadería con las salidas registradas en el punto de venta.

La gestión del establecimiento requiere información organizada sobre productos, precios, proveedores y existencias. El sistema web centraliza esos datos y facilita su consulta por parte del personal autorizado. Sobre esta base se incorporará el componente de aprendizaje automático.

## 1.3. Productos comercializados

El catálo<span class="mark">go inicial del sistema contiene paracetamol 500 mg, ibuprofeno 400 mg, amoxicilina 500 mg, vitamin</span>a C 1000 mg, alcohol en gel 500 ml, venda elástica de 10 cm, omeprazol 20 mg y termómetro digital. Cada producto dispone de código, nombre, precio, stock, stock mínimo, categoría y proveedor.

El catálogo permite identificar artículos, relacionarlos con los detalles de venta y consultar sus existencias. Se conservará como parte de la aplicación operativa. El modelo de esta etapa no estimará cantidades por medicamento: su salida será un importe diario agregado procedente del conjunto de datos externo.

## 1.4. Mercado objetivo

La botica orienta su actividad a personas que requieren medicamentos y productos farmacéuticos. La disponibilidad de los artículos y la agilidad de consulta son aspectos vinculados al servicio del establecimiento.

El proyecto se concentra en la gestión de información <span class="mark">comercial</span>. No utilizará datos clínicos ni identidades de compradores. La tabla de modelado representará fechas y ventas agregadas de las tiendas incluidas en Rossmann.

## 1.5. Procesos de inventario y ventas

El proceso de inventario comprende la identificación de productos, el registro de cantidades y la consulta de existencias. El catálogo relaciona cada artículo con una categoría y un proveedor, e incorpora un stock mínimo utilizado para señalar los productos que requieren revisión.

La venta se registra mediante una cabecera y un detalle. La cabecera reúne fecha, usuario e importe total; el detalle identifica productos, cantidades y precios unitarios. El sistema actualiza las existencias y registra los movimientos de salida. Los historiales permiten consultar las operaciones realizadas.

El módulo predictivo se incorporará como una función de análisis separada del registro de ventas. El usuario consultará un día objetivo y visualizará el importe estimado, junto con la fecha de corte y la identificación del escenario de datos utilizado.

## 1.6. Usuarios y responsabilidades

El sistema contempla los perfiles de administrador y vendedor. El administrador gestiona productos, categorías, proveedores y usuarios, mientras el vendedor registra ventas y consulta existencias y alertas.

La consulta se orientará al usuario autorizado para revisar información comercial. Su responsabilidad será interpretar el alcance del resultado. El módulo no sustituirá decisiones de compra ni el criterio del personal farmacéutico.

## 1.7. Sistema de información y área de intervención

La plataforma utiliza React para la interfaz, Node.js con Express para la lógica de negocio y MySQL para almacenar información. Dispone de módulos de productos, inventario, ventas, movimientos, alertas y un panel de indicadores.

El área de intervención será el análisis de ventas. El módulo presentará el pronóstico del día siguiente al cierre disponible y mantendrá separadas las consultas predictivas de las transacciones que modifican el inventario.

## 1.8. Misión y visión del proyecto

La misión del proyecto es ampliar Nova Salud con un módulo de pronóstico diario de ventas que integre preparación de datos, evaluación temporal y consulta web mediante un procedimiento reproducible.

La visión es establecer una base tecnológica para incorporar análisis predictivo al sistema, con capacidad de evaluar posteriormente modelos entrenados con información propia y suficiente de la botica.

# 2. Realidad problemática

## 2.1. Situación actual

El sistema Nova Salud permite registrar ventas y controlar existencias de forma centralizada. El personal consulta productos, revisa operaciones y reconoce los artículos que alcanzan el stock mínimo. Estas funciones proporcionan información sobre el estado del inventario y las transacciones realizadas.

Sin embargo, la plataforma no incorpora un pronóstico del importe de ventas del día siguiente. La información de operaciones realizadas no se complementa todavía con una consulta predictiva integrada al entorno de gestión.

La nueva función se distinguirá del control de stock: el umbral mínimo expresa una condición del inventario, mientras el pronóstico estima un importe futuro. El módulo no calculará unidades de reposición ni demanda por producto.

## 2.2. Problema central

La ausencia de un módulo de pronóstico impide consultar estimaciones de ventas futuras desde la plataforma. El proyecto aborda esta brecha mediante la integración de un modelo de regresión y una interfaz que comunique el periodo, la unidad y el alcance de cada resultado.

El desarrollo utilizará una fuente externa para construir y evaluar el componente. La necesidad de la aplicación se resolverá en términos de integración funcional; su utilidad sobre ventas reales de Nova Salud requerirá una evaluación posterior con información propia.

## 2.3. Formulación del problema

¿Cómo desarrollar e integrar al sistema web Nova Salud un módulo que pronostique el importe agregado de ventas del día siguiente, utilizando datos de Rossmann y una evaluación temporal libre de información del periodo objetivo?

## 2.4. Disponibilidad y procedencia de los datos

Se utilizará Rossmann Store Sales, publicado en Kaggle para el pronóstico de ventas de 1 115 tiendas. La fuente contiene observaciones por tienda y fecha, ventas, clientes, apertura, promociones e indicadores de festivos. El historial de entrenamiento comprende desde enero de 2013 hasta julio de 2015.

El procesamiento parte del archivo de ventas de origen, identificado en el directorio ml/data/raw/ como rossmann.csv. El archivo de origen y la tabla diaria preparada se conservan como productos distintos: el primero mantiene registros por tienda y día; la segunda representa la suma de ventas por fecha. El archivo de origen contiene 1 001 599 registros por tienda y fecha, entre el 1 de enero de 2013 y el 17 de julio de 2015. La limpieza descartó 170 627 registros de tiendas cerradas y 54 registros de tiendas abiertas sin ventas, por lo que se conservaron 830 918. La agregación diaria produjo 928 fechas consecutivas, sin días ausentes en el calendario. Se eliminaron los primeros siete días porque no tienen historial suficiente para calcular los rezagos; así, la tabla de modelado final cuenta con 921 días, del 8 de enero de 2013 al 17 de julio de 2015. Los datos reales del conjunto Rossmann no se presentarán como registros de Nova Salud.

## 2.5. Alcance y limitaciones

El horizonte será un día calendario. Para cada fecha objetivo se utilizarán ventas del día anterior, ventas de siete días antes, un promedio de los siete días previos y variables de calendario. El número de clientes no forma parte de las entradas. Los indicadores adicionales solo se utilizarán si su valor es conocido antes del pronóstico; cuando sean supuestos de un escenario, se identificarán como tales.

La evaluación representará consultas de un paso adelante con actualización del historial al cierre de cada día. Se separarán entrenamiento, validación y prueba por fechas. El resultado corresponderá a ventas agregadas de las tiendas incluidas, no a un producto ni a una tienda individual. La serie externa no valida pronósticos para Nova Salud; tampoco permite determinar compras, demanda no atendida o beneficios económicos reales. La escala monetaria del archivo se conservará y no se etiquetará como soles sin una conversión explícita y documentada. Además, entre julio y diciembre de 2014 el número promedio de tiendas con registros baja de alrededor de 930 a menos de 820 por día. Por ello, la suma diaria de ese periodo puede descender sin que haya disminuido la demanda, y esta variación se tomará en cuenta al interpretar los resultados.

# 3. Objetivos

## 3.1. Objetivo general

Desarrollar e integrar al sistema web Nova Salud un módulo de aprendizaje automático que pronostique el importe agregado de ventas del día siguiente a partir de datos Rossmann, mediante variables disponibles antes de la fecha objetivo y una evaluación temporal independiente.

## 3.2. Objetivos específicos

1\. Explorar Rossmann Store Sales e identificar los campos, el periodo y los criterios de calidad necesarios para construir la serie diaria agregada.

2\. Preparar y documentar el archivo de origen y la tabla de modelado, verificando fechas, conteos, valores faltantes y continuidad del calendario.

3\. Construir variables históricas y de calendario sin incorporar clientes reales ni ventas del día objetivo como entradas del pronóstico.

4\. Comparar regresión lineal y bosque aleatorio frente a un método de referencia, utilizando el mismo periodo de validación y MAE como criterio principal.

5\. Evaluar el modelo seleccionado en un tramo temporal final reservado y reportar MAE, RMSE y R² junto con el periodo de evaluación.

6\. Exportar el estimador seleccionado y la definición de sus entradas, e integrarlo mediante Express y un servicio FastAPI que ejecute la inferencia en Python.

7\. Verificar la consistencia entre la inferencia directa y la API, el manejo de solicitudes inválidas y la presentación del resultado en la web de Nova Salud.

# 4. Justificaciones

## 4.1. Justificación tecnológica

La propuesta ampliará una aplicación existente mediante análisis predictivo. La reutilización de interfaz, backend y base de datos permitirá concentrar el desarrollo en preparación de información, entrenamiento e inferencia.

La integración conectará el aprendizaje automático con una necesidad funcional. El usuario consultará estimaciones desde Nova Salud, mientras el procesamiento mantendrá las mismas variables y transformaciones utilizadas en el entrenamiento.

## 4.2. Justificación económica

El pronóstico puede aportar una referencia para analizar el comportamiento esperado de ventas. En esta etapa, el aporte consiste en desarrollar la capacidad de consulta e integración; los efectos económicos de utilizar un modelo en Nova Salud deberán medirse posteriormente con registros propios.

La continuidad del sistema permitirá aprovechar el desarrollo previo. Los requerimientos de infraestructura y mantenimiento se considerarán al definir el entorno de ejecución del componente predictivo.

## 4.3. Justificación social

La interfaz facilitará la interpretación de una estimación identificada por fecha, unidad monetaria y origen de los datos. Esta presentación permitirá al usuario distinguir el escenario de demostración de las operaciones del establecimiento.

El alcance se restringirá a la gestión operativa. No se utilizará el modelo para diagnóstico, prescripción o recomendación de tratamientos, preservando la separación entre análisis de ventas y atención farmacéutica.

## 4.4. Justificación operativa

El módulo se incorporará al entorno donde se consultan productos y ventas. El responsable accederá a la estimación sin ejecutar herramientas de entrenamiento ni manipular archivos técnicos.

La consulta permitirá revisar un pronóstico diario sin ejecutar scripts ni manipular manualmente archivos técnicos. El flujo comprenderá la fecha de corte, la preparación de entradas y la presentación del importe estimado.

## 4.5. Justificación académica y metodológica

El desarrollo permitirá aplicar preparación de datos, aprendizaje supervisado, comparación de algoritmos y evaluación en una aplicación web. La documentación conservará las decisiones y parámetros necesarios para reproducir los experimentos.

La separación temporal de entrenamiento, validación y prueba permitirá examinar los modelos sobre periodos posteriores. La referencia sencilla aportará un criterio para determinar si las alternativas incorporan una mejora dentro del escenario analizado.

## 4.6. Justificación de seguridad

El pronóstico agregado no requiere identidades de compradores ni credenciales. El número real de clientes del día objetivo tampoco formará parte de las entradas. El acceso al módulo se controlará con los mecanismos de autenticación y autorización de la aplicación.

El componente validará entradas y gestionará solicitudes inválidas. La configuración sensible se mantendrá fuera del código compartido y se comprobará la protección de las rutas involucradas.

# 5. Conceptos fundamentales

## 5.1. Aprendizaje automático

Géron (2022) presenta el aprendizaje automático como un enfoque para construir sistemas que aprenden de datos. La definición del problema, la preparación de ejemplos y la evaluación forman parte del proceso. En el proyecto se aplicará a un importe diario agregado, no a unidades por producto.

## 5.2. Aprendizaje supervisado y regresión

El aprendizaje supervisado utiliza ejemplos con entradas y resultados conocidos. La regresión estima valores numéricos, mientras la clasificación asigna categorías (Géron, 2022). La variable objetivo será ventas_totales para el día pronosticado y las entradas se construirán con información disponible antes de esa fecha.

## 5.3. Series temporales y horizonte de pronóstico

Una serie temporal reúne observaciones ordenadas en el tiempo. El horizonte expresa cuántos periodos hacia adelante se estima y debe corresponder al esquema de evaluación (Hyndman & Athanasopoulos, 2021). Se utilizará una serie diaria y un horizonte de un día; al cerrar cada jornada podrá incorporarse su venta real al historial de consultas posteriores.

## 5.4. Variables predictoras y variable objetivo

La selección de características organiza información pertinente para el resultado esperado (Géron, 2022). La variable objetivo es ventas_totales, el importe agregado del día. El modelo final utiliza ocho variables de entrada: ventas_ayer, ventas_hace_7_dias, promedio_7_dias, dia_semana, mes, dia_mes, Promo y SchoolHoliday. Los campos de calendario corresponden a la fecha objetivo. Promo indica si hubo promociones programadas, un dato que se conoce con anticipación, y SchoolHoliday identifica los feriados escolares; como la tabla suma todas las tiendas, ambos toman el valor 1 si al menos una tienda abierta lo registró ese día.

En una primera versión del modelo se incluyó clientes_totales, es decir, el número de clientes del mismo día que se quería pronosticar. Ese dato solo se conoce cuando el día ya terminó, por lo que su uso constituía una fuga de información: con él, el modelo alcanzaba un R² de 0,987 en la prueba, un valor imposible de repetir en una consulta real. Por esta razón, eliminamos la variable y volvimos a entrenar el modelo solo con información disponible antes del día objetivo.

## 5.5. Preparación y calidad de los datos

La preparación de datos incluye revisión de tipos, faltantes y transformaciones consistentes (Géron, 2022). El proceso verificará unicidad por tienda y fecha antes de agregar, así como continuidad del calendario después de sumar por día. Una fecha ausente no se convertirá automáticamente en cero. Los cierres válidos y las ventas cero se distinguirán de registros erróneos antes de establecer filtros.

## 5.6. Representatividad de los datos

Géron (2022) identifica la falta de representatividad como una limitación del aprendizaje automático. Un modelo entrenado con ventas de otra organización no queda validado para una nueva empresa por integrarse en su aplicación. Rossmann permitirá evaluar el método y su funcionamiento técnico; la aplicación comercial en Nova Salud requerirá información propia y evaluación adicional.

## 5.7. Entrenamiento, validación y prueba

El entrenamiento ajusta parámetros, la validación permite elegir alternativas y la prueba examina la configuración seleccionada (Géron, 2022). En pronósticos temporales se utilizan observaciones anteriores al periodo evaluado (Hyndman & Athanasopoulos, 2021). Por eso, la tabla de 921 días se divide en tres tramos cronológicos, sin mezclar las fechas: entrenamiento, con el 70 % más antiguo (644 días, del 8 de enero de 2013 al 13 de octubre de 2014); validación, con el 15 % siguiente (138 días, del 14 de octubre de 2014 al 28 de febrero de 2015); y prueba, con el 15 % final (139 días, del 1 de marzo al 17 de julio de 2015). La validación sirve para comparar los algoritmos, y la prueba se reserva para medir una sola vez el desempeño del modelo elegido.

## 5.8. Prevención de fuga de información

La fuga de información ocurre cuando el procedimiento incorpora datos que no estarían disponibles en la consulta real. La evaluación temporal exige pronosticar sin observaciones futuras (Hyndman & Athanasopoulos, 2021). Se excluirán los clientes reales y las ventas del propio día objetivo. Los rezagos y el promedio móvil se calcularán con fechas previas y un calendario verificado.

## 5.9. Sobreajuste

El sobreajuste se produce cuando el modelo se adapta excesivamente al entrenamiento y pierde capacidad de generalización (Géron, 2022). Se analizará contrastando los errores de entrenamiento y validación. La prueba final se reservará para la configuración seleccionada, sin utilizarse como base de ajustes sucesivos.

## 5.10. Algoritmos de regresión

Géron (2022) desarrolla regresión lineal y bosques aleatorios como alternativas de aprendizaje supervisado. La regresión lineal modela relaciones aditivas; el bosque combina árboles y puede representar relaciones no lineales. Se comparan LinearRegression con intercepto y RandomForestRegressor con random_state igual a 42. Para el bosque aleatorio se aplica GridSearchCV, que prueba combinaciones de 50, 100 y 200 árboles (n_estimators) y profundidades máximas de 10, 20 o sin límite (max_depth) mediante validación cruzada. La configuración final del modelo es de 200 árboles con una profundidad máxima de 10.

## 5.11. Método de referencia

Un método sencillo aporta una referencia para evaluar el beneficio de alternativas más complejas. El método ingenuo, o Naive, repite la última observación disponible (Hyndman & Athanasopoulos, 2021). En este proyecto se usa la venta del día anterior como pronóstico y se calculan sus errores sobre el mismo tramo de prueba que los modelos.

## 5.12. Métricas de error

El MAE resume las diferencias absolutas entre observaciones y pronósticos. El RMSE concede mayor peso a errores grandes y conserva, como MAE, las unidades de la variable evaluada (Hyndman & Athanasopoulos, 2021). Géron (2022) presenta R² como una medida de regresión relacionada con la variación explicada frente a una referencia constante; no equivale a un porcentaje de exactitud y puede ser negativo.

El MAE es el criterio principal para elegir el modelo, mientras que el RMSE y el R² complementan la interpretación. En la prueba final se reportan las tres métricas sin volver a elegir el algoritmo a partir de esos resultados. Los errores se expresan en la escala monetaria del archivo y corresponden a las ventas diarias agregadas de las tiendas.

## 5.13. Pronóstico diario y alcance de la estimación

Un pronóstico es una estimación de observaciones futuras y no una certeza (Hyndman & Athanasopoulos, 2021). La salida del proyecto es el importe agregado del día siguiente; no representa la demanda por medicamento ni la cantidad que conviene comprar. La consulta utiliza el historial ya cerrado, y sus resultados no se interpretan como ventas reales de Nova Salud.

## 5.14. Exportación e inferencia

La persistencia permite reutilizar un estimador entrenado sin ajustar sus parámetros en cada consulta (Géron, 2022). El archivo modelo.pkl contiene el estimador seleccionado, y junto a él se conservan la definición de columnas y el procedimiento de preparación. Si más adelante se incorporan transformaciones ajustadas, se exportan junto con el modelo para mantener la coherencia entre entrenamiento e inferencia.

# 6. Tecnologías involucradas

## 6.1. Tecnologías de desarrollo web

La pantalla de consulta de estimaciones forma parte del frontend en React, que el equipo construyó con Vite y Tailwind CSS durante el curso de Full Stack. Node.js con Express recibe las solicitudes de la interfaz y coordina el procesamiento, y Recharts muestra la información histórica junto con la estimada.

En la pantalla de Predicciones aparecen el día objetivo, la fecha de corte del historial, el importe estimado y el origen de los datos. No tiene un selector de medicamentos, porque el modelo trabaja con las ventas totales del día y no con productos individuales.

## 6.2. Almacenamiento y organización de datos

Los datos operativos de Nova Salud siguen almacenados en MySQL, alojado en Aiven. Los datos de Rossmann se manejan aparte y no se mezclan con las ventas de la botica; tampoco usamos los identificadores de productos del sistema para interpretar los importes del dataset externo.

En la carpeta ml/data/raw/ está el archivo original, rossmann.csv, y en ml/data/processed/ la tabla preparada, dataset_nova_salud.csv, que usa punto y coma como separador. Para cada tabla registramos sus campos, el periodo que cubre, la escala monetaria y la cantidad de filas antes y después de agrupar, de forma que cualquier dato derivado pueda rastrearse hasta su origen.

## 6.3. Preparación y exploración

El script limpiar_dataset.py, escrito en Python con pandas, lee el archivo de origen, descarta los registros de tiendas cerradas o sin ventas y suma las ventas por fecha. Antes de calcular los rezagos de uno y siete días y el promedio de los siete días anteriores, comprobamos que el calendario no tenga fechas faltantes. Para revisar la serie y los errores del modelo recurrimos a Matplotlib.

Las rutas de los archivos se construyen a partir de la carpeta del script; así, el código funciona en cualquier equipo del grupo. Al agrupar por día, Promo y SchoolHoliday se resumen con el valor máximo: un 1 indica que al menos una tienda tuvo promoción o feriado escolar ese día, no que todas lo tuvieran.

## 6.4. Entrenamiento y evaluación

En train.py usamos scikit-learn para entrenar la regresión lineal y el bosque aleatorio con las mismas ocho variables y los mismos tramos. La tabla está ordenada por fecha y se divide en entrenamiento (70 %), validación (15 %) y prueba (15 %) sin mezclar los días, para que el modelo aprenda del pasado y se evalúe con fechas posteriores. El bosque aleatorio se optimiza con GridSearchCV, y el modelo con menor MAE en validación es el seleccionado.

Una vez elegido, el modelo se vuelve a entrenar con los tramos de entrenamiento y validación, y se evalúa una sola vez en la prueba, donde se reportan el MAE, el RMSE y el R² junto con los del método Naive. El modelo final se guarda con Joblib en modelo.pkl, el archivo que carga el servicio de predicción.

## 6.5. Integración del modelo y consulta de predicciones

El sistema incorpora una sección de pronóstico diario en React, desde la cual el usuario autorizado consulta la estimación del día siguiente a la última fecha disponible. La respuesta indica la fecha objetivo, el importe, la escala monetaria y que se trata del escenario Rossmann, para que no se confunda con un pronóstico de las ventas propias de la botica.

La integración se realiza mediante un microservicio de Python construido con FastAPI, separado del backend principal. Para obtener la estimación, React llama a POST /api/ml/prediccion en Express, y Express envía la solicitud por HTTP a POST /predecir del microservicio. En api.py, el servicio ordena las columnas como en el entrenamiento, ejecuta el modelo y devuelve ventas_estimadas. Express agrega los datos necesarios para mostrar el resultado y controla los errores que pueda devolver el servicio.

El entrenamiento y la consulta están separados: FastAPI carga modelo.pkl una sola vez al iniciar y no vuelve a entrenar en cada solicitud. Las entradas se construyen a partir del historial diario con el mismo procedimiento de preparación, y los campos que recibe la API coinciden con las ocho variables del entrenamiento; el número de clientes no forma parte de la solicitud.

Para probar el servicio contamos con api.py y probar_api.py. La prueba directa verifica que FastAPI responda con el formato acordado, y la prueba integrada recorre el flujo completo entre React, Express y Python. También comparamos la predicción hecha directamente con el modelo y la que devuelve el servicio para las mismas entradas: ambas deben coincidir. Si falta historial o el servicio no está disponible, la pantalla muestra un aviso en lugar de una cifra inventada.

La estimación nunca puede ser negativa. Si se aplica algún redondeo o ajuste al resultado, lo documentamos y lo aplicamos de la misma forma en la evaluación y en lo que ve el usuario.

## 6.6. Seguridad y configuración

Antes de calcular una estimación, el módulo verifica la identidad y los permisos del usuario, la fecha objetivo y los rangos de los datos de entrada. La API rechaza importes históricos negativos e indicadores con valores distintos de 0 o 1. Además, revisamos el uso de JWT, las variables de entorno, los tiempos de espera y las respuestas de error, con pruebas para solicitudes válidas, campos faltantes, valores inválidos y servicio desconectado.

Las credenciales no forman parte del dataset ni del repositorio. FastAPI solo atiende solicitudes autorizadas del backend, y el archivo del modelo proviene del proceso de entrenamiento del equipo. La configuración evita que el servicio de inferencia quede expuesto directamente.

## 6.7. Gestión y reproducibilidad

En Jira organizamos el trabajo en cuatro frentes: datos, modelo, backend y frontend. Entre ellos coordinamos el formato de las solicitudes de predicción y las pruebas de extremo a extremo. Los cambios se guardan en GitHub, y el componente de aprendizaje automático se desarrolla en la rama feature/PS2I-ML.

La documentación recoge el origen de los datos de Rossmann, la versión del CSV, las transformaciones, los cortes temporales, las métricas y las dependencias. En el README se explica para qué sirve cada script (limpiar_dataset.py, train.py, api.py y probar_api.py) y cómo ejecutarlo. Cada modelo exportado queda vinculado al experimento que lo generó.


**Bibliografía**

Géron, A. (2022). *Hands-on machine learning with Scikit-Learn, Keras, and TensorFlow: Concepts, tools, and techniques to build intelligent systems* (3rd ed.). O’Reilly Media.

Hyndman, R. J., & Athanasopoulos, G. (2021). *Forecasting: Principles and practice* (3rd ed.). OTexts. https://otexts.com/fpp3/

Kaggle. (2015). *Rossmann store sales* \[Conjunto de datos de competencia\]. https://www.kaggle.com/competitions/rossmann-store-sales/data
