import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children, roles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth0();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // TODO: Implementar verificación de roles cuando Auth0 esté configurado
  // const userRoles = user?.[`https://fincas-trimar.com/roles`] || [];
  // const hasRequiredRole = roles.some(role => userRoles.includes(role));
  
  // if (roles.length > 0 && !hasRequiredRole) {
  //   return <Navigate to="/" replace />;
  // }
  
  return children;
}