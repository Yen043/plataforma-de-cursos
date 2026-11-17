import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';

import { getClientAuth } from '@/lib/firebase';
import { useAccionesAutenticacion } from './useAccionesAutenticacion';

export function useAutenticacion() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const acciones = useAccionesAutenticacion();

  useEffect(() => {
    try { return onAuthStateChanged(getClientAuth(), setUsuario); }
    catch { return; }
  }, []);

  return {
    usuario,
    ...acciones,
  };
}
