import apiClient from '@/lib/api-client';

export const loginUser = async (email, password) => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (name, email, password, role = 'RECEPTIONIST') => {
  const response = await apiClient.post('/auth/register', { name, email, password, role });
  return response.data;
};
