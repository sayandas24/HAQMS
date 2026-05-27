import apiClient from '@/lib/api-client';

export const getDoctorStatsReport = async () => {
  const response = await apiClient.get('/reports/doctor-stats');
  return response.data;
};
