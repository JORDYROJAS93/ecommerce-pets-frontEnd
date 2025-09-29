
// Primero, definimos el tipo para el estado
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  estado: EstadoUsuario;
  creadoEn: string;
  actualizadoEn: string;
  roles: { id: number; nombre: string }[];
}
