# API Contract: QuestIt Core

Todas las rutas (salvo `/api/auth/registro` y `/api/auth/login`) requieren
sesión autenticada vía cookie; sin sesión válida responden `401`. Toda
consulta se filtra implícitamente por el usuario de la sesión (FR-018) —
ningún endpoint acepta un `usuarioId` como parámetro.

Formato de error común:

```json
{ "error": { "codigo": "string", "mensaje": "string" } }
```

## Auth

### POST /api/auth/registro

**Request**: `{ "email": "string", "password": "string" }`

**Reglas**: email formato válido y no registrado (FR-022); password ≥ 8
caracteres.

**Response 201**: `{ "usuario": { "id", "email", "xp": 0, "nivel": 1 } }`
— crea la cuenta e inicia sesión automáticamente (cookie de sesión en la
respuesta), sin requerir login separado (Clarifications, Session
2026-08-03).

**Errores**: `409` email ya registrado; `400` datos inválidos.

### POST /api/auth/login

**Request**: `{ "email": "string", "password": "string" }`

**Response 200**: `{ "usuario": { "id", "email", "xp", "nivel" } }` +
cookie de sesión.

**Errores**: `401` credenciales inválidas (mensaje genérico, sin indicar
cuál dato es incorrecto — Edge Cases spec.md).

### POST /api/auth/logout

**Response 204**. Invalida la sesión (cookie).

## Tareas

### GET /api/tareas

**Response 200**: `{ "tareas": [ { id, titulo, descripcion, dificultad, estado, createdAt, updatedAt } ] }`
— solo tareas del usuario autenticado.

### POST /api/tareas

**Request**: `{ "titulo": "string(1-100)", "descripcion": "string(0-500)?", "dificultad": "Facil|Media|Dificil" }`

**Response 201**: tarea creada, `estado: "Pendiente"`.

### PATCH /api/tareas/:id

**Request**: subconjunto de `{ titulo, descripcion, dificultad }`.

**Response 200**: tarea actualizada. **403** si `:id` no pertenece al
usuario autenticado (FR-021), sin aplicar ningún cambio.

### DELETE /api/tareas/:id

**Response 204**. **403** si no pertenece al usuario. La XP ya otorgada
por esta tarea (si estaba completada) se conserva (FR-006).

### POST /api/tareas/:id/completar

**Response 200**: `{ "tarea": {...estado: "Completada"}, "xpObtenida": number, "usuario": { "xp", "nivel" } }`
— suma XP según dificultad (RN-03) y crea un EventoHistorial, de forma
atómica. **403** si no pertenece al usuario.

## Hábitos

### GET /api/habitos

**Response 200**: `{ "habitos": [ { id, nombre, dificultad, createdAt, updatedAt } ] }`.

### POST /api/habitos

**Request**: `{ "nombre": "string(1-100)", "dificultad": "Facil|Media|Dificil" }`

**Response 201**: hábito creado.

### PATCH /api/habitos/:id

**Request**: subconjunto de `{ nombre, dificultad }`.

**Response 200**. **403** si no pertenece al usuario, sin aplicar cambios.

### DELETE /api/habitos/:id

**Response 204**. **403** si no pertenece al usuario. La XP ya otorgada
por sus registros previos se conserva (FR-010).

### POST /api/habitos/:id/cumplir

**Response 200**: `{ "registro": { id, fecha }, "xpObtenida": number, "usuario": { "xp", "nivel" } }`
— crea el registro del día actual y suma XP, de forma atómica.

**Response 409** (`codigo: "HABITO_YA_CUMPLIDO_HOY"`): si ya existe un
registro para hoy; no se otorga XP adicional ni se crea un registro
nuevo (FR-023, Edge Cases). **403** si el hábito no pertenece al usuario.

## Panel y estadísticas

### GET /api/panel

**Response 200**:
```json
{
  "xp": number,
  "nivel": number,
  "tareasCompletadas": number,
  "registrosHabitoCumplidos": number
}
```
Todos los valores en 0 si el usuario no tiene actividad (Edge Cases).

### GET /api/historial?cursor=&limit=20

**Response 200**:
```json
{
  "eventos": [ { "id", "tipo", "fecha", "xpObtenida", "origen": { "titulo|nombre" } } ],
  "siguienteCursor": "string|null"
}
```
Ordenado por `fecha` descendente. `limit` fijo en 20 por defecto
(FR-020); `siguienteCursor: null` indica que no hay más páginas.
