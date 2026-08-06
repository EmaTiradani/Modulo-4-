-- CreateEnum
CREATE TYPE "Dificultad" AS ENUM ('Facil', 'Media', 'Dificil');

-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('Pendiente', 'Completada');

-- CreateEnum
CREATE TYPE "TipoEventoHistorial" AS ENUM ('TareaCompletada', 'HabitoCumplido');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "xpAcumulada" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "dificultad" "Dificultad" NOT NULL,
    "estado" "EstadoTarea" NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habito" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dificultad" "Dificultad" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroCumplimientoHabito" (
    "id" TEXT NOT NULL,
    "habitoId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegistroCumplimientoHabito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoHistorial" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoEventoHistorial" NOT NULL,
    "tareaId" TEXT,
    "habitoId" TEXT,
    "registroCumplimientoId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpObtenida" INTEGER NOT NULL,

    CONSTRAINT "EventoHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Tarea_usuarioId_idx" ON "Tarea"("usuarioId");

-- CreateIndex
CREATE INDEX "Habito_usuarioId_idx" ON "Habito"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroCumplimientoHabito_habitoId_fecha_key" ON "RegistroCumplimientoHabito"("habitoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "EventoHistorial_registroCumplimientoId_key" ON "EventoHistorial"("registroCumplimientoId");

-- CreateIndex
CREATE INDEX "EventoHistorial_usuarioId_fecha_idx" ON "EventoHistorial"("usuarioId", "fecha");

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habito" ADD CONSTRAINT "Habito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroCumplimientoHabito" ADD CONSTRAINT "RegistroCumplimientoHabito_habitoId_fkey" FOREIGN KEY ("habitoId") REFERENCES "Habito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoHistorial" ADD CONSTRAINT "EventoHistorial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoHistorial" ADD CONSTRAINT "EventoHistorial_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoHistorial" ADD CONSTRAINT "EventoHistorial_habitoId_fkey" FOREIGN KEY ("habitoId") REFERENCES "Habito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoHistorial" ADD CONSTRAINT "EventoHistorial_registroCumplimientoId_fkey" FOREIGN KEY ("registroCumplimientoId") REFERENCES "RegistroCumplimientoHabito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

