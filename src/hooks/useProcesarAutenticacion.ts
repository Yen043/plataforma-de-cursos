import { registrarCuenta, iniciarSesionCuenta } from '@/services/autenticacion-cliente.service';

interface DatosAutenticacion {
  modoRegistro: boolean;
  nombre: string;
  correo: string;
  contrasena: string;
}

export async function procesarAutenticacion({
  modoRegistro,
  nombre,
  correo,
  contrasena,
}: DatosAutenticacion): Promise<string> {
  if (modoRegistro) {
    await registrarCuenta(nombre, correo, contrasena);
    return '¡Registro completado correctamente!';
  }

  const estado = await iniciarSesionCuenta(correo, contrasena);

  return estado === 'existente'
    ? '¡Has iniciado sesión! Tu perfil ya estaba registrado.'
    : '¡Inicio de sesión correcto y perfil guardado!';
}
