import apiClient from '@/lib/api-client';

export const getDoctors = async () => {
  const response = await apiClient.get('/doctors');
  return response.data;
};

export const searchDoctors = async (searchQuery) => {
  const response = await apiClient.get('/doctors', {
    params: {
      search: searchQuery,
    },
  });
  return response.data;
};
