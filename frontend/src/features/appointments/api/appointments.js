import apiClient from '@/lib/api-client';

export const bookAppointment = async (appointmentData) => {
  const response = await apiClient.post('/appointments', appointmentData);
  return response.data;
};

export const getDoctorAppointments = async (doctorId) => {
  const response = await apiClient.get('/appointments', {
    params: {
      doctorId,
    },
  });
  return response.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const response = await apiClient.patch(`/appointments/${id}`, { status });
  return response.data;
};
