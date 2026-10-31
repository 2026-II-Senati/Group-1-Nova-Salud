# Nova Salud

Sistema web de gestión de inventario y ventas para una botica.
Proyecto del curso PIAD-527.

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
