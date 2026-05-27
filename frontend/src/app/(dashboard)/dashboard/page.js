'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';

// Zustand Store
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore';

// Feature Components (stateless, consuming Zustand directly)
import PatientRegistry from '@/features/patients/components/PatientRegistry';
import PatientRegistrationForm from '@/features/patients/components/PatientRegistrationForm';
import PatientHistoryModal from '@/features/patients/components/PatientHistoryModal';
import AppointmentScheduler from '@/features/appointments/components/AppointmentScheduler';
import DoctorBookings from '@/features/appointments/components/DoctorBookings';
import QueueDirectCheckin from '@/features/queue/components/QueueDirectCheckin';
import DoctorQueueCaller from '@/features/queue/components/DoctorQueueCaller';
import PhysicianRegistry from '@/features/doctors/components/PhysicianRegistry';
import SystemReports from '@/features/reports/components/SystemReports';

export default function Dashboard() {
  const { user, token } = useAuth();
  const router = useRouter();

  // Zustand State hooks
  const {
    activeTab,
    setActiveTab,
    patientSearch,
    patientGender,
    doctorsList,
    fetchPatients,
    fetchDoctorsDropdown,
    fetchDoctorWorklist,
    checkinMessage,
    setCheckinMessage,
    selectedPatientHistory
  } = useDashboardStore();

  // 1. Navigation Guard
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  // 2. Fetch Patients on Search/Gender change
  useEffect(() => {
    if (user && (user.role === 'RECEPTIONIST' || user.role === 'ADMIN')) {
      fetchPatients(1);
    }
  }, [patientSearch, patientGender, user, token]);

  // 3. Fetch Doctors dropdown list on mount
  useEffect(() => {
    if (user) {
      fetchDoctorsDropdown();
    }
  }, [user, token]);

  // 4. Fetch Doctor Worklist for doctors on mount / doctorsList update
  useEffect(() => {
    if (user && user.role === 'DOCTOR' && doctorsList.length > 0) {
      fetchDoctorWorklist(user);
    }
  }, [doctorsList, user, token]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
        
        {/* Navigation Tabs based on Role */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto gap-4">
          {user.role === 'ADMIN' && (
            <>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'reports' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400'}`}
              >
                System Audit Reports
              </button>
              <button
                onClick={() => setActiveTab('physicians')}
                className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'physicians' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400'}`}
              >
                Physician Registry
              </button>
            </>
          )}

          {(user.role === 'RECEPTIONIST' || user.role === 'ADMIN') && (
            <>
              <button
                onClick={() => setActiveTab('patients')}
                className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'patients' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400'}`}
              >
                Patient Registry Directory
              </button>
              <button
                onClick={() => setActiveTab('book')}
                className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'book' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400'}`}
              >
                Scheduling / Check-in Portal
              </button>
            </>
          )}

          {user.role === 'DOCTOR' && (
            <>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'appointments' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400'}`}
              >
                My Scheduled Bookings
              </button>
              <button
                onClick={() => setActiveTab('queue')}
                className={`py-3.5 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'queue' ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400'}`}
              >
                Active Calling Queue
              </button>
            </>
          )}
        </div>

        {/* Global Notifications Panel */}
        {checkinMessage && (
          <div className="p-4 mb-6 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-between text-sm">
            <span>{checkinMessage}</span>
            <button onClick={() => setCheckinMessage('')} className="font-bold underline text-xs">Dismiss</button>
          </div>
        )}

        {/* ==============================================================
            TAB: PATIENT REGISTRY (RECEPTIONIST & ADMIN)
            ============================================================== */}
        {activeTab === 'patients' && (
          <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Directory Section */}
              <div className="lg:col-span-2 space-y-6">
                <PatientRegistry />
              </div>

              {/* Registration Form */}
              <PatientRegistrationForm />
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB: SCHEDULING / BOOKING & CHECKIN (RECEPTIONIST & ADMIN)
            ============================================================== */}
        {activeTab === 'book' && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Book Appointment Card */}
            <AppointmentScheduler />

            {/* Quick Walkin Checkin Token Board */}
            <QueueDirectCheckin />
          </div>
        )}

        {/* ==============================================================
            TAB: DOCTOR WORKLIST - APPOINTMENTS (DOCTOR ROLE)
            ============================================================== */}
        {activeTab === 'appointments' && (
          <DoctorBookings user={user} />
        )}

        {/* Patient Clinical History Modal Display */}
        {selectedPatientHistory && (
          <PatientHistoryModal />
        )}

        {/* ==============================================================
            TAB: DOCTOR ACTIVE CALLING QUEUE (DOCTOR ROLE)
            ============================================================== */}
        {activeTab === 'queue' && (
          <DoctorQueueCaller user={user} />
        )}

        {/* ==============================================================
            TAB: SYSTEM REPORTS (ADMIN ROLE)
            ============================================================== */}
        {activeTab === 'reports' && (
          <SystemReports />
        )}

        {/* ==============================================================
            TAB: PHYSICIAN REGISTRY (ADMIN ROLE - SQL INJECTION VULNERABILITY)
            ============================================================== */}
        {activeTab === 'physicians' && (
          <PhysicianRegistry />
        )}
      </main>
    </div>
  );
}
