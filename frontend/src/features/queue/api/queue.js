import apiClient from '@/lib/api-client';

export const getQueue = async (doctorId = null) => {
  const response = await apiClient.get('/queue', {
    params: doctorId ? { doctorId } : {},
  });
  return response.data;
};

export const checkinPatient = async (checkinData) => {
  const response = await apiClient.post('/queue/checkin', checkinData);
  return response.data;
};

export const updateQueueStatus = async (tokenId, status) => {
  const response = await apiClient.patch(`/queue/${tokenId}`, { status });
  return response.data;
};
