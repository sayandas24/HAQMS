export const createUiSlice = (set, get) => ({
  activeTab: 'patients',
  setActiveTab: (tab) => set({ activeTab: tab }),
});
