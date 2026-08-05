# Quickstart: QuestIt Core

## Prerrequisitos

- Node.js 18 LTS, npm
- PostgreSQL 15 corriendo localmente (o `DATABASE_URL` apuntando a una
  instancia accesible)
- Variables de entorno en `.env` (no commiteado): `DATABASE_URL`,
  secreto de sesión (ver Principio IV — sin secretos hardcodeados)

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Escenarios de validación end-to-end

Cada escenario corresponde a una Historia de Usuario de `spec.md` y debe
tener un test Playwright equivalente (ver research.md).

### 1. Registro, login, logout (Historia 1)

1. Ir a `/registro`, completar email nuevo + password ≥ 8 caracteres.
2. **Esperado**: la cuenta se crea y el usuario queda autenticado de
   inmediato (sin pantalla de login intermedia).
3. Cerrar sesión desde la UI.
4. **Esperado**: se pierde el acceso a rutas protegidas (`/panel`,
   `/tareas`, `/habitos`) hasta volver a iniciar sesión con las mismas
   credenciales.
5. Repetir el registro con el mismo email.
6. **Esperado**: rechazo sin crear una segunda cuenta (FR-022).

### 2. Tareas con XP (Historia 2)

1. Autenticado, crear una tarea con dificultad Media.
2. Editarla (cambiar título) y verificar que persiste el cambio.
3. Marcarla como completada.
4. **Esperado**: XP acumulada del usuario sube exactamente en 10 (RN-03),
   el panel refleja el nuevo total, y aparece un evento en el historial.
5. Eliminar la tarea completada.
6. **Esperado**: desaparece de la lista, pero la XP y el evento del
   historial permanecen (FR-006).
7. Con una segunda cuenta, intentar editar/eliminar la tarea de la
   primera cuenta (por id).
8. **Esperado**: rechazado (403), sin cambios (FR-021).

### 3. Hábitos con seguimiento diario (Historia 3)

1. Autenticado, crear un hábito con dificultad Fácil.
2. Registrar su cumplimiento del día.
3. **Esperado**: XP sube en 5, aparece un evento en el historial.
4. Intentar registrar el cumplimiento del mismo hábito otra vez el mismo
   día.
5. **Esperado**: mensaje de "ya registrado hoy", sin XP adicional ni
   registro duplicado (FR-023).

### 4. Panel, estadísticas e historial (Historia 4)

1. Con un usuario que acumuló 205 XP (vía pasos anteriores u otros
   fixtures), acceder a `/panel`.
2. **Esperado**: se muestra Nivel 3 (`⌊205/100⌋+1`), XP total, cantidad
   de tareas completadas y cantidad de registros de hábitos cumplidos.
3. Acceder al historial.
4. **Esperado**: orden cronológico descendente, cada evento con fecha y
   XP; cargar más allá del primer bloque de 20 trae la siguiente página
   sin duplicar ni saltar eventos.
5. Con un usuario recién creado (sin actividad), acceder al panel.
6. **Esperado**: todos los contadores en 0, sin errores (Edge Cases).

## Validación de responsive y performance

- Ejecutar los escenarios anteriores (Playwright) en viewports 360px,
  768px y 1920px — Principio VI.
- Medir Lighthouse Performance en `/panel` y verificar score ≥ 90 y TTI
  < 3s en 4G simulada — Principio VII, SC-002.
