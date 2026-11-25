<div align="center">

  <p>
    <img
      src="docs/images/NovaSalud.png"
      alt="Logo de Nova Salud"
      width="350"
    />
  </p>

  <h3>
    Sistema web para la gestión de inventario y ventas de una botica
  </h3>

  <p>
  <img src="https://skillicons.dev/icons?i=js,react,vite,tailwind,nodejs,express,mysql,docker,python&perline=8" alt="JavaScript, React, Vite, Tailwind CSS, Node.js, Express, MySQL, Docker y Python" />
  </p>

</div>

<p align="center"><strong>Proyecto del curso PIAD-527.</strong></p>

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Base de datos: TiDB Cloud (MySQL Compatible), AWS São Paulo
- Autenticación: JWT
- Servicio de ML: Python + FastAPI (scikit-learn)

## Requisitos
- Node.js 20 o superior
- Python 3.11 o superior (solo para el servicio de ML)
- Git
- Acceso a la base de datos (pedir credenciales al equipo)

## Estructura
backend/    API REST (Express, controllers, routes)
frontend/   interfaz React (pages, components, services)
ml/         servicio de predicción de ventas (FastAPI + scikit-learn)
database/   script SQL con tablas y datos de prueba
docs/       contrato de la API

## Base de datos
La base corre en TiDB Cloud, modo MySQL Compatible, región AWS São Paulo
(sa-east-1). Se conecta igual que MySQL, con el puerto 4000.

El script está en `database/nova-salud.sql`.
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

## Servicio de ML

Predice las ventas del día a partir de las ventas anteriores y del calendario.
El dataset procesado (`ml/data/processed/dataset_nova_salud.csv`) y el modelo ya
entrenado (`ml/modelo.pkl`) están en el repositorio, así que no hace falta bajar
el `rossmann.csv` original para probar la API.

### Instalación

    cd ml
    pip install -r requirements.txt

### Reentrenar el modelo (opcional)

    python train.py

El script divide los datos por fechas en 70% entrenamiento, 15% validación y 15%
prueba. Compara Naive, Regresión Lineal y Random Forest usando **solo** el bloque
de validación, elige al de menor MAE, lo reentrena con entrenamiento + validación
y recién entonces lo evalúa una vez en prueba. Guarda el ganador en `modelo.pkl`.

### Levantar la API

    python -m uvicorn api:app --reload --port 8000

Documentación interactiva: http://localhost:8000/docs

### Probar

Con la API corriendo, en otra terminal:

    python probar_api.py

Debe responder `{"ventas_estimadas": <número>}`.

## Docker

El proyecto se levanta con Docker Compose: backend en el puerto 3000, frontend en
el 5173 y el servicio de ML en el 8000. La base está en TiDB Cloud, no se levanta
un contenedor de base de datos.

### Requisitos
- Docker Desktop con Docker Compose v2 (`docker compose version`)
- Acceso a la base de datos (pedir credenciales al equipo)

### Variables de entorno

El archivo `backend/.env` tiene que existir antes de levantar los contenedores,
porque `docker-compose.yml` lo inyecta con `env_file`. No viene en el repositorio:
trae la contraseña de la base y el secreto de JWT.

Si todavía no lo tienes, pídelo al equipo, o créalo a partir de la plantilla
`backend/.env.example`, completando los valores:

    PORT=3000
    DB_HOST=<host de TiDB Cloud>
    DB_PORT=4000
    DB_USER=<usuario>
    DB_PASSWORD=<contraseña>
    DB_NAME=nova_salud
    JWT_SECRET=<cadena larga>

El `.env` no se sube al repositorio: está en `.gitignore`, así que nunca se
commitea. No se comparte por chat ni por correo.

### Levantar el proyecto

    docker compose config
    docker compose up --build -d
    docker compose ps

Luego se abre http://localhost:5173 y se verifica que el backend responde en
http://localhost:3000/health con `{"database":"Conectada exitosamente"}`.
El servicio de ML se verifica en http://localhost:8000/docs.

Si un servicio queda en `Restarting`, es casi siempre porque falta `backend/.env`
o tiene valores vacíos: `docker compose logs backend` lo dice.

### Comandos

    docker compose up --build -d     construir la imagen y levantar en segundo plano
    docker compose down              detener y eliminar los contenedores
    docker compose ps                ver el estado de los servicios
    docker compose logs -f backend   ver los logs del backend (igual con frontend o ml)
    docker compose up --build -d     reconstruir después de cambiar código o Dockerfile
    docker compose restart backend   reiniciar sin reconstruir la imagen

El `--build` hace falta cuando cambia una dependencia, el `package.json`, un
`requirements.txt` o un Dockerfile; un `restart` no toma esos cambios. Cambiar
solo código del backend también necesita reconstruir, porque el código se copia
dentro de la imagen. Lo mismo aplica a `ml/` cuando se reentrena el modelo.

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

## Endpoints del servicio de ML
POST http://localhost:8000/predecir
GET  http://localhost:8000/docs
