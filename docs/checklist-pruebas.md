# [PS2I-102] Checklist de Pruebas — Módulo de Predicción

**Proyecto:** Nova Salud  
**Fecha:** 23-11-26 
**Responsable:** Cesar Rosendo Loayza Manchego

### Objetivo
Validar el funcionamiento del módulo de predicción, la visualización de sus gráficos y los permisos de acceso según el rol del usuario.

---

### Casos de Prueba

- [ ] **1. Opción visible para Administrador**
  - **Prueba:** Entrar como Administrador y revisar el menú lateral.
  - **Esperado:** Aparece la opción "Predicciones" y deja ingresar sin problemas.

- [ ] **2. Opción oculta para Vendedor**
  - **Prueba:** Entrar como Vendedor y revisar el menú lateral.
  - **Esperado:** No se muestra la opción "Predicciones" ni permite entrar escribiendo la ruta.

- [ ] **3. Proyección a 7 días**
  - **Prueba:** Entrar al módulo como Administrador y pulsar "Próximos 7 días".
  - **Esperado:** Calcula y muestra el monto estimado para los siguientes 7 días.

- [ ] **4. Proyección a próximo mes**
  - **Prueba:** Pulsar el botón "Próximo mes" dentro de la misma pantalla.
  - **Esperado:** Actualiza el monto estimado y los datos para los próximos 30 días.

- [ ] **5. Consulta sin iniciar sesión (Error 401)**
  - **Prueba:** Llamar a "/api/ml/prediccion" sin enviar sesión ni token.
  - **Esperado:** Rechaza la consulta devolviendo error "401".

- [ ] **6. Consulta con cuenta de Vendedor (Error 403)**
  - **Prueba:** Llamar a "/api/ml/prediccion" usando una sesión de Vendedor.
  - **Esperado:** Bloquea el acceso devolviendo error "403".

- [ ] **7. Envío de plazo inválido (Error 400)**
  - **Prueba:** Enviar a "/api/ml/prediccion" un plazo distinto de 7 o 30 días 
  - **Esperado:** Rechaza el dato inválido devolviendo error "400".

- [ ] **8. Lectura correcta del gráfico**
  - **Prueba:** Revisar el gráfico una vez que cargan las predicciones.
  - **Esperado:** Se distinguen bien las ventas pasadas (línea sólida) de la proyección (línea punteada), sin textos montados.

- [ ] **9. Recarga de pantalla (F5)**
  - **Prueba:** Presionar "F5" estando dentro de la pantalla de predicciones.
  - **Esperado:** La página vuelve a cargar los datos con normalidad y sin errores en consola.

