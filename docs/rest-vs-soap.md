# T75 — Documento REST vs SOAP

**Proyecto:** Nova Salud — Sistema web de gestión de inventario y ventas para una botica
**Tarea Jira:** PS2I-75
**Elaborado por:** Jhonatan Najarro Mejia
**Equipo:** Grupo 1 — Nova Salud (curso PIAD-527)

---

## 1. ¿Qué es REST?

REST (Representational State Transfer) es un **estilo de arquitectura** definido por Roy Fielding en su tesis doctoral (2000, Universidad de California, Irvine). No es un protocolo ni un formato: es un conjunto de reglas para diseñar cómo se comunican un cliente y un servidor a través de la web.

Sus ideas principales son:

- **Recursos con URL propia.** Cada dato del sistema es un recurso identificado por una dirección, por ejemplo `/api/productos` o `/api/ventas/5`.
- **Interfaz uniforme con los métodos HTTP.** `GET` consulta, `POST` crea, `PUT` actualiza y `DELETE` elimina.
- **Sin estado (stateless).** Cada petición lleva toda la información necesaria; el servidor no recuerda peticiones anteriores. Por eso, en Nova Salud, cada petición protegida envía el token JWT.
- **Representaciones.** El recurso se envía en un formato acordado; en la práctica actual, casi siempre JSON.
- **Respuestas con códigos HTTP** (200, 201, 400, 401, 404, 500) que indican el resultado.

## 2. ¿Qué es SOAP?

SOAP (Simple Object Access Protocol) es un **protocolo** estandarizado por el W3C (versión 1.2, recomendación de 2003, segunda edición de 2007) para intercambiar información estructurada entre sistemas mediante mensajes **XML**.

Sus características principales son:

- **Mensaje con estructura fija:** un `Envelope` (sobre) que contiene un `Header` opcional (seguridad, transacciones) y un `Body` con la operación y sus datos.
- **Solo XML.** No admite JSON.
- **Contrato formal WSDL.** Un archivo que describe con precisión qué operaciones ofrece el servicio y qué tipos de datos usa.
- **Orientado a operaciones**, no a recursos: se invoca una función, por ejemplo `RegistrarVenta`, normalmente con `POST` a una única URL.
- **Extensiones estándar (WS-\*)** para seguridad, transacciones y mensajería confiable. Es habitual en banca, gobierno y sistemas empresariales antiguos.

## 3. Diferencias principales

| Aspecto | REST | SOAP |
|---|---|---|
| Naturaleza | Estilo de arquitectura | Protocolo estándar (W3C) |
| Formato de datos | Libre; normalmente JSON | Solo XML |
| Enfoque | Recursos (`/api/productos`) | Operaciones (`RegistrarVenta`) |
| Uso de HTTP | Usa GET, POST, PUT y DELETE y los códigos de estado | Casi siempre POST a una sola URL; los errores van en un `Fault` dentro del XML |
| Contrato | Opcional (documentación, OpenAPI) | Obligatorio y formal (WSDL) |
| Tamaño del mensaje | Ligero | Más pesado por el sobre XML |
| Estado | Sin estado | Puede manejar estado y transacciones (WS-\*) |
| Seguridad | HTTPS + tokens (JWT, OAuth) | HTTPS + WS-Security a nivel de mensaje |
| Caché | Aprovecha la caché HTTP en las peticiones GET | Difícil de cachear |
| Consumo desde el navegador | Directo con `fetch` o Axios | Requiere construir y leer XML |
| Uso típico | Aplicaciones web y móviles | Banca, gobierno, integraciones empresariales |

## 4. Ejemplo con una petición del proyecto

Registrar una venta en Nova Salud, según `docs/contrato-api.md`.

### Con REST (implementación real del proyecto)

```http
POST /api/ventas HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Authorization: Bearer eyJhbGci...

{
  "usuario_id": 1,
  "productos": [
    { "producto_id": 1, "cantidad": 2 },
    { "producto_id": 3, "cantidad": 1 }
  ]
}
```

Respuesta `201 Created`:

```json
{ "venta_id": 5, "total": 2.50, "fecha": "2026-10-21T18:00:00" }
```

Si no hay stock suficiente, el backend responde `400 Bad Request` con `{ "error": "Stock insuficiente" }`. El código HTTP indica el resultado sin tener que leer el cuerpo.

### La misma operación con SOAP (ejemplo ilustrativo, no implementado)

```http
POST /ws/VentasService HTTP/1.1
Host: localhost:3000
Content-Type: application/soap+xml; charset=utf-8

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:ns="http://novasalud.pe/ventas">
  <soap:Header>
    <ns:Token>eyJhbGci...</ns:Token>
  </soap:Header>
  <soap:Body>
    <ns:RegistrarVenta>
      <ns:usuarioId>1</ns:usuarioId>
      <ns:productos>
        <ns:item><ns:productoId>1</ns:productoId><ns:cantidad>2</ns:cantidad></ns:item>
        <ns:item><ns:productoId>3</ns:productoId><ns:cantidad>1</ns:cantidad></ns:item>
      </ns:productos>
    </ns:RegistrarVenta>
  </soap:Body>
</soap:Envelope>
```

La misma información requiere bastante más texto. Además, un error de stock llegaría dentro de un elemento `<soap:Fault>` del XML.

## 5. ¿Por qué Nova Salud usa REST?

1. **El frontend es React.** El navegador trabaja de forma nativa con JSON. Con SOAP habría que construir y leer XML en cada pantalla (POS, productos, alertas, dashboard).
2. **Express facilita REST.** Cada recurso tiene su archivo de rutas y su controlador (`/api/productos`, `/api/ventas`, `/api/alertas`), lo que encaja con la estructura `routes/` y `controllers/` del backend.
3. **Autenticación con JWT sin estado.** El token viaja en el header `Authorization: Bearer`, y el servidor no necesita guardar sesiones. Esto concuerda con el principio sin estado de REST.
4. **Los códigos HTTP comunican el resultado** (201 venta creada, 400 stock insuficiente, 401 sin token), y así se verificó en las pruebas con Postman del flujo de ventas.
5. **Mensajes más ligeros**, adecuados para una botica pequeña con la base de datos MySQL en la nube (Aiven).
6. **No se integra con sistemas que exijan SOAP** (por ejemplo, servicios bancarios o de gobierno). Si en el futuro se necesitara, podría añadirse un servicio SOAP aparte sin cambiar la API actual.

## 6. Conclusión

SOAP es un protocolo formal y robusto, útil cuando se necesitan contratos estrictos y seguridad o transacciones a nivel de mensaje. REST es más simple, ligero y natural para aplicaciones web. Para Nova Salud, que es una aplicación React + Express con JWT y operaciones CRUD sobre productos, ventas e inventario, REST es la opción adecuada.

---

## Referencias

- Fielding, R. T. (2000). *Architectural Styles and the Design of Network-based Software Architectures*, capítulo 5: Representational State Transfer (REST). University of California, Irvine. https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm
- W3C (2007). *SOAP Version 1.2 Part 1: Messaging Framework (Second Edition)*. https://www.w3.org/TR/soap12-part1/
- Equipo Nova Salud. *Contrato de la API*. `docs/contrato-api.md`, rama `develop`. https://github.com/2026-II-Senati/Group-1-Nova-Salud/blob/develop/docs/contrato-api.md
