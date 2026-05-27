'use client';

import { Award, Search, ShieldAlert } from 'lucide-react';

export default function PhysicianRegistry({
  doctorsList,
  adminSearchQuery,
  setAdminSearchQuery,
  searchPhysiciansAdmin
}) {
  return (
    <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
      <div>
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Award className="h-5 w-5 text-teal-600" />
          Staff Physicians Registry Lookup
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
          Database lookup for credentials. Uses a raw SQL interpolation backend query.
        </p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={adminSearchQuery}
            onChange={(e) => setAdminSearchQuery(e.target.value)}
            placeholder="Enter physician name search criteria (raw syntax supported)..."
            className="block w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        </div>

        <button
          onClick={searchPhysiciansAdmin}
          className="glow-btn px-5 py-2 bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 font-bold text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-teal-400 transition-colors"
        >
          Execute SQL Query
        </button>
      </div>

      <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-lg border border-rose-500/20 font-semibold leading-5 flex gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <div>
          <strong>SQL Vulnerability alert:</strong> This search executes raw interpolation: 
          <code className="block bg-black/10 dark:bg-black/30 p-1.5 rounded mt-1 font-mono">
            SELECT * FROM &quot;Doctor&quot; WHERE name ILIKE &apos;%&#123;query&#125;%&apos;
          </code>
          Can be audited by inputting standard SQL injection strings to leak full user login lists.
        </div>
      </div>

      {/* Doctors Result List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctorsList.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-500/5 flex flex-col justify-between"
          >
            <div>
              <span className="inline-flex px-2 py-0.5 rounded text-xxs font-extrabold tracking-wide uppercase bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-2">
                {doc.department}
              </span>
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100">{doc.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{doc.specialization}</p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center text-xs font-semibold text-slate-500">
              <span>Exp: {doc.experience} yrs</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">Fee: ${doc.consultationFee}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
