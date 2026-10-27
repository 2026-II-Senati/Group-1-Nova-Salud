const API_URL = 'http://localhost:3000/api/auth';

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
};