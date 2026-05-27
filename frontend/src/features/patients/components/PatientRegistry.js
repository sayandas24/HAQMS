'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Search, Trash2 } from 'lucide-react';

export default function PatientRegistry({
  patients,
  patientsLoading,
  patientSearch,
  setPatientSearch,
  patientGender,
  setPatientGender,
  patientsPagination,
  fetchPatients,
  handleQueueCheckin,
  handleDeletePatient,
  doctorsList
}) {
  // Local high-speed input state to eliminate parent re-render typing lag
  const [localSearch, setLocalSearch] = useState(patientSearch);
  const [prevSearch, setPrevSearch] = useState(patientSearch);

  // Sync local input with parent state during render in case parent resets search (avoids cascading render warning)
  if (patientSearch !== prevSearch) {
    setPrevSearch(patientSearch);
    setLocalSearch(patientSearch);
  }

  // Debounce the parent state update
  useEffect(() => {
    const handler = setTimeout(() => {
      setPatientSearch(localSearch);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, setPatientSearch]);

  return (
    <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
        <ClipboardList className="h-5 w-5 text-teal-600" />
        Patient Lookup Directory
      </h3>

      {/* Filters (No longer triggers parent re-renders on every keystroke) */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        </div>

        <select
          value={patientGender}
          onChange={(e) => setPatientGender(e.target.value)}
          className="px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Table listing */}
      {patientsLoading ? (
        <p className="text-center py-6 text-slate-400 animate-pulse text-sm">Synchronizing table data...</p>
      ) : patients.length === 0 ? (
        <p className="text-center py-6 text-slate-400 text-sm">No registered patients match this filter.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm text-left">
            <thead>
              <tr className="text-slate-400 uppercase tracking-widest text-xxs font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="pb-3">Name</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Age/Sex</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-500/5 transition-colors">
                  <td className="py-3.5 font-bold text-slate-800 dark:text-slate-200">
                    {p.name}
                    {p.email && <span className="block text-xxs text-slate-400 font-normal mt-0.5">{p.email}</span>}
                  </td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400 font-medium">{p.phoneNumber}</td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400">
                    {p.age} yrs / <span className="capitalize">{p.gender}</span>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleQueueCheckin(p.id, doctorsList[0]?.id)}
                      className="text-xxs px-2.5 py-1 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold hover:bg-teal-500 hover:text-white transition-colors"
                    >
                      Check In
                    </button>
                    
                    {/* Security flaw testing: Receptionist or doctor can delete since check is bypassed */}
                    <button
                      onClick={() => handleDeletePatient(p.id)}
                      className="text-xxs p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Delete patient record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination control */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <span className="text-xs text-slate-400 font-medium">
          Page {patientsPagination.page} of {patientsPagination.totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={patientsPagination.page <= 1}
            onClick={() => fetchPatients(patientsPagination.page - 1)}
            className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-teal-500/10 disabled:opacity-50 text-xs font-semibold"
          >
            Prev
          </button>
          <button
            disabled={patientsPagination.page >= patientsPagination.totalPages}
            onClick={() => fetchPatients(patientsPagination.page + 1)}
            className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-teal-500/10 disabled:opacity-50 text-xs font-semibold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
