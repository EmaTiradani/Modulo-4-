export type Dificultad = 'Facil' | 'Media' | 'Dificil';

const XP_POR_DIFICULTAD: Record<Dificultad, number> = {
  Facil: 5,
  Media: 10,
  Dificil: 20,
};

export function calcularXP(dificultad: Dificultad): number {
  return XP_POR_DIFICULTAD[dificultad];
}

export function calcularNivel(xpAcumulada: number): number {
  return Math.floor(xpAcumulada / 100) + 1;
}
