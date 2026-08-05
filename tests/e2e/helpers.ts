let contador = 0;

export function emailUnico(): string {
  contador += 1;
  return `e2e-${Date.now()}-${contador}@questit-test.local`;
}

export const PASSWORD_VALIDA = 'password123';
