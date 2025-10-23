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
      user['https://otp-records.com/roles'] || // Namespace actual de Auth0
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

  // Shortcuts para roles comunes con los nombres correctos de Auth0
  const isAdmin = hasRole('AdminTrimar');
  const isSeller = hasRole('SellerTrimar') || isAdmin;
  const isCaptador = hasRole('CaptadorTrimar') || isSeller;
  const isUser = hasRole('UserTrimar') || isCaptador;

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
