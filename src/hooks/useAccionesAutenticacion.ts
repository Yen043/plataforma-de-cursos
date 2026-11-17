import type { FormEvent } from 'react';
import { useState } from 'react';
import { cerrarSesion } from './useCerrarSesion';
import { manejarEnvio as procesarEnvio } from './useManejarEnvio';

export function useAccionesAutenticacion() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const manejarEnvio = (evento: FormEvent<HTMLFormElement>) =>
    procesarEnvio(evento, {
      modoRegistro,
      nombre,
      correo,
      contrasena,
      setNombre,
      setCorreo,
      setContrasena,
      setCargando,
      setMensaje,
    });

  const manejarCierreSesion = () => cerrarSesion(setMensaje, setCorreo, setContrasena);

  return {
    nombre,
    correo,
    contrasena,
    modoRegistro,
    cargando,
    mensaje,
    setNombre,
    setCorreo,
    setContrasena,
    setModoRegistro,
    setMensaje,
    manejarEnvio,
    manejarCierreSesion,
  };
}
