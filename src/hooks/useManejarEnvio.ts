import type { FormEvent } from 'react';
import { procesarAutenticacion } from './useProcesarAutenticacion';

interface DatosFormulario {
  modoRegistro: boolean;
  nombre: string;
  correo: string;
  contrasena: string;
  setNombre: (valor: string) => void;
  setCorreo: (valor: string) => void;
  setContrasena: (valor: string) => void;
  setCargando: (valor: boolean) => void;
  setMensaje: (valor: string) => void;
}

export async function manejarEnvio(evento: FormEvent<HTMLFormElement>, datos: DatosFormulario) {
  evento.preventDefault();
  datos.setCargando(true);
  datos.setMensaje('');

  try {
    const resultado = await procesarAutenticacion(datos);
    datos.setMensaje(resultado);

    if (datos.modoRegistro) {
      datos.setNombre('');
      datos.setCorreo('');
    }

    datos.setContrasena('');
  } catch (error) {
    datos.setMensaje(error instanceof Error ? error.message : 'Ocurrió un error.');
  } finally {
    datos.setCargando(false);
  }
}
