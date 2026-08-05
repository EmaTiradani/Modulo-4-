# Implementation Plan: QuestIt Core — Tareas, Hábitos y Progreso Gamificado

**Branch**: `001-questit-core` | **Date**: 2026-08-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-questit-core/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

QuestIt Core permite a un usuario registrarse/iniciar sesión, gestionar
tareas y hábitos propios, y ver su progreso (XP, nivel, contadores e
historial paginado) — todo aislado por usuario autenticado. Se implementa
como una aplicación web Next.js 14 (App Router) con API routes propias
como backend, Prisma como ORM sobre PostgreSQL 15, y autenticación por
email/contraseña con sesión basada en cookies. El cálculo de XP y nivel es
lógica de negocio pura y determinística (sin IA), ejecutada en el servidor
al completar una tarea o registrar el cumplimiento de un hábito.

## Technical Context

**Language/Version**: TypeScript sobre Node.js 18 LTS (Next.js 14, App
Router)

**Primary Dependencies**: Next.js 14, Prisma ORM, cliente `pg` (vía
Prisma), librería de hashing de contraseñas (bcrypt o equivalente),
librería de manejo de sesión (cookies firmadas / JWT de sesión)

**Storage**: PostgreSQL 15 (vía Prisma), tablas para Usuario, Tarea,
Hábito, RegistroCumplimientoHábito y EventoHistorial

**Testing**: Vitest (unit/integration, incl. tests de integración contra
una base de datos PostgreSQL de test real vía Prisma) + Playwright (e2e
de los flujos críticos y de responsive) — decisión registrada en
research.md, resolviendo el vacío señalado en AGENTS.md ("tests aún no
definidos") para cumplir el Principio I (Test-First, NON-NEGOTIABLE).

**Target Platform**: Web (navegador), anchos de pantalla 360px–1920px
(mobile, tablet, desktop) por el Principio VI

**Project Type**: Aplicación web single-project (Next.js con API routes
integradas; no hay frontend/backend separados como proyectos distintos)

**Performance Goals**: Crear/editar/eliminar tarea o hábito < 2s (p95);
carga del panel principal < 3s (p95); Lighthouse Performance ≥ 90 y Time
to Interactive < 3s en 4G simulada (Principio VII, SC-001, SC-002)

**Constraints**: Aislamiento estricto de datos por usuario autenticado en
toda consulta (FR-018); XP fijo por dificultad (Fácil 5, Media 10, Difícil
20) y fórmula de nivel `⌊XP/100⌋ + 1` no modificables sin actualizar el
PRD; historial paginado en bloques de 20 registros (FR-020); responsive
360px–1920px (Principio VI); estados de carga/error visibles en toda
acción asíncrona (Principio V); sin secretos hardcodeados (Principio IV)

**Scale/Scope**: Aplicación multiusuario de uso individual (no
colaborativa); 4 historias de usuario (auth, tareas, hábitos, panel/
historial); sin volumen de usuarios objetivo definido en el PRD — se
diseña para historial creciente por usuario con paginación desde el
inicio

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|---|---|
| I. Test-First (NON-NEGOTIABLE) | PASS — stack de testing definido en research.md (Vitest + Playwright, DB de test real sin mocks). Todas las tareas de `/speckit-tasks` deberán seguir rojo-verde-refactor. |
| II. Aislamiento de la Lógica de IA | N/A — esta feature no invoca modelos de IA (explícitamente fuera de alcance: recomendaciones por IA). No se requiere módulo de IA. |
| III. Fidelidad a la Fuente de Verdad | PASS — XP, nivel e historial se derivan siempre de la base de datos; ninguna cifra se infiere o genera fuera de las reglas de negocio fijas (RN-03/RN-05). |
| IV. Sin Secretos Hardcodeados | PASS (a verificar en implementación) — credenciales de DB y secreto de sesión vía variables de entorno, `.env` no commiteado. |
| V. Usabilidad Verificable | PASS (a verificar en implementación) — plan exige estados de carga/error en cada acción asíncrona (crear/editar/eliminar tarea u hábito, completar, registrar cumplimiento, login/registro). |
| VI. Responsive Multi-dispositivo | PASS (a verificar en implementación) — Target Platform fija el rango 360px–1920px como requisito de diseño. |
| VII. Presupuesto de Performance | PASS (a verificar en implementación) — Performance Goals fija Lighthouse ≥90 y TTI <3s como criterio de aceptación técnico. |

No hay violaciones que requieran justificación en Complexity Tracking;
el único punto abierto (Test-First) se resuelve en Phase 0, no es una
violación sino una decisión pendiente de investigación técnica.

## Project Structure

### Documentation (this feature)

```text
specs/001-questit-core/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
prisma/
└── schema.prisma        # Modelo de datos: Usuario, Tarea, Hábito,
                          # RegistroCumplimientoHábito, EventoHistorial

src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── registro/
│   ├── (app)/
│   │   ├── panel/            # Historia 4: XP, nivel, contadores, historial
│   │   ├── tareas/           # Historia 2
│   │   └── habitos/          # Historia 3
│   └── api/
│       ├── auth/
│       ├── tareas/
│       ├── habitos/
│       └── historial/
├── lib/
│   ├── auth/                 # sesión, hashing de contraseña
│   ├── xp/                   # cálculo de XP y nivel (lógica de negocio pura)
│   └── db/                   # cliente Prisma
└── components/

tests/
├── unit/                     # lógica de negocio (XP, nivel, validaciones)
├── integration/               # API routes + DB (aislamiento por usuario, etc.)
└── e2e/                       # flujos completos (registro→tarea→XP)
```

**Structure Decision**: Aplicación web single-project con Next.js App
Router. Frontend (páginas/componentes) y backend (API routes) conviven en
el mismo proyecto Next.js, sin separación en paquetes `frontend/`/
`backend/`, ya que ambos comparten runtime Node.js y no hay necesidad de
desplegarlos por separado. La lógica de cálculo de XP/nivel se aísla en
`src/lib/xp/` como módulo puro y testeable, separado de las rutas API que
la invocan, para cumplir el Principio I (Test-First) y facilitar pruebas
unitarias sin base de datos real.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Ninguna violación registrada.
