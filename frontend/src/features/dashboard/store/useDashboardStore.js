import { create } from 'zustand';
import { createUiSlice } from './slices/uiSlice';
import { createPatientSlice } from './slices/patientSlice';
import { createAppointmentSlice } from './slices/appointmentSlice';
import { createQueueSlice } from './slices/queueSlice';
import { createReportSlice } from './slices/reportSlice';

export const useDashboardStore = create((set, get) => ({
  ...createUiSlice(set, get),
  ...createPatientSlice(set, get),
  ...createAppointmentSlice(set, get),
  ...createQueueSlice(set, get),
  ...createReportSlice(set, get),
}));
