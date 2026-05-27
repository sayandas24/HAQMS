'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import Link from 'next/link';
import { 
  ArrowLeft, Activity, ShieldAlert, Award, FileText, Clipboard, 
  Calendar, CheckCircle, Database, Server, RefreshCw
} from 'lucide-react';
import { getPatientById } from '@/features/patients/api/patients';

export default function PatientHistoryRecords() {
  const { user, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const data = await getPatientById(id);
        if (data.success) {
          setPatient(data.patient);
        } else {
          setError('Patient details not found.');
        }
      } catch (err) {
        console.error('Error fetching patient records:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch patient records.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id, user]);

  if (!user) return null;

  // Mock legacy records to flesh out this page with stunning aesthetics
  const legacyReports = [
    {
      id: 'REP-7429',
      date: '2024-11-12',
      title: 'Full Blood Count & Hematology Panel',
      department: 'Legacy Pathology Lab A',
      status: 'Archived',
      doctor: 'Dr. Sarah Connor',
      notes: 'Hemoglobin levels normal (14.2 g/dL). Platelet counts stable at 240,000/mcL. Slight elevation in eosinophils suggests minor seasonal allergic response.',
    },
    {
      id: 'REP-5182',
      date: '2024-05-03',
      title: 'Chest X-Ray / Radiography Diagnostic',
      department: 'Cardiopulmonary Radiology',
      status: 'Archived',
      doctor: 'Dr. Peter Silberman',
      notes: 'Bilateral lung fields clear. No focal consolidation, pleural effusion, or pneumothorax identified. Cardiac silhouette size and contour are within normal limits.',
    },
    {
      id: 'REP-3041',
      date: '2023-08-21',
      title: 'Electrocardiogram (ECG) 12-Lead Diagnostic',
      department: 'Cardiology Services',
      status: 'Archived',
      doctor: 'Dr. Miles Dyson',
      notes: 'Sinus rhythm at 72 bpm. PR interval (160ms) and QRS duration (88ms) are normal. No ST-segment elevation or depression. Non-specific T-wave changes noted in lateral leads.',
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 space-y-8">
        
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-extrabold text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff Dashboard
          </Link>
          <div className="text-xxs px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold uppercase border border-amber-500/20 tracking-wider">
            Legacy Database Sync Active
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="pulse-loader">
              <div></div>
              <div></div>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-400">Querying legacy records mainframe...</p>
          </div>
        ) : error ? (
          <div className="glass p-8 text-center rounded-2xl border border-rose-500/20 shadow-md">
            <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Synchronize Error</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto">{error}</p>
            <Link 
              href="/dashboard" 
              className="mt-6 inline-flex px-4 py-2 bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950 font-bold rounded-lg text-xs hover:bg-slate-800"
            >
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Premium Patient Glassmorphic Header Card */}
            <div className="glass p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
              {/* Radial gradient glow */}
              <div className="absolute inset-0 bg-radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%) opacity-100 pointer-events-none"></div>

              <div className="flex items-center gap-4 relative">
                <div className="p-4 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl">
                  <Database className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">{patient.name}</h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    <span>Patient ID: #{patient.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>Gender: {patient.gender}</span>
                    <span>•</span>
                    <span>Age: {patient.age} Years</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 relative w-full md:w-auto text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="p-3.5 bg-slate-500/5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex-1">
                  <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Primary Email</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{patient.email || 'None Listed'}</span>
                </div>
                <div className="p-3.5 bg-slate-500/5 rounded-xl border border-slate-200 dark:border-slate-800/80 flex-1">
                  <span className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">Contact Phone</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{patient.phoneNumber}</span>
                </div>
              </div>
            </div>

            {/* Grid Area: History & Diagnostics */}
            <div className="grid gap-8 md:grid-cols-3">
              
              {/* Clinical Summary Column */}
              <div className="md:col-span-1 space-y-6">
                <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Clipboard className="h-4 w-4 text-teal-600" />
                    Clinical Summary
                  </h3>
                  
                  <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider block">Registered Anamnesis</span>
                    <p className="text-xs leading-5 font-semibold text-slate-700 dark:text-slate-300">
                      {patient.medicalHistory?.toUpperCase() || 'NO PRIOR MEDICAL HISTORY RECORDS FILED IN ACTIVE DATABASE.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-slate-700 dark:text-slate-300 text-xxs leading-4 space-y-2">
                    <div className="flex gap-2">
                      <Server className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Legacy System Note:</strong> These records are synchronized from HAQMS v1.0.0-legacy mainframe database storage pools. Some values are locked to read-only status.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legacy Diagnostic Records List Column */}
              <div className="md:col-span-2 space-y-6">
                <div className="glass p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-600" />
                    Legacy Diagnostic Reports Details
                  </h3>

                  <div className="space-y-4">
                    {legacyReports.map((report) => (
                      <div 
                        key={report.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-500/5 hover:border-teal-500/30 transition-all duration-300 relative group"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3.5 border-b border-slate-200 dark:border-slate-800/80">
                          <div>
                            <span className="text-xxs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-slate-500 mr-2 font-mono">
                              {report.id}
                            </span>
                            <span className="text-xxs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                              {report.department}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xxs font-bold text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(report.date).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                            {report.title}
                          </h4>
                          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400 font-semibold mt-2.5">
                            {report.notes}
                          </p>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-dashed border-slate-200 dark:border-slate-800/80 flex justify-between items-center text-xxs font-bold text-slate-400">
                          <span>Practitioner: {report.doctor}</span>
                          <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {report.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
