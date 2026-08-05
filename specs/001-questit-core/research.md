# Phase 0 Research: QuestIt Core

## Stack de testing (Next.js 14 + Prisma + PostgreSQL)

**Decision**: Vitest para unit/integration tests (lógica de negocio en
`src/lib/xp/`, y rutas API contra una base de datos de test real vía
Prisma) + Playwright para tests end-to-end de los flujos críticos
(registro→login→crear tarea→completar→ver XP en panel).

**Rationale**: Vitest se integra nativamente con TypeScript/ESM y el
tooling de Next.js sin configuración adicional pesada, y es
significativamente más rápido que Jest para el ciclo rojo-verde-refactor
exigido por el Principio I. Playwright cubre los flujos multi-página
(auth → CRUD → panel) que Vitest no puede probar de forma realista, y
soporta pruebas contra distintos breakpoints (360px–1920px) requeridas
por el Principio VI. Para integration tests contra Prisma se usa una base
de datos PostgreSQL de test aislada (no mocks), consistente con el
Principio III (fidelidad a la fuente de verdad) y evitando falsos
positivos por mocks desalineados con el esquema real.

**Alternatives considered**:
- **Jest + React Testing Library**: opción por defecto histórica de
  Next.js; descartada por mayor tiempo de arranque/observabilidad de
  fallos más lenta en proyectos ESM/TypeScript comparado con Vitest,
  aunque sigue siendo válida si el equipo ya tiene experiencia previa con
  Jest.
- **Cypress** (en vez de Playwright) para e2e: descartado por soporte
  multi-navegador más limitado y mayor curva de configuración para
  pruebas de responsive en múltiples viewports simultáneas.
- **Mocks de Prisma/DB en integration tests**: descartado por violar el
  Principio III y el riesgo de que un mock desincronizado oculte errores
  reales de aislamiento por usuario (RF-018), que es la restricción de
  seguridad más crítica del producto.

## Autenticación por email/contraseña

**Decision**: Hashing de contraseñas con bcrypt (o argon2 como
alternativa equivalente); sesión de usuario mediante cookie HTTP-only
firmada (JWT de sesión o token opaco + tabla de sesiones), sin proveedor
externo (SSO/OAuth), consistente con la Assumption ya documentada en
spec.md.

**Rationale**: bcrypt/argon2 son el estándar de facto para hashing de
contraseñas en Node.js y evitan almacenar contraseñas en texto plano o
con algoritmos débiles, sin necesitar un servicio externo. Una cookie
HTTP-only evita exposición del token de sesión a JavaScript en cliente
(mitiga XSS), cumpliendo el Principio IV (sin secretos hardcodeados: el
secreto de firma vive en variable de entorno) sin introducir un
proveedor de identidad de terceros que el PRD no contempla.

**Alternatives considered**:
- **NextAuth/Auth.js**: viable y reduce código propio, pero añade
  superficie de configuración (providers, adapters) mayor a lo que
  requiere un único método email/contraseña; se deja como alternativa a
  reconsiderar si la complejidad manual de sesiones crece en
  implementación.
- **JWT sin persistencia de sesión server-side**: descartado como único
  mecanismo porque dificulta invalidar sesiones al cerrar sesión
  (FR-003) sin lista de revocación adicional.

## Cálculo de XP y nivel

**Decision**: Módulo puro en `src/lib/xp/` con funciones
`calcularXP(dificultad)` y `calcularNivel(xpAcumulada)`, sin acceso a
base de datos ni a red, invocado por las rutas API que completan tareas o
registran cumplimientos de hábitos dentro de una misma transacción de
Prisma (suma de XP + inserción del Evento de Historial son atómicas).

**Rationale**: Aislar el cálculo como función pura permite testearlo
exhaustivamente sin DB (Principio I) y evita que la fórmula de XP/nivel
(fija por constitución) se duplique o diverja entre distintos puntos de
la aplicación. La atomicidad transaccional evita estados inconsistentes
(XP sumada sin Evento de Historial, o viceversa) ante fallos parciales.

**Alternatives considered**:
- **Cálculo de nivel derivado en cada lectura (sin columna persistida)**:
  se adopta como parte de esta decisión — el nivel no necesita
  persistirse por separado si XP sí se persiste, ya que se deriva
  determinísticamente; se documenta en data-model.md. Se descarta
  persistir un campo `nivel` redundante para evitar desincronización.

## Paginación del historial

**Decision**: Paginación basada en cursor (keyset pagination) sobre
`EventoHistorial`, ordenado por fecha descendente, en bloques de 20
registros (FR-020), usando el id o timestamp del último evento cargado
como cursor.

**Rationale**: La paginación por cursor evita los problemas de
rendimiento y de saltos/duplicados de la paginación por offset a medida
que el historial crece (riesgo señalado explícitamente en el PRD), y es
compatible con índices simples sobre `(usuarioId, fecha)`.

**Alternatives considered**:
- **Paginación por offset (`LIMIT/OFFSET`)**: descartada por degradar en
  rendimiento con tablas grandes y por el riesgo de resultados
  inconsistentes si se insertan nuevos eventos mientras el usuario pagina.
