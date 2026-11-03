<div align="center">

  <p>
    <img
      src="docs/images/Nova-Salud.png"
      alt="Logo de Nova Salud"
      width="350"
    />
  </p>

  <h3>
    Sistema web para la gestión de inventario y ventas de una botica
  </h3>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-20232A?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  </p>

</div>

---
<p align="center"><strong>Proyecto del curso PIAD-527.</strong></p>

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Base de datos: MySQL en Aiven
- Autenticación: JWT

## Requisitos
- Node.js 20 o superior
- Git
- Acceso a la base de datos (pedir credenciales al equipo)

## Estructura
backend/    API REST (Express, controllers, routes)
frontend/   interfaz React (pages, components, services)
database/   script SQL con tablas y datos de prueba
docs/       contrato de la API

## Base de datos
El script está en `database/nova_salud.sql`.
Crea las 8 tablas y carga los datos de prueba.

Las credenciales van en `backend/.env` (no se sube al repositorio).
Usar `backend/.env.example` como plantilla.

## Backend
cd backend
npm install
npm run dev

Corre en http://localhost:3000
Verificar con: http://localhost:3000/health

## Frontend
cd frontend
npm install
npm run dev

Corre en http://localhost:5173

## Docker

El proyecto se levanta con Docker Compose: backend en el puerto 3000, frontend en
el 5173. La base sigue en Aiven, no se levanta un contenedor de MySQL.

### Requisitos
- Docker Desktop con Docker Compose v2 (`docker compose version`)
- Acceso a la base de datos (pedir credenciales al equipo)

### Variables de entorno

El archivo `backend/.env` tiene que existir antes de levantar los contenedores,
porque `docker-compose.yml` lo inyecta con `env_file`. No viene en el repositorio:
trae la contraseña de la base y el secreto de JWT.

Si todavía no lo tienes, pídelo al equipo, o créalo a partir de la plantilla
`.env.example` (está en la raíz del repositorio), completando los valores:

    PORT=3000
    DB_HOST=<host de Aiven>
    DB_PORT=<puerto de Aiven>
    DB_USER=<usuario>
    DB_PASSWORD=<contraseña>
    DB_NAME=<base>
    JWT_SECRET=<cadena larga>

El `.env` no se sube al repositorio: está en `.gitignore`, así que nunca se
commitea. No se comparte por chat ni por correo.

### Levantar el proyecto

    docker compose config
    docker compose up --build -d
    docker compose ps

Luego se abre http://localhost:5173 y se verifica que el backend responde en
http://localhost:3000/health con `{"database":"Conectada exitosamente"}`.

Si un servicio queda en `Restarting`, es casi siempre porque falta `backend/.env`
o tiene valores vacíos: `docker compose logs backend` lo dice.

### Comandos

    docker compose up --build -d     construir la imagen y levantar en segundo plano
    docker compose down              detener y eliminar los contenedores
    docker compose ps                ver el estado de los servicios
    docker compose logs -f backend   ver los logs del backend (igual con frontend)
    docker compose up --build -d     reconstruir después de cambiar código o Dockerfile
    docker compose restart backend   reiniciar sin reconstruir la imagen

El `--build` hace falta cuando cambia una dependencia, el `package.json` o un
Dockerfile; un `restart` no toma esos cambios. Cambiar solo código del backend
también necesita reconstruir, porque el código se copia dentro de la imagen.

### Ver las variables dentro del contenedor

    docker compose exec backend env | grep DB_

Debe listar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, y también
`PORT` y `JWT_SECRET`. Si falta alguna, revisar `backend/.env`.

## Usuarios de prueba
admin@novasalud.com / temporal (administrador)
vendedor@novasalud.com / temporal (vendedor)

## Endpoints principales
POST /api/auth/register
POST /api/auth/login
GET  /api/me
GET  /api/productos
POST /api/productos
GET  /api/categorias
GET  /api/proveedores
POST /api/ventas
GET  /api/alertas
GET  /api/dashboard/metricas
