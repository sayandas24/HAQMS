'use client';

import { CalendarDays } from 'lucide-react';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';

export default function DoctorBookings({ user }) {
  const {
    doctorAppointments,
    setSelectedPatientHistory,
    doctorsList,
    handleQueueCheckin,
    handleCompleteAppointment
  } = useDashboardStore();

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5 text-teal-600" />
          Scheduled Daily Bookings List
        </h3>

        {doctorAppointments.length === 0 ? (
          <p className="text-center py-6 text-slate-400 text-sm">No appointments scheduled for you today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm text-left">
              <thead>
                <tr className="text-slate-400 uppercase tracking-widest text-xxs font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Consultation Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {doctorAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {new Date(app.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5">
                      <button
                        onClick={() => setSelectedPatientHistory(app.patient)}
                        className="font-bold text-teal-600 hover:underline hover:text-teal-700 transition-colors"
                      >
                        {app.patient ? app.patient.name : 'Unknown Patient'}
                      </button>
                      <span className="block text-xxs text-slate-400 mt-0.5">Age: {app.patient?.age}</span>
                    </td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400 font-semibold">{app.reason || 'None provided'}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase ${app.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600' : app.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => {
                              const matchedDoc = doctorsList.find(d => d.userId === user.id);
                              handleQueueCheckin(app.patientId, matchedDoc.id, app.id);
                            }}
                            className="text-xxs px-2.5 py-1 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold hover:bg-teal-500 hover:text-white transition-colors"
                          >
                            Check In Patient
                          </button>
                          <button
                            onClick={() => handleCompleteAppointment(app.id, user)}
                            className="text-xxs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold hover:bg-teal-500 hover:text-white transition-colors"
                          >
                            Complete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
