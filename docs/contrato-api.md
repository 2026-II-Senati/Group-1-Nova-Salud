# Contrato de la API — Nova Salud

Todas las rutas empiezan con `/api`.
Formato: JSON.
Las rutas protegidas necesitan el header:
`Authorization: Bearer <token>`

Códigos de respuesta:
- 200 OK
- 201 creado
- 400 datos inválidos
- 401 sin token o token vencido
- 404 no encontrado
- 500 error del servidor

---

## Autenticación

### POST /api/auth/register
Body:
{ "nombre": "Cristhian", "email": "a@b.com", "password": "123456" }

Respuesta 201:
{ "id": 1, "nombre": "Cristhian", "email": "a@b.com", "rol_id": 2 }

### POST /api/auth/login
Body:
{ "email": "a@b.com", "password": "123456" }

Respuesta 200:
{ "token": "eyJhbGci...", "usuario": { "id": 1, "nombre": "Cristhian", "rol_id": 2 } }

### GET /api/me  (protegida)
Respuesta 200:
{ "id": 1, "nombre": "Cristhian", "email": "a@b.com", "rol": "admin" }

### GET /api/roles
Respuesta 200:
[ { "id": 1, "nombre": "admin" }, { "id": 2, "nombre": "vendedor" } ]

---

## Categorías

### GET /api/categorias
[ { "id": 1, "nombre": "Analgésicos" } ]

### POST /api/categorias
{ "nombre": "Analgésicos" }

### PUT /api/categorias/:id
{ "nombre": "Analgésicos y antiinflamatorios" }

---

## Proveedores

### GET /api/proveedores
[ { "id": 1, "nombre": "Distribuidora Lima SAC" } ]

### POST /api/proveedores
{ "nombre": "Distribuidora Lima SAC" }

### DELETE /api/proveedores/:id
Respuesta 200: { "mensaje": "Proveedor eliminado" }

---

## Productos

### GET /api/productos
[ { "id": 1, "nombre": "Paracetamol 500mg", "precio": 0.5,
    "stock": 120, "stock_minimo": 20,
    "categoria_id": 1, "proveedor_id": 1 } ]

### GET /api/productos/buscar?q=para
Mismo formato, filtrado por nombre.

### POST /api/productos
{ "nombre": "Paracetamol 500mg", "precio": 0.5, "stock": 120,
  "stock_minimo": 20, "categoria_id": 1, "proveedor_id": 1 }

### PUT /api/productos/:id
Mismo body que el POST.

### DELETE /api/productos/:id
{ "mensaje": "Producto eliminado" }

---

## Ventas

### POST /api/ventas

Body:
{
  "usuario_id": 1,
  "productos": [
    { "producto_id": 1, "cantidad": 2 },
    { "producto_id": 3, "cantidad": 1 }
  ]
}

Respuesta 201:
{ "venta_id": 5, "total": 2.50, "fecha": "2026-10-21T18:00:00" }

### Reglas del backend al registrar:

- Calcular el total con el precio actual de la base
- Restar el stock
- Guardar el detalle
- Registrar el movimiento
- Si no hay stock suficiente: 400 con { "error": "Stock insuficiente" }

### GET /api/ventas
[ { "id": 5, "fecha": "...", "total": 2.5, "usuario_id": 1 } ]

### GET /api/ventas/:id
{ "id": 5, "total": 2.5, "detalle": [ { "producto": "Paracetamol", "cantidad": 2 } ] }

### GET /api/ventas/hoy
Mismo formato que GET /api/ventas, solo las de hoy.

---

## Alertas y dashboard

### GET /api/alertas
[ { "id": 2, "nombre": "Ibuprofeno 400mg", "stock": 4, "stock_minimo": 15 } ]

### GET /api/dashboard/metricas
{ "ventas_hoy": 12, "total_productos": 8, "productos_bajo_stock": 3 }

### GET /api/movimientos
[ { "id": 1, "producto_id": 1, "tipo": "salida", "cantidad": 2,
    "fecha": "..." } ]

---

## Usuarios

### PUT /api/usuarios/:id/estado
{ "activo": false }
