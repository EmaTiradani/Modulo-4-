# QuestIt

App web que centraliza tareas y hábitos, gamificando el progreso del
usuario mediante experiencia (XP), niveles y estadísticas. Ver
`specs/001-questit-core/` para la especificación completa (spec, plan,
modelo de datos, contratos de API y tareas).

## Stack

- Next.js 14 (App Router, TypeScript)
- PostgreSQL 15 + Prisma
- Vitest (unit/integration) + Playwright (e2e)
- npm como gestor de paquetes

## Setup

```bash
npm install
cp .env.example .env   # completar DATABASE_URL, DIRECT_URL y SESSION_SECRET
npx prisma migrate dev
npm run dev
```

La app queda disponible en `http://localhost:3000`.

### Variables de entorno

- `DATABASE_URL`: connection string de PostgreSQL 15 usada por la app en
  runtime. Si el proveedor solo expone conectividad IPv6 en la conexión
  directa (p.ej. Supabase), usar el pooler en modo transacción (puerto
  `6543`, `?pgbouncer=true`).
- `DIRECT_URL`: connection string directa/pooler en modo sesión (puerto
  `5432`), usada únicamente por Prisma Migrate para correr migraciones.
  Si el proveedor sí permite conexión directa por IPv4, puede ser el
  mismo valor que `DATABASE_URL`.
- `SESSION_SECRET`: secreto usado para firmar la cookie de sesión (JWT
  HS256). Debe tener al menos 32 caracteres aleatorios. Nunca se
  commitea `.env` (Principio IV de la constitución del proyecto).

## Tests

```bash
npm run test              # unit tests (no requieren DB)
npm run test:integration  # integration tests contra una DB real (requiere DATABASE_URL)
npm run test:e2e          # e2e con Playwright (levanta el server y usa la DB real)
```

Los tests de integración y e2e requieren `DATABASE_URL` apuntando a una
base de datos PostgreSQL accesible con las migraciones aplicadas. No se
usan mocks de base de datos (Principio III — Fidelidad a la Fuente de
Verdad).

## Migraciones

```bash
npm run prisma:migrate   # aplica migraciones en desarrollo
npm run prisma:generate  # regenera el cliente de Prisma tras cambiar el schema
```

## Estructura

Ver `specs/001-questit-core/plan.md` § Project Structure para el detalle
de carpetas (`src/app`, `src/lib`, `src/components`, `prisma/`,
`tests/{unit,integration,e2e}`).
