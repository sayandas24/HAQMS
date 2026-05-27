import { getDoctors } from '@/features/doctors/api/doctors';
import { getDoctorAppointments } from '@/features/appointments/api/appointments';
import { getQueue, checkinPatient, updateQueueStatus } from '@/features/queue/api/queue';

export const createQueueSlice = (set, get) => ({
  doctorsList: [],
  doctorQueue: [],
  selectedPatientHistory: null,
  checkinMessage: '',

  setSelectedPatientHistory: (history) => set({ selectedPatientHistory: history }),
  setCheckinMessage: (msg) => set({ checkinMessage: msg }),

  // Actions
  fetchDoctorsDropdown: async () => {
    try {
      const data = await getDoctors();
      set({ doctorsList: data });
    } catch (e) {
      console.error(e);
    }
  },

  handleQueueCheckin: async (patientId, doctorId, appointmentId = null) => {
    set({ checkinMessage: '' });
    const { fetchDoctorWorklist } = get();
    try {
      const data = await checkinPatient({ patientId, doctorId, appointmentId });
      set({ checkinMessage: `Checked in! Generated Token #${data.token.tokenNumber}` });
      fetchDoctorWorklist();
    } catch (err) {
      set({ checkinMessage: `Error check-in: ${err.response?.data?.error || err.message}` });
    }
  },

  fetchDoctorWorklist: async (user) => {
    if (!user || user.role !== 'DOCTOR') return;
    const { doctorsList } = get();
    try {
      const matchedDoc = doctorsList.find(d => d.userId === user.id);
      if (!matchedDoc) return;

      // 1. Fetch appointments for this doctor (resolves setDoctorAppointments if defined)
      const appData = await getDoctorAppointments(matchedDoc.id);
      if (appData.success) {
        set({ doctorAppointments: appData.appointments });
      }

      // 2. Fetch queue list for this doctor today
      const queueData = await getQueue(matchedDoc.id);
      set({ doctorQueue: queueData });

    } catch (e) {
      console.error(e);
    }
  },

  handleUpdateQueueStatus: async (tokenId, newStatus, user) => {
    const { fetchDoctorWorklist } = get();
    try {
      await updateQueueStatus(tokenId, newStatus);
      fetchDoctorWorklist(user);
    } catch (e) {
      console.error(e);
    }
  }
});
