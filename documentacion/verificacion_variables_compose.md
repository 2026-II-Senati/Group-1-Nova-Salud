# [PS2I-66] Verificación de variables de entorno en Docker Compose

**Proyecto:** Nova Salud
**Fecha:** 2026-11-03
**Responsable:** Jeff Steven Gil Toribio

---

### Objetivo

Comprobar que el contenedor del backend recibe las 7 variables de entorno que
necesita para conectar con la base en Aiven y que el servicio arranca con ellas.

---

### Entorno de la prueba

- Windows 10, Docker Desktop, engine 29.4.3
- `docker-compose.yml` con los servicios `backend` y `frontend`
- `backend/.env` inyectado por `env_file` (el archivo no está en git)

---

### Casos de prueba ejecutados

#### 1. Construcción y arranque

- **Acción:** `docker compose build` y luego `docker compose up --build -d`
- **Esperado:** ambas imágenes se construyen sin error y los contenedores quedan arriba.
- **Resultado:** `Image nova-salud-backend Built` y `nova-salud-frontend Built`; los dos
  contenedores en estado `Up`.
- **Estado:** Funcional

#### 2. Estado de los servicios

- **Acción:** `docker compose ps`
- **Esperado:** backend publicado en el puerto 3000 y frontend en el 5173.
- **Resultado:** `nova-backend Up 0.0.0.0:3000->3000/tcp` y
  `nova-frontend Up 0.0.0.0:5173->5173/tcp`.
- **Estado:** Funcional

#### 3. Variables dentro del contenedor

- **Acción:** `docker compose exec backend env | grep DB_`
- **Esperado:** aparecen las 7 variables del proyecto.
- **Resultado:** están `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
  `JWT_SECRET` y `PORT`.
- **Estado:** Funcional

#### 4. Comprobación de variables vacías

- **Acción:** leer cada variable dentro del contenedor y fallar si alguna está vacía.
- **Esperado:** ninguna vacía.
- **Resultado:** ninguna vacía; las 7 llegan con valor.
- **Estado:** Funcional

#### 5. Health check dentro de Docker

- **Acción:** `curl http://localhost:3000/health`
- **Esperado:** `{"database":"Conectada exitosamente"}`
- **Resultado:** HTTP 200 con `{"database":"Conectada exitosamente"}`.
- **Estado:** Funcional

#### 6. Conexión real a la base desde el contenedor

- **Acción:** `POST /api/auth/login` con `admin@novasalud.com`
- **Esperado:** HTTP 200 con token, o sea que el backend del contenedor conecta a
  la base de Aiven y consulta la tabla de usuarios.
- **Resultado:** HTTP 200 con token y datos del usuario.
- **Estado:** Funcional

---

### Conclusiones de validación

- El contenedor del backend recibe las 7 variables definidas en `backend/.env`.
- Ninguna de las 7 llega vacía.
- `/health` responde `Conectada exitosamente` dentro de Docker.
- La conexión a la base de Aiven funciona desde el contenedor, no solo en local.
- Los valores de las variables no se escriben en este reporte ni en el repositorio.
