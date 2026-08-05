# Data Model: QuestIt Core

Deriva de las Key Entities de `spec.md` y de las reglas de negocio del
PRD (RN-01 a RN-05). El nivel del usuario se deriva en lectura a partir
de la XP acumulada (ver research.md); no se persiste como columna.

## Usuario

| Campo | Tipo | Reglas |
|---|---|---|
| id | UUID (PK) | generado por el sistema |
| email | string | único, formato de email válido, requerido (FR-022) |
| passwordHash | string | hash de la contraseña (nunca texto plano), requerido |
| xpAcumulada | integer | ≥ 0, default 0; suma de XP de todos sus Eventos de Historial (RN-04) |
| createdAt | datetime | fecha de creación de la cuenta |

**Derivado (no persistido)**: `nivel = ⌊xpAcumulada / 100⌋ + 1` (RN-05,
FR-013).

**Relaciones**: 1 Usuario → N Tareas, N Hábitos, N EventosHistorial.

**Reglas de unicidad/lifecycle**: `email` único a nivel de base de datos
(constraint), no editable en el alcance de esta versión (no hay
requisito de cambiar email). Eliminar un Usuario está fuera de alcance
(no hay requisito de baja de cuenta).

## Tarea

| Campo | Tipo | Reglas |
|---|---|---|
| id | UUID (PK) | generado por el sistema |
| usuarioId | UUID (FK → Usuario) | dueño exclusivo; toda consulta filtra por este campo (FR-018) |
| titulo | string | requerido, 1–100 caracteres |
| descripcion | string | opcional, hasta 500 caracteres |
| dificultad | enum(Facil, Media, Dificil) | requerido (RN-01) |
| estado | enum(Pendiente, Completada) | default Pendiente (FR-007) |
| createdAt / updatedAt | datetime | auditoría; `updatedAt` respalda last-write-wins |

**Lifecycle**: `Pendiente → Completada` (una sola transición; no existe
"reabrir" en el alcance actual, ver Assumptions de spec.md). Al pasar a
`Completada` se genera exactamente un EventoHistorial con la XP de su
`dificultad` (FR-012). Eliminar una Tarea completada NO revierte su XP
ni borra su EventoHistorial asociado (FR-006) — la FK de EventoHistorial
hacia Tarea permite valor nulo/huérfano tras el borrado (ver
EventoHistorial).

## Hábito

| Campo | Tipo | Reglas |
|---|---|---|
| id | UUID (PK) | generado por el sistema |
| usuarioId | UUID (FK → Usuario) | dueño exclusivo; toda consulta filtra por este campo (FR-018) |
| nombre | string | requerido, 1–100 caracteres |
| dificultad | enum(Facil, Media, Dificil) | requerido (RN-02) |
| createdAt / updatedAt | datetime | auditoría; `updatedAt` respalda last-write-wins |

**Lifecycle**: no tiene estado único; su progreso se expresa como una
serie de RegistroCumplimientoHabito en el tiempo. Eliminar un Hábito NO
revierte la XP de sus registros previos ni borra sus EventosHistorial
asociados (FR-010).

## RegistroCumplimientoHabito

| Campo | Tipo | Reglas |
|---|---|---|
| id | UUID (PK) | generado por el sistema |
| habitoId | UUID (FK → Hábito) | hábito cumplido |
| fecha | date | fecha del cumplimiento (fecha actual al momento de registrar) |
| createdAt | datetime | auditoría |

**Reglas de unicidad**: constraint único sobre `(habitoId, fecha)` — un
mismo hábito no puede tener más de un registro por fecha (FR-023). Un
intento de duplicado es rechazado por la capa de aplicación mostrando el
mensaje de "ya registrado hoy" (ver spec.md, Edge Cases) antes de llegar
a violar el constraint, que actúa como salvaguarda final ante condiciones
de carrera.

## EventoHistorial

| Campo | Tipo | Reglas |
|---|---|---|
| id | UUID (PK) | generado por el sistema |
| usuarioId | UUID (FK → Usuario) | dueño exclusivo; toda consulta filtra por este campo (FR-018) |
| tipo | enum(TareaCompletada, HabitoCumplido) | origen del evento |
| tareaId | UUID (FK → Tarea, nullable) | presente si `tipo = TareaCompletada`; permanece aunque la Tarea se elimine (FK sin cascada de borrado, o se limpia a null preservando el resto de campos) |
| habitoId / registroCumplimientoId | UUID (FK, nullable) | presente si `tipo = HabitoCumplido`; mismo criterio de persistencia independiente |
| fecha | datetime | fecha/hora del evento, usada para el orden cronológico descendente (FR-020) |
| xpObtenida | integer | XP otorgada por este evento (5/10/20 según dificultad al momento de completarse) |

**Reglas clave**:
- Es la única fuente de verdad para "XP acumulada" (`Usuario.xpAcumulada`
  = suma de `xpObtenida` de sus EventosHistorial) y para los contadores
  del panel (cantidad de tareas completadas = count de eventos
  `TareaCompletada`; cantidad de registros de hábito = count de eventos
  `HabitoCumplido`) — FR-016, FR-017.
- Persiste independientemente de la Tarea/Hábito de origen: si estos se
  eliminan, el evento y su `xpObtenida` permanecen intactos (spec.md, Key
  Entities).
- Paginación: keyset/cursor sobre `(usuarioId, fecha DESC, id DESC)` en
  bloques de 20 (FR-020; ver research.md).

## Índices sugeridos

- `Usuario.email` (único).
- `Tarea.usuarioId`, `Habito.usuarioId` (listar por dueño).
- `RegistroCumplimientoHabito(habitoId, fecha)` (único; también resuelve
  "¿ya se cumplió hoy?").
- `EventoHistorial(usuarioId, fecha DESC)` (paginación e historial).
