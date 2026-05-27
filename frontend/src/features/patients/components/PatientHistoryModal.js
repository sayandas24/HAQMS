'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function PatientHistoryModal({
  selectedPatientHistory,
  setSelectedPatientHistory
}) {
  if (!selectedPatientHistory) return null;

  return (
    <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
            Medical Records: {selectedPatientHistory.name}
          </h3>
          <p className="text-xxs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Gender: {selectedPatientHistory.gender} | Contact: {selectedPatientHistory.phoneNumber}
          </p>
        </div>
        <button 
          onClick={() => setSelectedPatientHistory(null)}
          className="text-xs font-bold text-slate-400 hover:text-slate-600"
        >
          Close
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <h4 className="font-bold text-slate-400 uppercase tracking-wider">Clinical Background Information</h4>
        
        {/* FRONTEND CRASH BUG:
            Assuming medicalHistory is always populated. Accesses a method on a nullable property
            without optional chaining! If medicalHistory is null (which is the case for Batman, Clark Kent, etc.),
            this code throws: "Cannot read properties of null (reading 'toUpperCase')" and crashes the app! */}
        <p className="text-slate-700 dark:text-slate-300 leading-5 text-sm font-semibold">
          {selectedPatientHistory.medicalHistory.toUpperCase()}
        </p>
      </div>

      <div className="pt-2 flex justify-between items-center text-xs">
        {/* Incomplete Missing Route trigger -> will route to 404 page! */}
        <Link 
          href={`/patients/${selectedPatientHistory.id}/history-records`} 
          className="text-teal-600 font-extrabold hover:underline flex items-center gap-1"
        >
          View Diagnostic Reports Details (Legacy App)
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
