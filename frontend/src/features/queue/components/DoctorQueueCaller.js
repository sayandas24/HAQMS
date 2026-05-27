'use client';

import { Clock } from 'lucide-react';
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';

export default function DoctorQueueCaller({ user }) {
  const { doctorQueue, handleUpdateQueueStatus } = useDashboardStore();

  return (
    <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-teal-600" />
        Active Operations Queue Controller
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">
        Manage patient call sequences for live monitors. Update status from waiting to active calling.
      </p>

      {doctorQueue.length === 0 ? (
        <p className="text-center py-6 text-slate-400 text-sm">No checked-in patients in queue today.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctorQueue.map((t) => (
            <div
              key={t.id}
              className={`p-5 rounded-2xl border shadow-md relative overflow-hidden flex flex-col justify-between ${t.status === 'CALLING' ? 'border-teal-500 bg-teal-500/10' : 'border-slate-200 dark:border-slate-800 bg-slate-500/5'}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-2xl font-black text-slate-800 dark:text-slate-100">Token #{t.tokenNumber}</span>
                <span className={`px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase ${t.status === 'CALLING' ? 'bg-teal-500 text-white' : t.status === 'COMPLETED' ? 'bg-teal-500/10 text-teal-600' : 'bg-amber-500/10 text-amber-500'}`}>
                  {t.status}
                </span>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.patient.name}</h4>
                <p className="text-xxs text-slate-400 mt-0.5">Contact: {t.patient.phoneNumber}</p>
              </div>

              <div className="mt-6 flex gap-2">
                {t.status === 'WAITING' && (
                  <button
                    onClick={() => handleUpdateQueueStatus(t.id, 'CALLING', user)}
                    className="flex-1 py-1.5 bg-teal-600 text-white font-bold text-xxs rounded hover:bg-teal-700 transition-colors"
                  >
                    Call Patient
                  </button>
                )}
                {t.status === 'CALLING' && (
                  <>
                    <button
                      onClick={() => handleUpdateQueueStatus(t.id, 'COMPLETED', user)}
                      className="flex-1 py-1.5 bg-teal-600 text-white font-bold text-xxs rounded hover:bg-teal-700 transition-colors"
                    >
                      Consulted
                    </button>
                    <button
                      onClick={() => handleUpdateQueueStatus(t.id, 'SKIPPED', user)}
                      className="flex-1 py-1.5 bg-rose-500/10 text-rose-500 font-bold text-xxs rounded hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      Skip / No Show
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
