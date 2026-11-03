# [PS2I-67] Estandarización de respuestas de error

**Proyecto:** Nova Salud
**Fecha:** 2026-11-03
**Responsable:** Jeff Steven Gil Toribio

---

### Objetivo

Que todas las rutas del backend respondan los errores con el mismo formato
`{ "message": "..." }` y con el código HTTP que corresponde (400, 401, 403, 404,
500 o 503), y que ningún dato inválido enviado por el usuario termine en un 500.

---

### Qué se cambió

- `backend/src/utils/errors.js` (nuevo): `responderError` para responder siempre
  con `{ "message": ... }`, `traducirErrorBase` para convertir los errores de
  mysql2 en 400 o 503 cuando el dato enviado es el que los provoca, y
  `asyncHandler` para que una excepción en un controlador termine en el manejador
  de errores en vez de dejar la petición colgada.
- Manejo del JSON mal formado: `express.json()` marcaba el error y terminaba en
  500; ahora responde 400 con `El cuerpo de la petición no es un JSON válido`.
- Rutas no registradas: 404 `{ "message": "Ruta no encontrada" }`.
- Manejador de errores final: cualquier fallo no controlado responde
  `{ "message": "Error interno del servidor" }` con 500, sin filtrar detalles.
- Controladores: validación de tipos antes de tocar la base (texto vs número,
  ids enteros positivos, booleanos), mensajes en español neutro y respuestas
  400/401/403/404 según el caso. Los `res.json({ mensaje: ... })` sueltos pasan a
  `message`.
- Ventas: las validaciones de negocio (producto inexistente, stock insuficiente,
  usuario inactivo) son 400 con mensaje propio; un fallo real de base ya no se
  reporta como 400.

---

### Casos de prueba ejecutados

Prueba automatizada con 50 casos contra el backend corriendo en Docker
(`prueba_ps2i_67.py`): **50 OK, 0 fallas**.

| Caso | Esperado | Resultado |
|---|---|---|
| Registro sin body / nombre numérico / body array | 400 | 400, `message` |
| Correo con formato inválido | 400 | 400, `message` |
| Contraseña de menos de 6 caracteres | 400 | 400, `message` |
| Login sin campos / tipos incorrectos | 400 | 400, `message` |
| Login con contraseña incorrecta | 401 | 401, `message` |
| Body con JSON mal formado | 400 | 400, `message` |
| Producto sin campos obligatorios | 400 | 400, `message` |
| Precio con texto | 400 | 400, `message` |
| Stock decimal / negativo | 400 | 400, `message` |
| Categoría inexistente al crear producto | 400 | 400, `message` |
| Nombre de producto de 300 caracteres | 400 | 400, `message` |
| Id de producto `abc` (PUT y DELETE) | 400 | 400, `message` |
| Producto inexistente (PUT y DELETE) | 404 | 404, `message` |
| Búsqueda sin término | 400 | 400, `message` |
| Categoría sin nombre / nombre numérico | 400 | 400, `message` |
| Categoría inexistente al editar | 404 | 404, `message` |
| Proveedor sin nombre | 400 | 400, `message` |
| Proveedor inexistente al eliminar | 404 | 404, `message` |
| Venta sin body / productos vacío / no array | 400 | 400, `message` |
| Venta con item nulo | 400 | 400, `message` |
| Cantidad 0 o decimal | 400 | 400, `message` |
| Venta con producto inexistente | 400 | 400, `message` |
| Venta con usuario inexistente | 400 | 400, `message` |
| Venta inexistente | 404 | 404, `message` |
| Fechas inválidas o fuera de formato en movimientos | 400 | 400, `message` |
| `desde` posterior a `hasta` | 400 | 400, `message` |
| Rutas protegidas sin token o con token inválido | 401 | 401, `message` |
| Estado de usuario con id inválido o `activo` no booleano | 400 | 400, `message` |
| Usuario inexistente al cambiar estado | 404 | 404, `message` |
| Ruta inexistente | 404 | 404, `message` |

#### Flujo normal (nada se rompió)

Ejecutado completo con datos reales: login (200 con token), `/api/me`,
productos, categorías, proveedores, roles, alertas, métricas del dashboard,
ventas de la semana, ventas, ventas del día, movimientos, búsqueda y usuarios
(200 todos); crear categoría (201), editar categoría (200), crear producto (201),
editar producto (200), registrar venta (201, total calculado), ver el detalle de
la venta (200), ver el movimiento generado (200).

#### Borrar un producto con ventas

- **Acción:** `DELETE /api/productos/24` de un producto con una venta registrada.
- **Esperado:** 400 con mensaje, no 500.
- **Resultado:** 400 `{"message":"El producto tiene ventas registradas y no se puede eliminar"}`.

---

### Conclusiones de validación

- Ningún dato inválido del usuario devuelve 500: todos salen con 400 o 404.
- Todos los errores usan el mismo formato `{ "message": "..." }`.
- El frontend sigue funcionando: lee `data.message`, que no cambió de nombre.
- Los datos de prueba que creó esta verificación se borraron al terminar, en
  orden inverso (detalle_venta -> ventas -> movimientos -> producto -> categoría),
  con los COUNT(*) revisados antes y después: quedaron en cero las filas de
  prueba y las tablas volvieron a 8 productos, 2 ventas, 9 categorías, 3
  detalle_venta y 3 movimientos. La venta 15 y el producto 24 ya no existen
  (404 al consultarlos).
