import { useAuth0 } from '@auth0/auth0-react';

export default function Admin() {
  const { user } = useAuth0();
  
  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Panel de Administración</h1>
      <p>Bienvenido, {user?.name}</p>
      <p>Página en construcción - Panel de administración para gestionar viviendas y mensajes.</p>
    </div>
  );
}