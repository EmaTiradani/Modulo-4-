---
name: conventional-commit
description: Genera mensajes de commit siguiendo la norma Conventional Commits. Se usa siempre que se va a crear un commit en este repo.
---

# Conventional Commit

Al crear un commit, el mensaje SIEMPRE debe seguir la especificación
[Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[scope opcional]: <descripción>

[cuerpo opcional]

[footer(s) opcional(es)]
```

## Tipos permitidos

- `feat`: nueva funcionalidad para el usuario.
- `fix`: corrección de un bug.
- `docs`: cambios solo en documentación (README, AGENTS.md, PRD, etc.).
- `style`: cambios que no afectan el significado del código (espacios, formato, punto y coma).
- `refactor`: cambio de código que no corrige un bug ni agrega una funcionalidad.
- `perf`: cambio que mejora el rendimiento.
- `test`: agregar o corregir tests.
- `build`: cambios que afectan el sistema de build o dependencias (npm, prisma, etc.).
- `chore`: otros cambios que no modifican src ni tests (configuración, tareas de mantenimiento).
- `revert`: revierte un commit anterior.

## Reglas

- La descripción va en minúscula, en modo imperativo ("agregar", no "agregado" ni "agregando"), sin punto final.
- El ámbito (scope) es opcional y va entre paréntesis, ej: `feat(tareas): agregar filtro por estado`. Usalo cuando el cambio se puede ubicar claramente en un módulo (tareas, hábitos, xp, auth, prd, etc.).
- Un breaking change se marca con `!` después del tipo/ámbito (ej: `feat(xp)!: cambiar fórmula de nivel`) y se explica en el footer con `BREAKING CHANGE: <descripción>`. Esto debe ser excepcional y coherente con lo que diga el PRD — no romper la fórmula de XP/nivel sin que el usuario lo haya pedido explícitamente.
- El cuerpo (si hace falta) explica el *por qué* del cambio, no una lista de archivos tocados.
- Si el commit resuelve un issue o está relacionado a una tarea, se puede referenciar en el footer (ej: `Refs: #12`).
- Nunca mezclar varios tipos de cambio no relacionados en un solo commit; si el diff mezcla cosas, sugerí separarlo en varios commits.

## Paso a paso

1. Ejecutá `git status` y `git diff --staged` (o `git diff` si nada está staged) para entender qué cambió realmente, no lo que se cree que cambió.
2. Elegí el tipo según la naturaleza dominante del cambio.
3. Si el diff toca un módulo identificable del proyecto, agregá el ámbito.
4. Redactá la descripción en una línea, imperativa y concisa, en español (el repo usa español en sus mensajes de commit y documentación).
5. Agregá cuerpo solo si el "por qué" no es obvio con la sola descripción.
6. Mostrale el mensaje propuesto y seguí el flujo normal de creación de commits del proyecto (nunca commitear sin que el usuario lo haya pedido).
