# Feature Specification: QuestIt Core — Tareas, Hábitos y Progreso Gamificado

**Feature Branch**: `001-questit-core`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Generá el spec a partir del PRD en PRD.md"

## Clarifications

### Session 2026-08-01

- Q: Al eliminar una tarea completada o un hábito que ya otorgó XP, ¿se debe revertir esa XP o conservarla? → A: Conservar la XP ya otorgada; el historial conserva el evento aunque la tarea/hábito ya no exista.
- Q: ¿Cómo debe presentarse el historial de actividad a medida que crece (riesgo de rendimiento señalado en el PRD)? → A: Paginar el historial (carga incremental, ej. de a 20-50 registros).
- Q: Si un usuario edita el mismo ítem (tarea/hábito) desde dos dispositivos casi al mismo tiempo, ¿cómo se resuelve el conflicto? → A: Last-write-wins (el último guardado sobrescribe).

### Session 2026-08-03

- Q: ¿Qué límites de longitud aplican al título/nombre y a la descripción de una tarea o hábito? → A: Título/nombre: 1–100 caracteres (requerido); descripción: opcional, hasta 500 caracteres.
- Q: ¿El sistema inicia sesión automáticamente al completar el registro, o el usuario debe iniciar sesión por separado tras registrarse? → A: Al registrarse, el sistema inicia sesión automáticamente (sin pedir login por separado).
- Q: ¿Qué debe ver el usuario si intenta registrar el cumplimiento de un hábito que ya fue registrado como cumplido en la fecha actual? → A: El sistema muestra un mensaje indicando que el hábito ya fue registrado hoy, sin otorgar XP adicional ni crear un nuevo registro.
- Q: ¿Qué tamaño de bloque debe usarse para la carga incremental del historial de actividad? → A: Bloques de 20 registros por carga.

### Session 2026-08-04

- Q: ¿Qué nivel de accesibilidad debe cumplir QuestIt (navegación por teclado, lectores de pantalla, contraste de color)? → A: Accesibilidad básica (HTML semántico y contraste razonable, sin garantías formales de navegación por teclado ni soporte de lector de pantalla).
- Q: ¿Eliminar una tarea o hábito requiere confirmación antes de borrarlo, o se elimina de inmediato al hacer clic? → A: Con confirmación (diálogo/modal previo a la eliminación).
- Q: ¿Qué debe pasar si la sesión expira mientras el usuario está usando la app (p.ej. a mitad de crear una tarea)? → A: El sistema detecta la sesión expirada en la siguiente acción, muestra un mensaje y redirige a la pantalla de login; los datos no guardados del formulario se pierden.
- Q: Cuando el sistema rechaza editar/eliminar/acceder a datos de otro usuario, ¿qué debe ver el usuario? → A: Un mensaje explícito indicando que no tiene permiso para esa acción.
- Q: ¿Qué rangos de píxeles concretos definen mobile/tablet/desktop para el requisito responsive (360px–1920px)? → A: Mobile 360–767px, tablet 768–1023px, desktop 1024–1920px.
- Q: ¿A qué pantalla lleva el "acceso inmediato" tras el auto-login en el registro? → A: Al panel principal, sin pantallas de verificación de email.
- Q: ¿Qué debe ver el usuario si el título/nombre o la descripción exceden los límites de longitud al guardar? → A: El envío se bloquea y se muestra un mensaje de validación junto al campo correspondiente.
- Q: ¿Qué patrón de UI usa la carga incremental del historial: botón "cargar más" o scroll infinito? → A: Botón "Cargar más", oculto si hay menos de 20 eventos o ya se cargó todo.
- Q: ¿Cuál es el texto exacto del mensaje cuando un hábito ya fue registrado hoy? → A: "Este hábito ya fue registrado hoy".
- Q: ¿Se listan la lista de tareas y de hábitos vacías sin contexto, o con un estado vacío ilustrativo? → A: Estado vacío ilustrativo invitando a crear el primer ítem.
- Q: ¿La validación de email/contraseña en registro/login es a nivel de campo o solo un mensaje general de rechazo? → A: A nivel de campo, antes de enviar el formulario.
- Q: Si falla el guardado de una tarea/hábito, ¿se pierden los datos ya ingresados en el formulario? → A: No, se conservan para reintentar sin volver a escribirlos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registro, inicio y cierre de sesión (Priority: P1)

Un visitante crea una cuenta con email y contraseña, inicia sesión y puede
cerrar sesión cuando lo desee. Sin una cuenta autenticada no existe ningún
dato propio (tareas, hábitos, progreso) que gestionar, por lo que esta es la
base sobre la que se apoya el resto de la aplicación.

**Why this priority**: Es el prerequisito de cualquier otra funcionalidad:
ninguna tarea, hábito o estadística puede asociarse a un usuario sin una
cuenta autenticada, y aislar los datos por usuario es una restricción
central del producto.

**Independent Test**: Puede probarse de forma completa registrando una
cuenta nueva, cerrando sesión, volviendo a iniciar sesión con esas
credenciales y verificando que el acceso a la aplicación se otorga o deniega
correctamente, sin depender de que existan tareas o hábitos.

**Acceptance Scenarios**:

1. **Given** un visitante sin cuenta, **When** completa el formulario de
   registro con un email con formato válido no registrado previamente y una
   contraseña de al menos 8 caracteres, **Then** el sistema crea una nueva
   cuenta e inicia sesión automáticamente, dando acceso inmediato a la
   aplicación sin requerir un inicio de sesión separado.
2. **Given** un usuario registrado, **When** ingresa credenciales válidas,
   **Then** el sistema inicia su sesión y le da acceso a su información.
3. **Given** un usuario autenticado, **When** cierra sesión, **Then** el
   sistema finaliza la sesión y exige volver a autenticarse para acceder a
   sus datos nuevamente.

---

### User Story 2 - Gestión de tareas con recompensa de experiencia (Priority: P2)

Un usuario autenticado crea tareas indicando título, descripción y
dificultad, las edita o elimina según necesite, y las marca como completadas
para recibir la experiencia (XP) correspondiente a su dificultad.

**Why this priority**: Es el núcleo de valor de la aplicación para el caso
de uso más común (organizar tareas) y el mecanismo principal por el cual el
usuario gana experiencia y progresa.

**Independent Test**: Puede probarse de forma completa creando una tarea,
editándola, marcándola como completada y verificando que la experiencia
acumulada del usuario aumenta exactamente en el valor correspondiente a su
dificultad, y finalmente eliminándola.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** crea una tarea indicando
   título, descripción y dificultad, **Then** la tarea aparece en su lista.
2. **Given** una tarea existente del usuario, **When** modifica su
   información y guarda los cambios, **Then** la tarea refleja los datos
   actualizados.
3. **Given** una tarea existente del usuario, **When** la elimina, **Then**
   deja de aparecer en su lista.
4. **Given** una tarea pendiente, **When** el usuario la marca como
   completada, **Then** la tarea cambia al estado "completada".
5. **Given** una tarea con dificultad Media, **When** el usuario la
   completa, **Then** el sistema suma exactamente 10 XP a la experiencia
   acumulada del usuario.
6. **Given** un usuario autenticado, **When** intenta editar o eliminar una
   tarea perteneciente a otro usuario, **Then** el sistema rechaza la
   operación y no realiza ningún cambio.

---

### User Story 3 - Gestión de hábitos con seguimiento diario (Priority: P2)

Un usuario autenticado crea hábitos indicando nombre y dificultad, los edita
o elimina según necesite, y registra su cumplimiento diario para recibir la
experiencia correspondiente a su dificultad.

**Why this priority**: Es el segundo pilar de valor de la aplicación
(desarrollo de hábitos) y comparte el mismo mecanismo de progreso que las
tareas, por lo que tiene la misma prioridad que la Historia 2.

**Independent Test**: Puede probarse de forma completa creando un hábito,
registrando su cumplimiento en el día actual y verificando que la
experiencia acumulada del usuario aumenta en el valor correspondiente,
y finalmente editándolo o eliminándolo.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado, **When** crea un hábito indicando
   nombre y dificultad, **Then** el hábito aparece en su lista.
2. **Given** un hábito existente del usuario, **When** modifica su
   información y guarda los cambios, **Then** el hábito refleja los datos
   actualizados.
3. **Given** un hábito existente del usuario, **When** lo elimina, **Then**
   deja de aparecer en su lista.
4. **Given** un hábito existente del usuario, **When** registra su
   cumplimiento diario, **Then** el sistema almacena un registro asociado a
   la fecha actual y suma la experiencia correspondiente a su dificultad.
5. **Given** un usuario autenticado, **When** intenta editar o eliminar un
   hábito perteneciente a otro usuario, **Then** el sistema rechaza la
   operación y no realiza ningún cambio.

---

### User Story 4 - Panel de progreso, estadísticas e historial (Priority: P3)

Un usuario autenticado accede a un panel principal donde visualiza su
experiencia acumulada, su nivel actual, la cantidad de tareas completadas y
la cantidad de registros de cumplimiento de hábitos, además de un historial
cronológico de su actividad.

**Why this priority**: Ofrece la visibilidad de progreso que motiva al
usuario a largo plazo, pero depende de que ya existan tareas y/o hábitos
completados generados por las Historias 2 y 3, por lo que se prioriza
después de ellas.

**Independent Test**: Puede probarse de forma completa dando de alta un
usuario con XP, nivel, tareas completadas y registros de hábitos conocidos
(vía las Historias 2 y 3), accediendo al panel principal y verificando que
los valores mostrados coinciden con los datos reales, y que el historial
lista la actividad en orden cronológico descendente.

**Acceptance Scenarios**:

1. **Given** un usuario con 205 XP acumulados, **When** el sistema recalcula
   su progreso, **Then** muestra el Nivel 3.
2. **Given** un usuario autenticado, **When** accede al panel principal,
   **Then** visualiza su experiencia acumulada y su nivel actual.
3. **Given** un usuario con tareas completadas, **When** accede al panel
   principal, **Then** visualiza la cantidad total de tareas completadas.
4. **Given** un usuario con registros de cumplimiento diario de hábitos,
   **When** accede al panel principal, **Then** visualiza la cantidad total
   de esos registros.
5. **Given** un usuario autenticado, **When** accede a su historial de
   actividad, **Then** visualiza en orden cronológico descendente las tareas
   completadas y los hábitos cumplidos, incluyendo fecha y XP obtenida en
   cada uno.
6. **Given** un usuario autenticado, **When** consulta su panel, sus tareas,
   hábitos o historial, **Then** el sistema muestra únicamente información
   perteneciente a ese usuario.

---

### Edge Cases

- ¿Qué sucede si un visitante intenta registrarse con un email ya
  utilizado por otra cuenta? El sistema debe rechazar el registro sin crear
  una cuenta duplicada.
- ¿Qué sucede si un usuario intenta iniciar sesión con credenciales
  inválidas? El sistema debe rechazar el acceso sin revelar cuál dato es
  incorrecto.
- ¿Qué sucede si un usuario registra el cumplimiento de un hábito que ya
  fue registrado como cumplido en la fecha actual? El sistema muestra un
  mensaje indicando que el hábito ya fue registrado hoy, sin otorgar
  experiencia adicional ni crear un nuevo registro.
- ¿Qué sucede si un usuario sin tareas ni hábitos accede al panel
  principal? El sistema debe mostrar valores en cero en lugar de un error.
- ¿Qué sucede si un usuario autenticado intenta acceder a la tarea, hábito
  o historial de otro usuario mediante manipulación directa de una
  referencia (por ejemplo, un identificador)? El sistema debe rechazar el
  acceso de la misma forma que rechaza la edición/eliminación, mostrando un
  mensaje explícito de que no tiene permiso para esa acción.
- ¿Qué sucede si un usuario edita el mismo ítem (tarea o hábito) desde dos
  dispositivos casi al mismo tiempo? El sistema aplica last-write-wins: el
  último guardado exitoso sobrescribe cualquier cambio previo sin fusionar
  ambos ni requerir intervención del usuario.
- ¿Qué sucede si la sesión del usuario expira mientras realiza una acción
  (por ejemplo, a mitad de crear una tarea)? El sistema detecta la sesión
  expirada en la siguiente solicitud, muestra un mensaje indicándolo y
  redirige a la pantalla de login; los datos no guardados en el formulario
  en curso se pierden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir a un visitante registrar una cuenta
  con email y contraseña (RF-01), iniciando sesión automáticamente al
  completar el registro, sin requerir un inicio de sesión separado. El
  acceso inmediato tras el registro MUST llevar al usuario directamente al
  panel principal (mismo destino que un login exitoso), sin pantallas
  intermedias de verificación de email.
- **FR-002**: El sistema MUST permitir a un usuario registrado iniciar
  sesión (RF-02).
- **FR-003**: El sistema MUST permitir a un usuario autenticado cerrar
  sesión (RF-03).
- **FR-004**: El sistema MUST permitir crear una tarea indicando título,
  descripción y nivel de dificultad (RF-04). El título es requerido (1–100
  caracteres); la descripción es opcional (hasta 500 caracteres). Si el
  usuario intenta guardar un título vacío, mayor a 100 caracteres, o una
  descripción mayor a 500 caracteres, el sistema MUST bloquear el envío y
  mostrar un mensaje de validación junto al campo correspondiente,
  indicando el límite excedido.
- **FR-005**: El sistema MUST permitir editar una tarea propia (RF-05).
- **FR-006**: El sistema MUST permitir eliminar una tarea propia (RF-06),
  solicitando confirmación explícita del usuario (diálogo/modal) antes de
  ejecutar la eliminación, dado que la acción es irreversible; si la tarea
  ya había sido completada y otorgado XP, esa XP se conserva en la
  experiencia acumulada del usuario y en el historial de actividad.
- **FR-007**: El sistema MUST permitir marcar una tarea propia como
  completada (RF-07).
- **FR-008**: El sistema MUST permitir crear un hábito indicando nombre y
  nivel de dificultad (RF-08). El nombre es requerido (1–100 caracteres).
  Si el usuario intenta guardar un nombre vacío o mayor a 100 caracteres,
  el sistema MUST bloquear el envío y mostrar un mensaje de validación
  junto al campo correspondiente, indicando el límite excedido.
- **FR-009**: El sistema MUST permitir editar un hábito propio (RF-09).
- **FR-010**: El sistema MUST permitir eliminar un hábito propio (RF-10),
  solicitando confirmación explícita del usuario (diálogo/modal) antes de
  ejecutar la eliminación, dado que la acción es irreversible; la XP ya
  otorgada por sus registros de cumplimiento previos se conserva en la
  experiencia acumulada del usuario y en el historial de actividad.
- **FR-011**: El sistema MUST permitir registrar el cumplimiento diario de
  un hábito propio (RF-11).
- **FR-012**: El sistema MUST asignar automáticamente la experiencia
  correspondiente a la dificultad de una tarea o hábito al completarse
  (Fácil 5 XP, Media 10 XP, Difícil 20 XP) (RF-12, RN-03).
- **FR-013**: El sistema MUST calcular el nivel del usuario a partir de su
  experiencia acumulada mediante la fórmula Nivel = ⌊XP / 100⌋ + 1 (RF-13,
  RN-05).
- **FR-014**: El sistema MUST mostrar al usuario autenticado su experiencia
  acumulada (RF-14).
- **FR-015**: El sistema MUST mostrar al usuario autenticado su nivel
  actual (RF-15).
- **FR-016**: El sistema MUST mostrar al usuario autenticado la cantidad de
  tareas completadas (RF-16).
- **FR-017**: El sistema MUST mostrar al usuario autenticado la cantidad
  total de registros de cumplimiento diario de hábitos (RF-17).
- **FR-018**: El sistema MUST restringir toda consulta de tareas, hábitos,
  experiencia, nivel e historial a la información del usuario autenticado
  (RF-18, RN de aislamiento).
- **FR-019**: El sistema MUST persistir de forma duradera las cuentas de
  usuario, sus tareas, sus hábitos, su experiencia acumulada y su nivel
  actual, de modo que se recuperen íntegramente al volver a iniciar sesión
  (RF-19 a RF-23).
- **FR-020**: El sistema MUST permitir visualizar un historial cronológico
  (orden descendente) de las tareas completadas y los hábitos cumplidos por
  el usuario autenticado, incluyendo fecha y XP obtenida en cada evento
  (RF-24). El historial MUST paginarse o cargarse de forma incremental,
  en bloques de 20 registros, para sostener los tiempos de carga objetivo
  a medida que crece. La carga incremental se presenta mediante un botón
  "Cargar más" (no scroll infinito); el botón MUST ocultarse cuando el
  usuario tiene menos de 20 eventos en total o ya cargó todo su historial.
- **FR-021**: El sistema MUST rechazar sin aplicar cambios cualquier intento
  de editar o eliminar una tarea o hábito que no pertenezca al usuario
  autenticado, mostrando un mensaje explícito indicando que no tiene
  permiso para esa acción.
- **FR-022**: El sistema MUST rechazar el registro de una cuenta con un
  email ya utilizado por otra cuenta existente.
- **FR-023**: El sistema MUST impedir que un mismo hábito otorgue
  experiencia más de una vez por fecha de cumplimiento, mostrando al
  usuario el mensaje "Este hábito ya fue registrado hoy" en lugar de
  fallar silenciosamente o crear un registro duplicado (RN-06).
- **FR-024**: El sistema MUST impedir que una tarea ya completada otorgue
  experiencia adicional al recibir una nueva solicitud de completar la
  misma tarea (RN-07).
- **FR-025**: El sistema MUST mostrar un estado de carga visible durante
  toda acción asíncrona (crear, editar, eliminar o completar una tarea;
  crear, editar, eliminar o registrar el cumplimiento de un hábito;
  registro, inicio o cierre de sesión) y un mensaje de error visible al
  usuario si la acción falla, de modo que nunca quede sin feedback sobre
  una acción en curso o fallida.
- **FR-026**: El sistema MUST usar HTML semántico y mantener un contraste
  de color razonable en su interfaz (accesibilidad básica); no se exige
  navegación completa por teclado ni soporte formal de lector de pantalla
  en esta versión.
- **FR-027**: El sistema MUST detectar una sesión expirada al ejecutar
  cualquier acción autenticada, mostrar un mensaje indicándolo y redirigir
  al usuario a la pantalla de login, aceptando que los datos no guardados
  del formulario en curso se pierdan.
- **FR-028**: El sistema MUST mostrar un estado vacío ilustrativo (mensaje
  invitando a crear el primer ítem) en la lista de tareas y en la lista de
  hábitos cuando el usuario autenticado aún no tiene ninguno, en lugar de
  una lista en blanco sin contexto.
- **FR-029**: El sistema MUST validar a nivel de campo, antes de enviar el
  formulario, el email (formato válido) y la contraseña (mínimo 8
  caracteres) en los formularios de registro e inicio de sesión, mostrando
  el mensaje de error junto al campo correspondiente.
- **FR-030**: Si una acción de guardado (crear/editar tarea o hábito)
  falla, el sistema MUST conservar los datos ya ingresados en el
  formulario para que el usuario pueda reintentar sin volver a escribirlos.

### Key Entities

- **Usuario**: cuenta de una persona que usa QuestIt; incluye email,
  contraseña, experiencia acumulada y nivel actual. Es dueño exclusivo de
  sus tareas, hábitos y registros de actividad.
- **Tarea**: unidad de trabajo puntual creada por un usuario; incluye
  título, descripción, nivel de dificultad y estado (pendiente/completada).
  Al completarse genera un evento de experiencia.
- **Hábito**: actividad recurrente creada por un usuario; incluye nombre y
  nivel de dificultad. No tiene un estado único sino una serie de registros
  de cumplimiento en el tiempo.
- **Registro de Cumplimiento de Hábito**: evento que asocia un hábito con
  una fecha en la que fue cumplido; genera un evento de experiencia y es la
  base para contar cumplimientos totales.
- **Evento de Historial**: entrada cronológica (derivada de una tarea
  completada o un registro de cumplimiento de hábito) que muestra fecha y
  XP obtenida, usada para construir el historial de actividad del usuario.
  Persiste de forma independiente a la tarea o hábito de origen: si estos
  se eliminan, el evento de historial y la XP que otorgó permanecen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden crear, editar o eliminar una tarea o un
  hábito en menos de 2 segundos (p95), medido desde que confirman la
  acción hasta que el estado de carga visible (FR-025) desaparece y el
  cambio se refleja en la interfaz.
- **SC-002**: El panel principal carga en menos de 3 segundos (p95).
- **SC-003**: El 100% de los cambios confirmados por el usuario
  (creación, edición, eliminación, finalización) se conservan tras cerrar
  sesión y volver a iniciar sesión.
- **SC-004**: La interfaz permite ejecutar sin restricciones, en anchos de
  pantalla entre 360px y 1920px, todas las acciones descritas en las
  Historias de Usuario 1 a 4 (registro/login/logout; crear, editar,
  eliminar y completar tareas; crear, editar, eliminar y registrar
  cumplimiento de hábitos; navegar el panel y el historial). Los
  breakpoints responsive son: mobile 360–767px, tablet 768–1023px y
  desktop 1024–1920px.
- **SC-005**: Un usuario nuevo puede registrarse, crear su primera tarea o
  hábito y completarla, viendo reflejado el aumento de XP, en menos de 5
  minutos desde que llega a la aplicación, siguiendo únicamente los pasos
  descritos en los Acceptance Scenarios de las Historias 1 a 3 (sin pasos
  adicionales no documentados).
- **SC-006**: El 100% de los intentos de acceder, editar o eliminar datos
  de otro usuario son rechazados sin excepción.

## Assumptions

- El método de autenticación es email y contraseña; no se requieren
  proveedores externos (SSO/OAuth) en esta versión.
- Las políticas específicas de seguridad de contraseñas (algoritmo de
  hashing, requisitos de complejidad más allá de 8 caracteres mínimos) y de
  expiración/renovación de sesión quedan fuera de esta especificación,
  según lo indicado en el PRD, y se resolverán como decisiones técnicas en
  la fase de planificación.
- Un hábito solo puede otorgar experiencia una vez por fecha de
  cumplimiento; registrar el cumplimiento de un hábito ya cumplido en el
  mismo día no genera un registro ni XP adicional.
- Las tareas completadas pueden seguir editándose o eliminándose por su
  dueño; no existe una acción de "reabrir" una tarea completada en el
  alcance de esta versión.
- No se requiere verificación de email (confirmación por correo) para
  activar una cuenta nueva.
- Quedan fuera de alcance (según el PRD): logros, calendarios externos, app
  móvil nativa, sincronización con terceros, funcionalidades colaborativas,
  recomendaciones por IA y notificaciones automáticas.
- No se implementa resolución de conflictos por fusión ni bloqueo optimista
  para ediciones concurrentes del mismo ítem desde múltiples dispositivos;
  se acepta la pérdida silenciosa del cambio más antiguo bajo la política
  last-write-wins.
