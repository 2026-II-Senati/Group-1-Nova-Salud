# [PS2I-48] Reporte de Pruebas de Caja Negra

**Proyecto:** Nova Salud  
**Fecha:** 2026-11-02  
**Responsable:** Cesar Roendo Loayza Manchego

### Objetivo
Verificar la resiliencia de la aplicación ante entradas inválidas, límites de datos y navegación no autorizada, garantizando que nunca colapse ni exponga datos internos.

---

### CASOS DE PRUEBA EJECUTADOS

#### 1. Autenticación — Login con campos vacíos
* **Acción:** Enviar formulario de inicio de sesión sin ingresar datos.
* **Esperado:** Mostrar mensaje de alerta solicitando credenciales.
* **Resultado:** Muestra "El correo y me contraseña son requeridos" en pantalla.
* **Estado:** Funcional

#### 2. Punto de Venta — Cobro sin iniciar sesión
* **Acción:** Hacer clic en el botón Cobrar sin estar autenticado en el sistema.
* **Esperado:** Requerir inicio de sesión antes de procesar la venta.
* **Resultado:** Muestra la alerta "Inicia sesión para registrar la venta".
* **Estado:** Funcional

#### 3. Punto de Venta — Cobro con carrito vacío
* **Acción:** Intentar realizar un cobro sin haber agregado productos al carrito.
* **Esperado:** Deshabilitar o bloquear la opción de cobro.
* **Resultado:** El botón "Cobrar" esta deshabilitado de forma automatica en la interfaz.
* **Estado:** Funcional

#### 4. Navegación — Acceso a URLs o IDs inexistentes
* **Acción:** Ingresar manualmente rutas ficticias en la barra del navegador.
* **Esperado:** Redirección segura o pantalla limpia sin fallos.
* **Resultado:** Redirige al Dashboard de forma segura sin pantallas rojas de error.
* **Estado:** Funcional

---

### Conclusiones de Validación
* La interfaz se mantiene estable ante fallos y navegaciones inválidas.
* Mensajes de alerta comprensibles en lugar de códigos de error técnicos.
* La pantalla no muestra código ni detalles internos de la base de datos.