# AGENTS.md

## Propósito

QuestIt es una app web que centraliza tareas y hábitos, gamificando el progreso del usuario mediante experiencia (XP), niveles y estadísticas.

## Stack

- Next.js 14 (Node 18 LTS)
- PostgreSQL 15
- Prisma como ORM
- npm como gestor de paquetes

## Cómo correr

```bash
npm install
npx prisma migrate dev
npm run dev
```

Tests: aún no definidos.

## Qué NO hacer

- No implementar nada listado como Fuera de Alcance en el PRD: logros, calendarios externos, app móvil nativa, sincronización con terceros, funcionalidades colaborativas, recomendaciones por IA, notificaciones automáticas.
- No cambiar los valores de XP por dificultad (Fácil 5, Media 10, Difícil 20) ni la fórmula de nivel (`Nivel = ⌊XP / 100⌋ + 1`) sin actualizar el PRD.
- No exponer tareas, hábitos ni estadísticas de un usuario a otro usuario (cada consulta debe filtrar por el usuario autenticado).
