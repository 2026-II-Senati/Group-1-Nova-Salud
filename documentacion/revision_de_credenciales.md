# [PS2I-70] Reporte de Auditoría de Credenciales en Código

**Proyecto:** Nova Salud  
**Fecha:** 2026-11-02  
**Responsable:** Cesar Rosendo Loayza Manchego  

---

### Objetivo
Verificar la ausencia de contraseñas, tokens o claves secretas escritas directamente en el código fuente o registradas en el historial del repositorio.

---

### CASOS DE PRUEBA EJECUTADOS

#### 1. Auditoría del historial de Git
- **Acción:** Ejecutar git log -S "aivencloud" --oneline para buscar rastros de credenciales expuestas en commits anteriores.
- **Esperado:** No encontrar coincidencia de claves secretas registradas en el historial.
- **Resultado:** El historial se encuentra limpio de credenciales hardcodeadas.
- **Estado:** Funcional

#### 2. Verificación de exclusión de variables de entorno (.env)
- **Acción:** Ejecutar git status --ignored para revisar que el archivo .env esté ignorado por Git.
- **Esperado:** Evitar que el archivo .env se suba al repositorio remoto.
- **Resultado:** El archivo backend/.env aparece como ignorado de forma correcta.
- **Estado:** Funcional

---

### Conclusiones de Validación
- Todo el contenido sensible se gestiona de forma segura mediante variables de entorno local (.env).
- El archivo backend/.env no forma parte del control de versiones de Git.
- No se identificaron credenciales ni tokens expuestos dentro de la base de código.