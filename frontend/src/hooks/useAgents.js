import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import agentService from '../services/agentService.js';

/**
 * Hook para gestión de agentes captadores.
 * Retorna la lista de agentes y métodos CRUD.
 * @param {boolean} soloActivos - Si true, solo carga agentes activos (por defecto true)
 */
const useAgents = (soloActivos = true) => {
  const { getAccessTokenSilently } = useAuth0();

  const [agentes, setAgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAgentes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();
      const response = await agentService.getAgentes(token, soloActivos);
      setAgentes(response.data || []);
    } catch (err) {
      console.error('Error cargando agentes:', err);
      setError(err.message || 'Error al cargar los agentes');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, soloActivos]);

  useEffect(() => {
    fetchAgentes();
  }, [fetchAgentes]);

  const createAgente = async (nombre) => {
    const token = await getAccessTokenSilently();
    const response = await agentService.createAgente(nombre, token);
    setAgentes(prev => [...prev, response.data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    return response.data;
  };

  const updateAgente = async (id, updateData) => {
    const token = await getAccessTokenSilently();
    const response = await agentService.updateAgente(id, updateData, token);
    setAgentes(prev =>
      prev.map(a => (a.id === id ? response.data : a))
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    return response.data;
  };

  const deleteAgente = async (id) => {
    const token = await getAccessTokenSilently();
    await agentService.deleteAgente(id, token);
    setAgentes(prev => prev.filter(a => a.id !== id));
  };

  return {
    agentes,
    loading,
    error,
    refetch: fetchAgentes,
    createAgente,
    updateAgente,
    deleteAgente
  };
};

export default useAgents;
