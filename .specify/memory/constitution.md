<!--
Sync Impact Report
- Version change: 1.1.0 → 2.0.0 (non-negotiable principle redefined)
- Modified principles:
  - I. Test-First (NON-NEGOTIABLE) → I. Cobertura de Tests
    (deja de exigir tests antes de la implementación / ciclo rojo-verde-refactor
    estricto; pasa a exigir cobertura de tests en verde antes de mergear a la
    rama principal, sin imponer el orden de escritura)
- Added sections: none
- Removed sections: none
- Updated sections:
  - Flujo de Desarrollo — la referencia al "ciclo rojo-verde-refactor descrito
    en el Principio I" se reemplaza por una referencia genérica a la exigencia
    de cobertura de tests antes de mergear.
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ no changes needed (Constitution Check gate ya genérico/data-driven, no referencia rojo-verde-refactor)
  - .specify/templates/spec-template.md ✅ no changes needed (sin referencias específicas a orden de tests)
  - .specify/templates/tasks-template.md ✅ no changes needed (los tests ya están marcados como OPTIONAL / a criterio de la feature, consistente con la nueva redacción del Principio I)
  - .specify/templates/commands/*.md ⚠ directory not present in this project — nothing to update
- Follow-up TODOs:
  - Considerar documentar en AGENTS.md una convención de "estructura" (organización
    de carpetas, separación de lógica de negocio y componentes de UI). No se agrega
    como principio de constitution por ser convención de código, no regla no-negociable.
  - Deuda técnica registrada: la reconstrucción de QuestIt Core que motivó este
    cambio de versión se hace código-primero; los tests correspondientes deben
    agregarse antes de mergear a la rama principal, conforme al Principio I
    redefinido.
-->

# QuestIt Constitution

## Core Principles

### I. Cobertura de Tests

Toda funcionalidad nueva o corrección de bug debe contar con tests automatizados
que la cubran antes de mergear a la rama principal. El orden de escritura
(tests antes o después de la implementación) queda a criterio de quien
desarrolla; no se exige el ciclo rojo-verde-refactor de forma estricta. Es
obligatorio que, al momento de mergear, exista una suite de tests en verde que
ejercite el comportamiento nuevo o corregido.

**Rationale**: Mantiene la exigencia de cobertura automatizada sin imponer una
única metodología de desarrollo, dando flexibilidad para reconstrucciones o
prototipado rápido donde escribir tests primero ralentiza la iteración, mientras
preserva la garantía de que ningún cambio llega a la rama principal sin
verificación automatizada.

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

### V. Usabilidad Verificable

Toda pantalla o flujo nuevo debe minimizar los pasos necesarios para completar
su acción principal. Toda acción asíncrona (guardar una tarea, completar un
hábito, etc.) debe mostrar estados de carga y de error visibles para el
usuario. No se aprueba una UI que deje al usuario sin feedback ante una acción
en curso o que haya fallado.

**Rationale**: La falta de feedback visual genera incertidumbre y acciones
duplicadas (el usuario reintenta creyendo que no se ejecutó); exigir estados
explícitos hace la usabilidad verificable en revisión, no subjetiva.

### VI. Responsive Multi-dispositivo

Toda UI nueva debe ser responsive y probarse en los breakpoints mobile,
tablet y desktop antes de mergear. No se aprueban features que solo
funcionen correctamente en un tamaño de pantalla.

**Rationale**: QuestIt se usa en distintos dispositivos a lo largo del día
(móvil, escritorio); una feature que rompe en un breakpoint fragmenta la
experiencia y bloquea el uso real de la app.

### VII. Presupuesto de Performance

Toda página debe cumplir un presupuesto de performance mínimo: Lighthouse
Performance score ≥ 90 y Time to Interactive < 3s en una conexión 4G
simulada. Cualquier cambio que degrade una página por debajo de ese umbral
debe justificarse explícitamente o revertirse.

**Rationale**: La carga lenta es percibida como falta de calidad y afecta
directamente la retención; fijar un umbral numérico evita que la degradación
de performance se acumule de forma invisible a través de PRs sucesivos.

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

- Todo cambio de código cuenta con tests automatizados en verde antes de
  mergear, conforme al Principio I.
- Los pull requests deben verificar cumplimiento de los Principios I–VII y de
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

**Version**: 2.0.0 | **Ratified**: 2026-08-01 | **Last Amended**: 2026-08-06
