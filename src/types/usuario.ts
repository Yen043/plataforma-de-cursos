export type RolUsuario = 'estudiante' | 'docente' | 'admin';

export type EstadoUsuario = 'activo' | 'inactivo' | 'bloqueado';

export interface Usuario {
  uid: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  fechaCreacion: Date;
}
