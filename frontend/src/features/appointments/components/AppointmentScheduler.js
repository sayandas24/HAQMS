'use client';

import { CalendarDays } from 'lucide-react';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';

export default function AppointmentScheduler() {
  const {
    bookingPatientId,
    setBookingPatientId,
    bookingDoctorId,
    setBookingDoctorId,
    bookingDate,
    setBookingDate,
    bookingReason,
    setBookingReason,
    bookingMessage,
    handleBookAppointment,
    patients,
    doctorsList
  } = useDashboardStore();

  return (
    <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
        <CalendarDays className="h-5 w-5 text-teal-600" />
        Schedule Appointment Slot
      </h3>

      {bookingMessage && (
        <div className={`p-3 text-sm rounded-lg mb-4 ${bookingMessage.startsWith('Success') ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20' : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'}`}>
          {bookingMessage}
        </div>
      )}

      <form onSubmit={handleBookAppointment} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div>
          <label className="block mb-1">Select Registered Patient*</label>
          <select
            required
            value={bookingPatientId}
            onChange={(e) => setBookingPatientId(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
          >
            <option value="">-- Choose Patient --</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.phoneNumber})</option>
            ))}
          </select>
          <span className="text-xxs text-slate-400 block mt-1">If client is missing, register them in the Directory tab first.</span>
        </div>

        <div>
          <label className="block mb-1">Select Physician*</label>
          <select
            required
            value={bookingDoctorId}
            onChange={(e) => setBookingDoctorId(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
          >
            <option value="">-- Choose Physician --</option>
            {doctorsList.map(d => (
              <option key={d.id} value={d.id}>{d.name} - {d.specialization} (${d.consultationFee})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Appointment Date & Time*</label>
          <input
            type="datetime-local"
            required
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1">Consultation Objective / Reason</label>
          <input
            type="text"
            value={bookingReason}
            onChange={(e) => setBookingReason(e.target.value)}
            placeholder="Regular diagnostic review, suture removal..."
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="glow-btn w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-lg shadow-md transition-colors duration-300 mt-2"
        >
          Book Appointment Slot
        </button>
      </form>
    </div>
  );
}
