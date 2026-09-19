export function mensajeDeError(err: unknown, respaldo: string): string {
  const datos = (err as { response?: { data?: unknown } })?.response?.data;

  if (!datos) return respaldo;
  if (typeof datos === 'string') return datos;

  const cuerpo = datos as Record<string, unknown>;

  if (typeof cuerpo.detail === 'string') return cuerpo.detail;

  const porCampo = Object.entries(cuerpo)
    .filter(([clave]) => clave !== 'code' && clave !== 'codigo')
    .map(([clave, valor]) => {
      const texto = Array.isArray(valor) ? valor.join(' ') : String(valor);
      return clave === 'non_field_errors' ? texto : `${etiqueta(clave)}: ${texto}`;
    });

  return porCampo.length ? porCampo.join('\n') : respaldo;
}

const ETIQUETAS: Record<string, string> = {
  email: 'Correo',
  password: 'Contraseña',
  password_nueva: 'Contraseña nueva',
  nombre: 'Nombre',
  apellido: 'Apellido',
  telefono: 'Teléfono',
  rol: 'Rol',
  activo: 'Estado',
  codigo: 'Código',
};

function etiqueta(clave: string): string {
  return ETIQUETAS[clave] ?? clave;
}
