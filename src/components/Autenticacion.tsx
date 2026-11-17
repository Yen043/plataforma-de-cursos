'use client';

import FormularioAutenticacion from './autenticacion/FormularioAutenticacion';
import SesionActiva from './autenticacion/SesionActiva';
import { useAutenticacion } from '@/hooks/useAutenticacion';

export default function Autenticacion() {
  const estado = useAutenticacion();

  if (estado.usuario) {
    return (
      <SesionActiva
        correo={estado.usuario.email}
        mensaje={estado.mensaje}
        onCerrarSesion={estado.manejarCierreSesion}
      />
    );
  }

  return (
    <div className="auth-panel">
    <FormularioAutenticacion
      modoRegistro={estado.modoRegistro}
      cargando={estado.cargando}
      nombre={estado.nombre}
      correo={estado.correo}
      contrasena={estado.contrasena}
      mensaje={estado.mensaje}
      onNombreChange={estado.setNombre}
      onCorreoChange={estado.setCorreo}
      onContrasenaChange={estado.setContrasena}
      onSubmit={estado.manejarEnvio}
      onCambiarModo={() => {
        estado.setModoRegistro(!estado.modoRegistro);
        estado.setMensaje('');
      }}
    />
    </div>
  );
}
