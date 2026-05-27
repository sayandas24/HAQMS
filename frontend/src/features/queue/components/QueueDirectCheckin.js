'use client';

import { Activity } from 'lucide-react';

export default function QueueDirectCheckin({
  patients,
  doctorsList,
  handleQueueCheckin
}) {
  return (
    <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-teal-600" />
        Active Direct Queue Check-In
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-semibold">
        Generate an immediate waiting token for a direct walk-in patient. Allocates active positions under selected practitioners.
      </p>

      <div className="space-y-6">
        <div className="p-4 rounded-xl border border-teal-500/25 bg-teal-500/10 text-slate-700 dark:text-slate-300 text-xs leading-5">
          <strong>Token Generation Engine Note:</strong> Direct arrivals bypass appointments. The token engine automatically fetches the current days maximum token size and increments. 
          <span className="block mt-1 font-bold text-rose-500 uppercase tracking-wide">Warning: Vulnerable to check-in race conditions!</span>
        </div>

        <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div>
            <label className="block mb-1">Select Walk-in Patient*</label>
            <select
              id="walkin-patient"
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Assign Physician*</label>
            <select
              id="walkin-doctor"
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
            >
              <option value="">-- Choose Physician --</option>
              {doctorsList.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const pId = document.getElementById('walkin-patient').value;
              const dId = document.getElementById('walkin-doctor').value;
              if (!pId || !dId) {
                alert('Select patient and doctor first');
                return;
              }
              handleQueueCheckin(pId, dId);
            }}
            className="glow-btn w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 font-extrabold text-sm rounded-lg shadow-md transition-colors duration-300 mt-2"
          >
            Generate Live Token
          </button>
        </div>
      </div>
    </div>
  );
}
