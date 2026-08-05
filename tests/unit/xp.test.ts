import { describe, it, expect } from 'vitest';
import { calcularXP, calcularNivel } from '@/lib/xp/calculo';

describe('calcularXP', () => {
  it('Facil otorga 5 XP', () => {
    expect(calcularXP('Facil')).toBe(5);
  });

  it('Media otorga 10 XP', () => {
    expect(calcularXP('Media')).toBe(10);
  });

  it('Dificil otorga 20 XP', () => {
    expect(calcularXP('Dificil')).toBe(20);
  });
});

describe('calcularNivel', () => {
  it('0 XP -> Nivel 1', () => {
    expect(calcularNivel(0)).toBe(1);
  });

  it('99 XP -> Nivel 1', () => {
    expect(calcularNivel(99)).toBe(1);
  });

  it('100 XP -> Nivel 2', () => {
    expect(calcularNivel(100)).toBe(2);
  });

  it('199 XP -> Nivel 2', () => {
    expect(calcularNivel(199)).toBe(2);
  });

  it('200 XP -> Nivel 3', () => {
    expect(calcularNivel(200)).toBe(3);
  });

  it('205 XP -> Nivel 3 (Acceptance Scenario US4.1)', () => {
    expect(calcularNivel(205)).toBe(3);
  });
});
