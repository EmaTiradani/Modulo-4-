const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(valor: string): string | null {
  if (!EMAIL_REGEX.test(valor)) {
    return 'Ingresá un email con formato válido';
  }
  return null;
}

export function validarPassword(valor: string): string | null {
  if (valor.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  return null;
}

export function validarTitulo(valor: string): string | null {
  if (valor.length < 1 || valor.length > 100) {
    return 'El título es obligatorio y debe tener hasta 100 caracteres';
  }
  return null;
}

export function validarDescripcion(valor: string): string | null {
  if (valor.length > 500) {
    return 'La descripción debe tener hasta 500 caracteres';
  }
  return null;
}

export function validarNombreHabito(valor: string): string | null {
  if (valor.length < 1 || valor.length > 100) {
    return 'El nombre es obligatorio y debe tener hasta 100 caracteres';
  }
  return null;
}
