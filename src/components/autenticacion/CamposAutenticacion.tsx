interface Props {
  modoRegistro: boolean;
  nombre: string;
  correo: string;
  contrasena: string;
  onNombreChange: (valor: string) => void;
  onCorreoChange: (valor: string) => void;
  onContrasenaChange: (valor: string) => void;
}

export default function CamposAutenticacion({
  modoRegistro,
  nombre,
  correo,
  contrasena,
  onNombreChange,
  onCorreoChange,
  onContrasenaChange,
}: Props) {
  return (
    <>
      {modoRegistro && (
        <div>
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre completo"
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            minLength={2}
            maxLength={80}
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="correo">Correo electrónico</label>
        <input
          id="correo"
          type="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={correo}
          onChange={(e) => onCorreoChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="contrasena">Contraseña</label>
        <input
          id="contrasena"
          type="password"
          autoComplete={modoRegistro ? "new-password" : "current-password"}
          placeholder="Mínimo 6 caracteres"
          value={contrasena}
          onChange={(e) => onContrasenaChange(e.target.value)}
          minLength={6}
          required
        />
      </div>
    </>
  );
}
