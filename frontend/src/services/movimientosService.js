const API_URL = 'http://localhost:3000/api/movimientos';

export const getMovimientos = async (fecha = '') => {
  try {
    const url = fecha ? `${API_URL}?desde=${fecha}&hasta=${fecha}` : API_URL;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error en la petición');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener el historial de movimientos:', error);
    throw error;
  }
};