import { getPatients, registerPatient, deletePatient } from '@/features/patients/api/patients';

export const createPatientSlice = (set, get) => ({
  patients: [],
  patientsLoading: false,
  patientSearch: '',
  patientGender: 'All',
  patientsPagination: { page: 1, totalPages: 1 },

  setPatientSearch: (search) => {
    set({ patientSearch: search });
  },
  setPatientGender: (gender) => {
    set({ patientGender: gender });
  },

  // Registration Form
  regName: '',
  regEmail: '',
  regPhone: '',
  regAge: '',
  regGender: 'Male',
  regHistory: '',
  regMessage: '',

  setRegName: (name) => set({ regName: name }),
  setRegEmail: (email) => set({ regEmail: email }),
  setRegPhone: (phone) => set({ regPhone: phone }),
  setRegAge: (age) => set({ regAge: age }),
  setRegGender: (gender) => set({ regGender: gender }),
  setRegHistory: (history) => set({ regHistory: history }),
  setRegMessage: (message) => set({ regMessage: message }),

  // Actions
  fetchPatients: async (page = 1) => {
    const { patientSearch, patientGender } = get();
    set({ patientsLoading: true });
    try {
      const data = await getPatients(page, patientSearch, patientGender);
      if (data.success) {
        set({
          patients: data.patients,
          patientsPagination: {
            page: data.pagination.page,
            totalPages: data.pagination.totalPages,
            totalPatients: data.pagination.totalPatients
          }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ patientsLoading: false });
    }
  },

  handleRegisterPatient: async (e) => {
    e.preventDefault();
    const { regName, regEmail, regPhone, regAge, regGender, regHistory, fetchPatients } = get();
    set({ regMessage: '' });

    if (!regName || !regPhone || !regAge) {
      set({ regMessage: 'Error: Name, Age and Phone number are required.' });
      return;
    }

    try {
      await registerPatient({
        name: regName,
        email: regEmail,
        phoneNumber: regPhone,
        age: regAge,
        gender: regGender,
        medicalHistory: regHistory
      });

      set({
        regMessage: 'Success: Patient registered successfully!',
        regName: '',
        regEmail: '',
        regPhone: '',
        regAge: '',
        regHistory: ''
      });
      fetchPatients(1);
    } catch (err) {
      set({ regMessage: `Error: ${err.response?.data?.error || err.message || 'Failed to register'}` });
    }
  },

  handleDeletePatient: async (id) => {
    if (!confirm('Are you sure you want to delete this patient record?')) return;
    const { fetchPatients, patientsPagination } = get();
    try {
      const data = await deletePatient(id);
      alert(data.message || 'Patient deleted.');
      fetchPatients(patientsPagination.page);
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message || 'Unauthorized deletion!'}`);
    }
  }
});
