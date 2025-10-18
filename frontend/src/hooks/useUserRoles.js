import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';

/**
 * Hook para obtener y verificar roles del usuario
 * @returns {Object} Objeto con roles y métodos de verificación
 */
export const useUserRoles = () => {
  const { user } = useAuth0();

  const roles = useMemo(() => {
    if (!user) return [];
    
    // Intentar obtener roles de diferentes ubicaciones
    return (
      user[`${import.meta.env.VITE_AUTH0_AUDIENCE}/roles`] ||
      user['https://fincas-trimar.com/roles'] ||
      user.roles ||
      user.permissions ||
      []
    );
  }, [user]);

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean}
   */
  const hasRole = (role) => roles.includes(role);
  
  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param {Array<string>} requiredRoles - Array de roles a verificar
   * @returns {boolean}
   */
  const hasAnyRole = (requiredRoles) => 
    requiredRoles.some(role => roles.includes(role));

  /**
   * Verifica si el usuario tiene todos los roles especificados
   * @param {Array<string>} requiredRoles - Array de roles a verificar
   * @returns {boolean}
   */
  const hasAllRoles = (requiredRoles) =>
    requiredRoles.every(role => roles.includes(role));

  // Shortcuts para roles comunes
  const isAdmin = hasRole('Admin');
  const isSeller = hasRole('Seller') || isAdmin;
  const isCaptador = hasRole('Captador') || isSeller;
  const isUser = hasRole('User') || isCaptador;

  return {
    roles,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin,
    isSeller,
    isCaptador,
    isUser
  };
};

export default useUserRoles;
