'use client';

import { UserPlus } from 'lucide-react';

export default function PatientRegistrationForm({
  regName,
  setRegName,
  regEmail,
  setRegEmail,
  regPhone,
  setRegPhone,
  regAge,
  setRegAge,
  regGender,
  setRegGender,
  regHistory,
  setRegHistory,
  regMessage,
  handleRegisterPatient
}) {
  return (
    <div className="glass p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 h-fit">
      <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
        <UserPlus className="h-5 w-5 text-teal-600" />
        New Registration
      </h3>

      {regMessage && (
        <div className={`p-3 text-sm rounded-lg mb-4 ${regMessage.startsWith('Success') ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20' : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'}`}>
          {regMessage}
        </div>
      )}

      <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div>
          <label className="block mb-1">Patient Full Name*</label>
          <input
            type="text"
            required
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            placeholder="Bruce Wayne"
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Age (Years)*</label>
            <input
              type="number"
              required
              value={regAge}
              onChange={(e) => setRegAge(e.target.value)}
              placeholder="35"
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block mb-1">Gender*</label>
            <select
              value={regGender}
              onChange={(e) => setRegGender(e.target.value)}
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1">Contact Phone*</label>
          <input
            type="text"
            required
            value={regPhone}
            onChange={(e) => setRegPhone(e.target.value)}
            placeholder="555-0199 (Unchecked format)"
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1">Email Address</label>
          <input
            type="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            placeholder="bruce@wayne.com"
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="block mb-1">Medical Anamnesis / History (Can be left blank)</label>
          <textarea
            value={regHistory}
            onChange={(e) => setRegHistory(e.target.value)}
            placeholder="E.g. cardiovascular risks, asthma..."
            rows="3"
            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-slate-100 text-sm focus:outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="glow-btn w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm rounded-lg shadow-md transition-colors duration-300 mt-2"
        >
          Register Patient Record
        </button>
      </form>
    </div>
  );
}
