import { bookAppointment, updateAppointmentStatus } from '@/features/appointments/api/appointments';

export const createAppointmentSlice = (set, get) => ({
  bookingPatientId: '',
  bookingDoctorId: '',
  bookingDate: '',
  bookingReason: '',
  bookingMessage: '',
  doctorAppointments: [],

  setBookingPatientId: (id) => set({ bookingPatientId: id }),
  setBookingDoctorId: (id) => set({ bookingDoctorId: id }),
  setBookingDate: (date) => set({ bookingDate: date }),
  setBookingReason: (reason) => set({ bookingReason: reason }),
  setBookingMessage: (msg) => set({ bookingMessage: msg }),
  setDoctorAppointments: (appointments) => set({ doctorAppointments: appointments }),

  // Actions
  handleBookAppointment: async (e) => {
    e.preventDefault();
    const { bookingPatientId, bookingDoctorId, bookingDate, bookingReason, fetchDoctorWorklist } = get();
    set({ bookingMessage: '' });

    if (!bookingPatientId || !bookingDoctorId || !bookingDate) {
      set({ bookingMessage: 'Error: All booking fields are required.' });
      return;
    }

    try {
      await bookAppointment({
        patientId: bookingPatientId,
        doctorId: bookingDoctorId,
        appointmentDate: bookingDate,
        reason: bookingReason
      });

      set({
        bookingMessage: 'Success: Appointment booked successfully!',
        bookingReason: ''
      });
      if (fetchDoctorWorklist) fetchDoctorWorklist();
    } catch (err) {
      set({ bookingMessage: `Error: ${err.response?.data?.error || err.message || 'Failed to book'}` });
    }
  },

  handleCompleteAppointment: async (appId, user) => {
    const { fetchDoctorWorklist } = get();
    try {
      await updateAppointmentStatus(appId, 'COMPLETED');
      if (fetchDoctorWorklist) fetchDoctorWorklist(user);
    } catch (e) {
      console.error(e);
    }
  }
});
