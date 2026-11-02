# [PS2I-60] Reporte de Control de Acceso — Rol Vendedor

**Proyecto:** Nova Salud  
**Fecha:** 2026-11-02  
**Responsable:** Cesar Rosendo Loayza Manchego  

---

### Objetivo
Verificar que un usuario con rol Vendedor no pueda acceder a la gestión de usuarios ni mediante la manipulación de la URL.

---

### CASOS DE PRUEBA EJECUTADOS

#### 1. Navegación forzada por URL a /usuarios
* **Acción:** Iniciar sesión como Vendedor e ingresar manualmente la ruta "usuarios" en la barra del navegador.
* **Esperado:** Bloquear el acceso y redirigir al Dashboard o mostrar alerta de sin autorización.
* **Resultado:** El sistema redirige automáticamente al dashboard sin permitir la entrada a la vista de usuarios.
* **Estado:** Funcional

#### 2. Verificación de permisos de gestión
* **Acción:** Intentar realizar acciones de modificación o desactivación de usuarios desde el rol vendedor.
* **Esperado:** Impedir la ejecución de acciones administrativas.
* **Resultado:** Las opciones de administración permanecen ocultas e inaccesibles para el rol vendedor.
* **Estado:** Funcional

---

### Conclusiones de Validación
* El control de acceso por roles (RBAC) restringe correctamente las rutas privadas.
* La navegación forzada mediante URL es interceptada y redirigida de forma segura al Dashboard.
* No se exponen herramientas ni datos de gestión de usuarios a roles no autorizados.