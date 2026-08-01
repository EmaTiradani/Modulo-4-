<!--
Sync Impact Report
- Version change: TEMPLATE → 1.0.0 (initial ratification)
- Modified principles: n/a (first concrete set of principles)
- Added sections:
  - Core Principles: I. Test-First (TDD), II. Aislamiento de la Lógica de IA,
    III. Fidelidad a la Fuente de Verdad, IV. Sin Secretos Hardcodeados
  - Restricciones del Producto (QuestIt) — alcance, fórmulas de XP/nivel, aislamiento de datos por usuario
  - Flujo de Desarrollo — ciclo rojo-verde-refactor, revisión de PRs
  - Governance
- Removed sections: none (template placeholders replaced)
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (Constitution Check gate already generic/data-driven)
  - .specify/templates/spec-template.md ✅ no changes needed (no principle-specific references)
  - .specify/templates/tasks-template.md ✅ no changes needed (test-first ordering already supported by template structure)
  - .specify/templates/commands/*.md ⚠ directory not present in this project — nothing to update
- Follow-up TODOs: none
-->

# QuestIt Constitution

## Core Principles

### I. Test-First (NON-NEGOTIABLE)

Los tests se escriben antes que la implementación. El ciclo de desarrollo es
estrictamente rojo-verde-refactor: (1) escribir un test que falle para el
comportamiento deseado, (2) escribir el código mínimo para que pase, (3)
refactorizar manteniendo los tests en verde. Ninguna funcionalidad nueva ni
corrección de bug se integra sin un test previo que la cubra y que haya fallado
antes de la implementación.

**Rationale**: Garantiza que el comportamiento esperado quede especificado de
forma ejecutable antes de escribir código, reduce regresiones y evita que la
implementación defina el contrato en lugar de la especificación.

### II. Aislamiento de la Lógica de IA

Toda la lógica de llamadas a modelos de IA (prompts, clientes de API, parsing
de respuestas, manejo de reintentos) vive en un módulo dedicado y aislado.
Este módulo nunca se mezcla con la lógica de negocio (cálculo de XP, niveles,
persistencia de tareas/hábitos, etc.). La lógica de negocio solo interactúa
con la IA a través de una interfaz explícita del módulo dedicado.

**Rationale**: Permite testear la lógica de negocio sin depender de un modelo
de IA real, facilita reemplazar o mockear el proveedor de IA, y evita que
comportamientos no determinísticos del modelo contaminen reglas de negocio
que deben ser predecibles y auditables.

### III. Fidelidad a la Fuente de Verdad

El sistema nunca inventa datos que no estén presentes en su fuente de verdad
(base de datos, respuesta de API, input del usuario). Ante cualquier duda o
ambigüedad sobre un dato faltante o inconsistente, el sistema deriva a
revisión humana en lugar de generar, inferir o completar el dato de forma
autónoma.

**Rationale**: Evita alucinaciones de datos que puedan corromper el progreso,
las estadísticas o la confianza del usuario en la app; prioriza la
correctitud sobre la conveniencia.

### IV. Sin Secretos Hardcodeados

Ninguna clave de API, credencial, token o secreto se escribe directamente en
el código fuente. Todo secreto se obtiene mediante variables de entorno o un
mecanismo de gestión de secretos, y los archivos que los contienen (`.env` y
similares) nunca se commitean al repositorio.

**Rationale**: Evita fugas de credenciales en el historial de git y en
repositorios públicos o compartidos, y facilita rotar secretos sin tocar
código.

## Restricciones del Producto (QuestIt)

- No se implementa nada listado como Fuera de Alcance en el PRD: logros,
  calendarios externos, app móvil nativa, sincronización con terceros,
  funcionalidades colaborativas, recomendaciones por IA, notificaciones
  automáticas.
- Los valores de XP por dificultad (Fácil 5, Media 10, Difícil 20) y la
  fórmula de nivel (`Nivel = ⌊XP / 100⌋ + 1`) son fijos; cualquier cambio
  requiere actualizar el PRD primero.
- Ninguna consulta expone tareas, hábitos ni estadísticas de un usuario a
  otro usuario: toda consulta a datos filtra por el usuario autenticado.

## Flujo de Desarrollo

- Todo cambio de código sigue el ciclo rojo-verde-refactor descrito en el
  Principio I antes de mergear.
- Los pull requests deben verificar cumplimiento de los Principios I–IV y de
  las Restricciones del Producto antes de aprobarse.
- Cualquier violación de un principio debe justificarse explícitamente en la
  descripción del PR o en el plan de la feature (sección de Complexity
  Tracking en `plan.md`); si no hay justificación válida, se simplifica el
  diseño en su lugar.

## Governance

Esta constitución tiene precedencia sobre cualquier otra práctica, guía o
convención del proyecto, incluyendo AGENTS.md, en caso de conflicto.

- **Enmiendas**: cualquier cambio a esta constitución debe documentarse en
  este archivo, incluir el Sync Impact Report correspondiente, y propagarse a
  los templates y documentación dependientes (`plan-template.md`,
  `spec-template.md`, `tasks-template.md`, AGENTS.md/CLAUDE.md) cuando
  corresponda.
- **Versionado**: se usa versionado semántico (MAJOR.MINOR.PATCH):
  - MAJOR: eliminación o redefinición incompatible de un principio o regla de
    gobernanza.
  - MINOR: adición de un nuevo principio o expansión material de una guía
    existente.
  - PATCH: aclaraciones, correcciones de redacción o refinamientos no
    semánticos.
- **Cumplimiento**: toda revisión de código y todo plan de feature deben
  verificar el cumplimiento de esta constitución. La complejidad injustificada
  debe simplificarse antes de aprobar.

**Version**: 1.0.0 | **Ratified**: 2026-08-01 | **Last Amended**: 2026-08-01
