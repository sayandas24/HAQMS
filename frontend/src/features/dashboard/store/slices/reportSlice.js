import { getDoctorStatsReport } from '@/features/reports/api/reports';
import { searchDoctors } from '@/features/doctors/api/doctors';

export const createReportSlice = (set, get) => ({
  adminReportData: null,
  adminReportLoading: false,
  adminSearchQuery: '',

  setAdminSearchQuery: (query) => set({ adminSearchQuery: query }),

  // Actions
  generateSystemReport: async () => {
    set({ adminReportLoading: true });
    try {
      const data = await getDoctorStatsReport();
      set({ adminReportData: data });
    } catch (e) {
      console.error(e);
    } finally {
      set({ adminReportLoading: false });
    }
  },

  searchPhysiciansAdmin: async () => {
    const { adminSearchQuery } = get();
    try {
      const data = await searchDoctors(adminSearchQuery);
      if (Array.isArray(data)) {
        set({ doctorsList: data });
      } else {
        alert(`API Error: ${data.sqlMessage || data.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  }
});
