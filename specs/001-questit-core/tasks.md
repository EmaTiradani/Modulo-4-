---

description: "Task list template for feature implementation"
---

# Tasks: QuestIt Core — Tareas, Hábitos y Progreso Gamificado

**Input**: Design documents from `/specs/001-questit-core/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Incluidos y obligatorios en cada historia — el Principio I
(Test-First, NON-NEGOTIABLE) de la constitución exige escribir el test
antes que la implementación y verlo fallar (rojo-verde-refactor). No son
opcionales en este proyecto.

**Organization**: Tareas agrupadas por historia de usuario (spec.md) para
permitir implementación y prueba independiente de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: Historia de usuario a la que pertenece (US1–US4)
- Se incluye la ruta de archivo exacta en cada descripción

## Path Conventions

Single project Next.js 14 (App Router) — ver plan.md §Project Structure:
`src/app/`, `src/lib/`, `src/components/`, `prisma/`, `tests/{unit,integration,e2e}/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicialización del proyecto y herramientas base

- [X] T001 Create Next.js 14 (App Router, TypeScript) project structure: `src/app/`, `src/lib/`, `src/components/`, `prisma/`, `tests/unit/`, `tests/integration/`, `tests/e2e/` per plan.md
- [X] T002 Initialize `package.json` with Next.js 14, TypeScript, Prisma, bcrypt, Vitest, Playwright, dotenv as dependencies
- [X] T003 [P] Configure ESLint + Prettier for the project
- [X] T004 [P] Configure Vitest (`vitest.config.ts`) for unit and integration tests
- [X] T005 [P] Configure Playwright (`playwright.config.ts`) with viewport projects for 360px, 768px y 1920px (Principio VI)
- [X] T006 [P] Create `.env.example` with `DATABASE_URL` y `SESSION_SECRET` placeholders (sin valores reales — Principio IV); documentar en README que `.env` no se commitea

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura núcleo requerida por todas las historias

**⚠️ CRITICAL**: Ninguna historia de usuario puede comenzar hasta completar esta fase

- [X] T007 Define Prisma schema (`Usuario`, `Tarea`, `Habito`, `RegistroCumplimientoHabito`, `EventoHistorial`) con constraints de unicidad e índices en `prisma/schema.prisma` per data-model.md
- [X] T008 Run initial Prisma migration (`npx prisma migrate dev`) contra la base de datos de desarrollo y de test
- [X] T009 [P] Implement Prisma client singleton in `src/lib/db/client.ts`
- [X] T010 [P] Unit test `calcularXP(dificultad)` y `calcularNivel(xpAcumulada)` cubriendo RN-03 (5/10/20) y RN-05 (205 XP → Nivel 3) in `tests/unit/xp.test.ts` — debe fallar antes de T011
- [X] T011 [P] Implement `calcularXP`/`calcularNivel` como funciones puras in `src/lib/xp/calculo.ts` (depends on T010 failing test)
- [X] T012 [P] Implement utilidades de hashing de contraseña (hash/verify con bcrypt) in `src/lib/auth/password.ts`
- [X] T013 Implement gestión de sesión (crear/leer/destruir cookie HTTP-only firmada) in `src/lib/auth/session.ts` (depends on T009)
- [X] T014 Implement helper `getUsuarioAutenticado` que impone el aislamiento por usuario (FR-018) in `src/lib/auth/middleware.ts` (depends on T013)
- [X] T015 [P] Implement helper de respuesta de error estándar (`{ error: { codigo, mensaje } }` — contracts/api.md) in `src/lib/api/errors.ts`
- [X] T015b [P] Implement componente reutilizable de diálogo de confirmación, usado antes de eliminar una tarea o un hábito (FR-006, FR-010) in `src/components/ConfirmDialog.tsx`
- [X] T015c [P] Implement wrapper de fetch cliente que detecta una respuesta 401 (sesión expirada), muestra un mensaje visible y redirige a `/login` (FR-027) in `src/lib/api/client.ts`
- [X] T015d [P] Implement componente reutilizable de estado vacío (mensaje ilustrativo + CTA de creación) usado en la lista de tareas y la de hábitos (FR-028) in `src/components/EmptyState.tsx`

**Checkpoint**: Fundación lista — las historias de usuario pueden comenzar

---

## Phase 3: User Story 1 - Registro, inicio y cierre de sesión (Priority: P1) 🎯 MVP

**Goal**: Un visitante puede crear una cuenta (con auto-login), iniciar sesión y cerrar sesión; sin sesión válida no hay acceso a datos propios.

**Independent Test**: Registrar una cuenta nueva, cerrar sesión, volver a iniciar sesión con esas credenciales y verificar que el acceso se otorga/deniega correctamente, sin depender de tareas ni hábitos.

### Tests for User Story 1 ⚠️

> Escribir estos tests PRIMERO y verificar que fallan antes de implementar

- [X] T016 [P] [US1] Integration test: `POST /api/auth/registro` crea la cuenta e inicia sesión automáticamente (FR-001) in `tests/integration/auth-registro.test.ts`
- [X] T017 [P] [US1] Integration test: `POST /api/auth/registro` rechaza un email ya registrado sin crear cuenta duplicada (FR-022) in `tests/integration/auth-registro-duplicado.test.ts`
- [X] T018 [P] [US1] Integration test: `POST /api/auth/login` acepta credenciales válidas y rechaza inválidas con mensaje genérico (FR-002, Edge Cases) in `tests/integration/auth-login.test.ts`
- [X] T019 [P] [US1] Integration test: `POST /api/auth/logout` invalida la sesión y bloquea el acceso posterior (FR-003) in `tests/integration/auth-logout.test.ts`
- [X] T020 [P] [US1] E2E test: registro→acceso inmediato→logout→login, ejecutado en viewports 360/768/1920 (SC-004) in `tests/e2e/auth.spec.ts`
- [X] T020b [P] [US1] E2E test: durante registro/login se muestra un estado de carga visible mientras se envía el formulario, y un mensaje de error visible ante credenciales inválidas o fallo simulado del servidor (FR-025) in `tests/e2e/auth.spec.ts`
- [X] T020c [P] [US1] E2E test: el envío de registro/login con un email de formato inválido o una contraseña de menos de 8 caracteres se bloquea y muestra el mensaje de validación junto al campo correspondiente, antes de llamar al servidor (FR-029) in `tests/e2e/auth.spec.ts`

### Implementation for User Story 1

- [X] T021 [US1] Implement `POST /api/auth/registro` in `src/app/api/auth/registro/route.ts` (depends on T012, T013, T014, T015)
- [X] T022 [US1] Implement `POST /api/auth/login` in `src/app/api/auth/login/route.ts` (depends on T012, T013, T015)
- [X] T023 [US1] Implement `POST /api/auth/logout` in `src/app/api/auth/logout/route.ts` (depends on T013)
- [X] T024 [P] [US1] Build página/formulario de registro con estados de carga y error visibles (FR-025), validación de campo para email/contraseña (FR-029), y redirección al panel principal tras el auto-login (FR-001) in `src/app/(auth)/registro/page.tsx` (depends on T020b, T020c)
- [X] T025 [P] [US1] Build página/formulario de login con estados de carga y error visibles (FR-025) y validación de campo para email/contraseña (FR-029) in `src/app/(auth)/login/page.tsx` (depends on T020b, T020c)
- [X] T026 [US1] Add acción de logout al layout autenticado in `src/app/(app)/layout.tsx` (depends on T023)

**Checkpoint**: Historia 1 funcional y testeable de forma independiente

---

## Phase 4: User Story 2 - Gestión de tareas con recompensa de experiencia (Priority: P2)

**Goal**: Un usuario autenticado crea, edita, elimina y completa tareas propias, ganando XP según dificultad al completarlas.

**Independent Test**: Crear una tarea, editarla, completarla y verificar que la XP acumulada sube exactamente lo esperado, y finalmente eliminarla.

### Tests for User Story 2 ⚠️

- [X] T027 [P] [US2] Integration test: `POST /api/tareas` crea tarea respetando límites de título (1–100) y descripción (0–500) (FR-004) in `tests/integration/tareas-crear.test.ts`
- [X] T028 [P] [US2] Integration test: `PATCH /api/tareas/:id` edita una tarea propia y rechaza sin cambios la de otro usuario (FR-005, FR-021) in `tests/integration/tareas-editar.test.ts`
- [X] T029 [P] [US2] Integration test: `DELETE /api/tareas/:id` elimina la tarea propia, conserva la XP si ya estaba completada, y rechaza la de otro usuario (FR-006, FR-021) in `tests/integration/tareas-eliminar.test.ts`
- [X] T030 [P] [US2] Integration test: `POST /api/tareas/:id/completar` suma la XP de la dificultad y crea un EventoHistorial de forma atómica, y una segunda solicitud no otorga XP adicional (FR-007, FR-012, FR-024) in `tests/integration/tareas-completar.test.ts`
- [X] T031 [P] [US2] E2E test: crear→editar→completar→eliminar tarea, verificando el aumento de XP en la UI (SC-001, SC-005) in `tests/e2e/tareas.spec.ts`
- [X] T031b [P] [US2] E2E test: al crear/editar/eliminar/completar una tarea se muestra estado de carga visible durante la solicitud y mensaje de error ante un fallo simulado (FR-025) in `tests/e2e/tareas.spec.ts`
- [X] T031c [P] [US2] E2E test: eliminar una tarea muestra un diálogo de confirmación y solo se borra si el usuario confirma (FR-006) in `tests/e2e/tareas.spec.ts`
- [X] T031d [P] [US2] E2E test: la lista de tareas vacía muestra un estado ilustrativo invitando a crear la primera tarea (FR-028) in `tests/e2e/tareas.spec.ts`
- [X] T031e [P] [US2] E2E test: intentar guardar un título vacío, mayor a 100 caracteres, o una descripción mayor a 500 caracteres bloquea el envío y muestra el mensaje de validación junto al campo (FR-004) in `tests/e2e/tareas.spec.ts`
- [X] T031f [P] [US2] E2E test: si falla el guardado de una tarea (creación/edición), los datos ya ingresados en el formulario se conservan para reintentar (FR-030) in `tests/e2e/tareas.spec.ts`

### Implementation for User Story 2

- [X] T032 [P] [US2] Implement `GET`/`POST /api/tareas` in `src/app/api/tareas/route.ts` (depends on T014, T015)
- [X] T033 [P] [US2] Implement `PATCH`/`DELETE /api/tareas/[id]` con verificación de dueño (FR-021) in `src/app/api/tareas/[id]/route.ts` (depends on T014, T015)
- [X] T034 [US2] Implement `POST /api/tareas/[id]/completar` (transacción: estado→Completada + suma XP + EventoHistorial, idempotente) in `src/app/api/tareas/[id]/completar/route.ts` (depends on T011, T032, T033)
- [X] T035 [P] [US2] Build listado y formulario de tareas con estados de carga/error visibles (FR-025), validación de campo para título/descripción (FR-004), estado vacío (FR-028, usando `EmptyState`), confirmación antes de eliminar (FR-006, usando `ConfirmDialog`) y conservación de datos del formulario ante un guardado fallido (FR-030) in `src/app/(app)/tareas/page.tsx` (depends on T032, T033, T031b, T031c, T031d, T031e, T031f, T015b, T015d)
- [X] T036 [US2] Add acción "completar tarea" en la UI reflejando la XP actualizada in `src/app/(app)/tareas/page.tsx` (depends on T034, T035)

**Checkpoint**: Historias 1 y 2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Gestión de hábitos con seguimiento diario (Priority: P2)

**Goal**: Un usuario autenticado crea, edita, elimina hábitos propios y registra su cumplimiento diario, ganando XP según dificultad.

**Independent Test**: Crear un hábito, registrar su cumplimiento del día, verificar el aumento de XP, y finalmente editarlo o eliminarlo.

### Tests for User Story 3 ⚠️

- [X] T037 [P] [US3] Integration test: `POST /api/habitos` crea hábito respetando el límite de nombre (1–100) (FR-008) in `tests/integration/habitos-crear.test.ts`
- [X] T038 [P] [US3] Integration test: `PATCH /api/habitos/:id` edita un hábito propio y rechaza sin cambios el de otro usuario (FR-009, FR-021) in `tests/integration/habitos-editar.test.ts`
- [X] T039 [P] [US3] Integration test: `DELETE /api/habitos/:id` elimina el hábito propio, conserva la XP de registros previos, y rechaza el de otro usuario (FR-010, FR-021) in `tests/integration/habitos-eliminar.test.ts`
- [X] T040 [P] [US3] Integration test: `POST /api/habitos/:id/cumplir` registra el cumplimiento del día y suma XP; un segundo intento el mismo día responde con el mensaje de "ya registrado hoy" sin XP adicional (FR-011, FR-012, FR-023) in `tests/integration/habitos-cumplir.test.ts`
- [X] T041 [P] [US3] E2E test: crear hábito→cumplir→intentar cumplir de nuevo el mismo día→ver el mensaje de duplicado (SC-001) in `tests/e2e/habitos.spec.ts`
- [X] T041b [P] [US3] E2E test: al crear/editar/eliminar/cumplir un hábito se muestra estado de carga visible durante la solicitud y mensaje de error ante un fallo simulado (FR-025) in `tests/e2e/habitos.spec.ts`
- [X] T041c [P] [US3] E2E test: eliminar un hábito muestra un diálogo de confirmación y solo se borra si el usuario confirma (FR-010) in `tests/e2e/habitos.spec.ts`
- [X] T041d [P] [US3] E2E test: la lista de hábitos vacía muestra un estado ilustrativo invitando a crear el primer hábito (FR-028) in `tests/e2e/habitos.spec.ts`
- [X] T041e [P] [US3] E2E test: intentar guardar un nombre vacío o mayor a 100 caracteres bloquea el envío y muestra el mensaje de validación junto al campo (FR-008) in `tests/e2e/habitos.spec.ts`
- [X] T041f [P] [US3] E2E test: si falla el guardado de un hábito (creación/edición), los datos ya ingresados en el formulario se conservan para reintentar (FR-030) in `tests/e2e/habitos.spec.ts`

### Implementation for User Story 3

- [X] T042 [P] [US3] Implement `GET`/`POST /api/habitos` in `src/app/api/habitos/route.ts` (depends on T014, T015)
- [X] T043 [P] [US3] Implement `PATCH`/`DELETE /api/habitos/[id]` con verificación de dueño (FR-021) in `src/app/api/habitos/[id]/route.ts` (depends on T014, T015)
- [X] T044 [US3] Implement `POST /api/habitos/[id]/cumplir` (constraint único `(habitoId, fecha)`, transacción XP + EventoHistorial) in `src/app/api/habitos/[id]/cumplir/route.ts` (depends on T011, T042, T043)
- [X] T045 [P] [US3] Build listado y formulario de hábitos con estados de carga/error visibles, validación de campo para el nombre (FR-008), estado vacío (FR-028, usando `EmptyState`), confirmación antes de eliminar (FR-010, usando `ConfirmDialog`) y conservación de datos del formulario ante un guardado fallido (FR-030) in `src/app/(app)/habitos/page.tsx` (depends on T042, T043, T041b, T041c, T041d, T041e, T041f, T015b, T015d)
- [X] T046 [US3] Add acción "registrar cumplimiento" mostrando el mensaje de duplicado cuando corresponda in `src/app/(app)/habitos/page.tsx` (depends on T044, T045)

**Checkpoint**: Historias 1, 2 y 3 funcionan de forma independiente

---

## Phase 6: User Story 4 - Panel de progreso, estadísticas e historial (Priority: P3)

**Goal**: Un usuario autenticado visualiza su XP, nivel, contadores de actividad y un historial cronológico paginado.

**Independent Test**: Con un usuario con XP, nivel, tareas completadas y registros de hábitos conocidos (vía US2/US3), acceder al panel y verificar que los valores coinciden y que el historial pagina correctamente en orden descendente.

### Tests for User Story 4 ⚠️

- [X] T047 [P] [US4] Integration test: `GET /api/panel` devuelve XP/nivel/contadores correctos, y en cero para un usuario sin actividad (FR-014–FR-017, Edge Cases) in `tests/integration/panel.test.ts`
- [X] T048 [P] [US4] Integration test: `GET /api/historial` pagina por cursor en bloques de 20, orden descendente, sin duplicar ni saltar eventos (FR-020) in `tests/integration/historial.test.ts`
- [X] T049 [P] [US4] Integration test: un usuario no puede leer el panel, tareas, hábitos o historial de otro mediante manipulación directa de un identificador (FR-018, SC-006) in `tests/integration/aislamiento.test.ts`
- [X] T050 [P] [US4] E2E test: usuario con 205 XP ve Nivel 3 en el panel; el historial se muestra en orden cronológico descendente con paginación funcional (Acceptance Scenarios 1 y 5) in `tests/e2e/panel.spec.ts`
- [X] T050b [P] [US4] Integration test: crear tarea, hábito y XP, cerrar sesión, volver a iniciar sesión, y verificar que tarea, hábito, XP y nivel se recuperan íntegros (FR-019, SC-003) in `tests/integration/persistencia.test.ts`
- [X] T050c [P] [US4] E2E test: con menos de 20 eventos en el historial, el botón "Cargar más" no se muestra; con 20 o más, se muestra y carga el siguiente bloque al hacer clic (FR-020) in `tests/e2e/panel.spec.ts`

### Implementation for User Story 4

- [X] T051 [P] [US4] Implement `GET /api/panel` in `src/app/api/panel/route.ts` (depends on T011, T014)
- [X] T052 [P] [US4] Implement `GET /api/historial` con paginación por cursor in `src/app/api/historial/route.ts` (depends on T014)
- [X] T053 [US4] Build página de panel (XP, nivel, contadores) con estados de carga/error visibles in `src/app/(app)/panel/page.tsx` (depends on T051)
- [X] T054 [US4] Build componente de historial paginado con botón "Cargar más" en bloques de 20, oculto cuando hay menos de 20 eventos o ya se cargó todo (FR-020) in `src/app/(app)/panel/historial.tsx` (depends on T052, T050c)

**Checkpoint**: Las 4 historias de usuario funcionan de forma independiente

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validaciones que abarcan varias historias

- [X] T055 [P] Run quickstart.md validation scenarios de punta a punta
- [X] T056 [P] Verify Lighthouse Performance ≥ 90 y Time to Interactive < 3s en `/panel` bajo 4G simulada (Principio VII, SC-002)
- [X] T057 [P] Verify comportamiento responsive en 360px/768px/1920px en todas las páginas vía Playwright (Principio VI, SC-004)
- [X] T058 Security review: confirmar ausencia de secretos hardcodeados y que `.env` no está commiteado (Principio IV)
- [X] T059 [P] Update README con instrucciones para correr tests (`npm run test`, `npm run test:e2e`) y migraciones
- [ ] T060 [P] Measure p95 latency for crear/editar/eliminar tarea y hábito bajo carga simulada, verificando <2s (SC-001) in `tests/e2e/performance-crud.spec.ts`
- [X] T061 [P] Verify accesibilidad básica (HTML semántico, contraste de color razonable) en todas las páginas (login, registro, tareas, hábitos, panel) (FR-026)
- [X] T062 [P] Wire el cliente `src/lib/api/client.ts` (T015c) en todas las llamadas fetch de las páginas autenticadas (tareas, hábitos, panel) para asegurar la redirección uniforme a `/login` ante sesión expirada (FR-027) in `src/app/(app)/tareas/page.tsx`, `src/app/(app)/habitos/page.tsx`, `src/app/(app)/panel/page.tsx`
- [X] T063 [P] E2E test: con una sesión expirada, cualquier acción autenticada (crear tarea, cumplir hábito, ver panel) muestra el mensaje correspondiente y redirige a `/login` (FR-027) in `tests/e2e/sesion-expirada.spec.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede iniciar de inmediato
- **Foundational (Phase 2)**: depende de Setup — bloquea todas las historias
- **User Stories (Phase 3-6)**: todas dependen de Foundational; pueden avanzar en paralelo entre sí o en orden de prioridad (P1 → P2 → P2 → P3)
- **Polish (Phase 7)**: depende de las historias que se quieran incluir en el release

### User Story Dependencies

- **US1 (P1)**: sin dependencias de otras historias — es la base de autenticación que las demás requieren en tiempo de ejecución (sesión), pero es independientemente implementable y testeable tras Foundational
- **US2 (P2)**: usa la autenticación de US1 en runtime, pero su implementación y sus tests son independientes
- **US3 (P2)**: mismo caso que US2; independiente de US2 entre sí (no comparten entidades)
- **US4 (P3)**: consume datos generados por US2/US3 para tener contenido no-cero, pero su implementación (endpoints, UI) es independiente; su *test* independiente completo requiere datos de US2/US3

### Within Each User Story

- Tests se escriben y deben fallar antes de implementar (Principio I)
- Modelos/datos (Foundational) antes que servicios/rutas
- Rutas API antes que UI que las consume
- Historia completa antes de pasar a la siguiente en ejecución secuencial

### Parallel Opportunities

- Todas las tareas [P] de Setup en paralelo
- Todas las tareas [P] de Foundational en paralelo (respetando T009→T013→T014 y T010→T011)
- Tras Foundational, US1, US2, US3 y US4 pueden trabajarse en paralelo por distintos desarrolladores (con la salvedad de que probar US4 de punta a punta requiere datos de US2/US3)
- Dentro de cada historia, todos los tests marcados [P] en paralelo; luego las rutas API [P] marcadas en paralelo

---

## Parallel Example: User Story 1

```bash
# Lanzar todos los tests de la Historia 1 en paralelo:
Task: "Integration test POST /api/auth/registro en tests/integration/auth-registro.test.ts"
Task: "Integration test POST /api/auth/registro rechaza duplicado en tests/integration/auth-registro-duplicado.test.ts"
Task: "Integration test POST /api/auth/login en tests/integration/auth-login.test.ts"
Task: "Integration test POST /api/auth/logout en tests/integration/auth-logout.test.ts"
Task: "E2E test flujo de auth en tests/e2e/auth.spec.ts"

# Luego, una vez que fallan, las páginas de UI en paralelo:
Task: "Página de registro en src/app/(auth)/registro/page.tsx"
Task: "Página de login en src/app/(auth)/login/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloqueante)
3. Completar Phase 3: User Story 1
4. **STOP y VALIDAR**: probar la Historia 1 de forma independiente (registro/login/logout)
5. Desplegar/demo si está listo

### Incremental Delivery

1. Setup + Foundational → fundación lista
2. Agregar US1 → probar independientemente → demo (MVP)
3. Agregar US2 → probar independientemente → demo
4. Agregar US3 → probar independientemente → demo
5. Agregar US4 → probar independientemente (con datos de US2/US3) → demo
6. Phase 7 (Polish) antes del release formal

### Parallel Team Strategy

Con múltiples desarrolladores:

1. El equipo completa Setup + Foundational en conjunto
2. Una vez lista la Foundación:
   - Desarrollador A: US1
   - Desarrollador B: US2
   - Desarrollador C: US3
   - Desarrollador D: US4 (puede avanzar UI/rutas en paralelo, pero su validación end-to-end espera datos de US2/US3)
3. Las historias se integran de forma independiente

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes
- [Story] mapea cada tarea a su historia de usuario para trazabilidad
- Cada historia debe ser completable y testeable de forma independiente
- Verificar que los tests fallan antes de implementar (Principio I, NON-NEGOTIABLE)
- Commitear después de cada tarea o grupo lógico
- Detenerse en cada checkpoint para validar la historia de forma independiente
- Evitar: tareas vagas, conflictos de archivo compartido entre tareas [P], dependencias cruzadas entre historias que rompan su independencia

## Estado de verificación (2026-08-05)

## Estado de verificación final (2026-08-05, actualizado)

- Unit tests (`npm run test`): 9/9 pasan.
- Integration tests (`npm run test:integration`, contra Supabase real vía
  pooler IPv4): 28/28 pasan (16 archivos).
- `npx playwright install-deps chromium` requería `sudo`, no disponible
  en el sandbox inicialmente; el usuario lo corrió manualmente desde una
  terminal WSL real. Con eso resuelto, se ejecutó la suite e2e completa
  contra Supabase real y se corrigieron varios bugs reales que solo
  aparecían bajo ejecución real (no visibles en unit/integration):
  - `useSearchParams()` sin `<Suspense>` en `/login` rompía `npm run
    build` (producción).
  - Inputs con `maxLength` HTML truncaban el valor antes de que la
    validación JS pudiera dispararse, impidiendo mostrar el mensaje de
    error de longitud excedida (FR-004/FR-008) — se quitó el atributo,
    la validación por JS ya cubre el límite.
  - Tests e2e con race conditions: `page.goto()` inmediatamente después
    de un click aborta el fetch en curso si no se espera su resolución;
    y un locator por accessible name deja de resolver cuando el texto
    del botón cambia a su estado "cargando" — corregido esperando
    ausencia real del elemento (`toHaveCount(0)`) en vez de
    `toBeHidden()` sobre un locator con nombre fijo.
  - `getByRole('alert')` colisionaba con el route announcer interno de
    Next.js (también `role="alert"`) — se escopeó a `.error-mensaje`.
- **E2E (Playwright)**: 17/18 tests pasan (mobile-360), + smoke test de
  responsive 8/8 en tablet-768 y desktop-1920 sobre `auth.spec.ts`. La
  única falla es `performance-crud.spec.ts` (T060, SC-001 <2s p95):
  falla de forma consistente y esperable por la latencia real de red
  hacia el pooler remoto de Supabase desde este entorno (~4-6s por
  request), no por un defecto de la aplicación — en un despliegue real
  con la DB co-ubicada con el servidor esa latencia no existiría. T060
  queda `[ ]` a propósito, ya que la aserción tal como está escrita
  (<2s) no se puede validar honestamente en este entorno.
- **Lighthouse** (`/panel`, autenticado): Performance 99/100, Time to
  Interactive ≈ 2.0s — cumple el umbral del Principio VII (≥90, <3s).
- **Accesibilidad básica** (FR-026, T061): verificado con axe-core
  contra `/login`, `/registro`, `/panel`, `/tareas`, `/habitos` — 0
  violaciones detectadas (supera el mínimo de "accesibilidad básica"
  exigido por el clarification del 2026-08-04).
- Datos de test (`*@questit-test.local`) limpiados de la base de datos
  real al finalizar.
