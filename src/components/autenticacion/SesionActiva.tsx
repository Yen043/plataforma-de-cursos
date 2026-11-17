import { Catalogo } from '@/components/Plataforma';

interface Props {
  correo: string | null;
  mensaje: string;
  onCerrarSesion: () => void;
}

export default function SesionActiva({ correo, mensaje, onCerrarSesion }: Props) {
  return (
    <section>
      <h2>Bienvenido a la plataforma</h2>
      <p>Correo: {correo}</p>

      {mensaje && <p role="status">{mensaje}</p>}

      <button type="button" onClick={onCerrarSesion}>
        Cerrar sesión
      </button>

      <Catalogo />
    </section>
  );
}
