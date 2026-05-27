import apiClient from '@/lib/api-client';

export const getPatients = async (page = 1, search = '', gender = 'All') => {
  const response = await apiClient.get('/patients', {
    params: {
      page,
      limit: 5,
      search,
      gender,
    },
  });
  return response.data;
};

export const registerPatient = async (patientData) => {
  const response = await apiClient.post('/patients', patientData);
  return response.data;
};

export const deletePatient = async (id) => {
  const response = await apiClient.delete(`/patients/${id}`);
  return response.data;
};

export const getPatientById = async (id) => {
  const response = await apiClient.get(`/patients/${id}`);
  return response.data;
};
