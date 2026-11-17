import type { FormEvent } from 'react';
import CamposAutenticacion from './CamposAutenticacion';

interface Props {
  modoRegistro: boolean;
  cargando: boolean;
  nombre: string;
  correo: string;
  contrasena: string;
  mensaje: string;
  onNombreChange: (valor: string) => void;
  onCorreoChange: (valor: string) => void;
  onContrasenaChange: (valor: string) => void;
  onSubmit: (evento: FormEvent<HTMLFormElement>) => void;
  onCambiarModo: () => void;
}

export default function FormularioAutenticacion({
  modoRegistro,
  cargando,
  nombre,
  correo,
  contrasena,
  mensaje,
  onNombreChange,
  onCorreoChange,
  onContrasenaChange,
  onSubmit,
  onCambiarModo,
}: Props) {
  return (
    <section>
      <h2>{modoRegistro ? 'Crear una cuenta' : 'Iniciar sesión'}</h2>

      <form onSubmit={onSubmit}>
        <CamposAutenticacion
          modoRegistro={modoRegistro}
          nombre={nombre}
          correo={correo}
          contrasena={contrasena}
          onNombreChange={onNombreChange}
          onCorreoChange={onCorreoChange}
          onContrasenaChange={onContrasenaChange}
        />

        <button className="button" type="submit" disabled={cargando}>
          {cargando ? 'Procesando...' : modoRegistro ? 'Registrarme' : 'Iniciar sesión'}
        </button>
      </form>

      {mensaje && <p id="mensaje-autenticacion" role="status" aria-live="polite">{mensaje}</p>}

      <button className="auth-switch" type="button" disabled={cargando} onClick={onCambiarModo}>
        {modoRegistro ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
      </button>
    </section>
  );
}
