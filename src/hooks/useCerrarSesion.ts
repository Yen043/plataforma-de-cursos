import { cerrarSesionCuenta } from '@/services/autenticacion-cliente.service';

export async function cerrarSesion(
  setMensaje: (mensaje: string) => void,
  setCorreo: (correo: string) => void,
  setContrasena: (contrasena: string) => void,
) {
  try {
    await cerrarSesionCuenta();
    setMensaje('Has cerrado sesión.');
    setCorreo('');
    setContrasena('');
  } catch {
    setMensaje('No se pudo cerrar la sesión.');
  }
}
