'use client';

import Navbar from '@/components/common/Navbar';
import { useDashboard } from './hooks/useDashboard';

// Feature Components
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
  const {
    user,
    activeTab,
    setActiveTab,
    patients,
    patientsLoading,
    patientSearch,
    setPatientSearch,
    patientGender,
    setPatientGender,
    patientsPagination,
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
    doctorsList,
    bookingPatientId,
    setBookingPatientId,
    bookingDoctorId,
    setBookingDoctorId,
    bookingDate,
    setBookingDate,
    bookingReason,
    setBookingReason,
    bookingMessage,
    checkinMessage,
    setCheckinMessage,
    doctorAppointments,
    doctorQueue,
    selectedPatientHistory,
    setSelectedPatientHistory,
    adminReportData,
    adminReportLoading,
    adminSearchQuery,
    setAdminSearchQuery,
    fetchPatients,
    handleRegisterPatient,
    handleBookAppointment,
    handleDeletePatient,
    handleQueueCheckin,
    handleUpdateQueueStatus,
    handleCompleteAppointment,
    generateSystemReport,
    searchPhysiciansAdmin
  } = useDashboard();

  // Rules of Hooks fully satisfied: early return placed AFTER all hook calls!
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
                <PatientRegistry
                  patients={patients}
                  patientsLoading={patientsLoading}
                  patientSearch={patientSearch}
                  setPatientSearch={setPatientSearch}
                  patientGender={patientGender}
                  setPatientGender={setPatientGender}
                  patientsPagination={patientsPagination}
                  fetchPatients={fetchPatients}
                  handleQueueCheckin={handleQueueCheckin}
                  handleDeletePatient={handleDeletePatient}
                  doctorsList={doctorsList}
                />
              </div>

              {/* Registration Form */}
              <PatientRegistrationForm
                regName={regName}
                setRegName={setRegName}
                regEmail={regEmail}
                setRegEmail={setRegEmail}
                regPhone={regPhone}
                setRegPhone={setRegPhone}
                regAge={regAge}
                setRegAge={setRegAge}
                regGender={regGender}
                setRegGender={setRegGender}
                regHistory={regHistory}
                setRegHistory={setRegHistory}
                regMessage={regMessage}
                handleRegisterPatient={handleRegisterPatient}
              />
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB: SCHEDULING / BOOKING & CHECKIN (RECEPTIONIST & ADMIN)
            ============================================================== */}
        {activeTab === 'book' && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Book Appointment Card */}
            <AppointmentScheduler
              bookingPatientId={bookingPatientId}
              setBookingPatientId={setBookingPatientId}
              bookingDoctorId={bookingDoctorId}
              setBookingDoctorId={setBookingDoctorId}
              bookingDate={bookingDate}
              setBookingDate={setBookingDate}
              bookingReason={bookingReason}
              setBookingReason={setBookingReason}
              bookingMessage={bookingMessage}
              handleBookAppointment={handleBookAppointment}
              patients={patients}
              doctorsList={doctorsList}
            />

            {/* Quick Walkin Checkin Token Board */}
            <QueueDirectCheckin
              patients={patients}
              doctorsList={doctorsList}
              handleQueueCheckin={handleQueueCheckin}
            />
          </div>
        )}

        {/* ==============================================================
            TAB: DOCTOR WORKLIST - APPOINTMENTS (DOCTOR ROLE)
            ============================================================== */}
        {activeTab === 'appointments' && (
          <DoctorBookings
            doctorAppointments={doctorAppointments}
            setSelectedPatientHistory={setSelectedPatientHistory}
            doctorsList={doctorsList}
            user={user}
            handleQueueCheckin={handleQueueCheckin}
            handleCompleteAppointment={handleCompleteAppointment}
          />
        )}

        {/* Patient Clinical History Modal Display */}
        {selectedPatientHistory && (
          <PatientHistoryModal
            selectedPatientHistory={selectedPatientHistory}
            setSelectedPatientHistory={setSelectedPatientHistory}
          />
        )}

        {/* ==============================================================
            TAB: DOCTOR ACTIVE CALLING QUEUE (DOCTOR ROLE)
            ============================================================== */}
        {activeTab === 'queue' && (
          <DoctorQueueCaller
            doctorQueue={doctorQueue}
            handleUpdateQueueStatus={handleUpdateQueueStatus}
          />
        )}

        {/* ==============================================================
            TAB: SYSTEM REPORTS (ADMIN ROLE)
            ============================================================== */}
        {activeTab === 'reports' && (
          <SystemReports
            adminReportData={adminReportData}
            adminReportLoading={adminReportLoading}
            generateSystemReport={generateSystemReport}
          />
        )}

        {/* ==============================================================
            TAB: PHYSICIAN REGISTRY (ADMIN ROLE - SQL INJECTION VULNERABILITY)
            ============================================================== */}
        {activeTab === 'physicians' && (
          <PhysicianRegistry
            doctorsList={doctorsList}
            adminSearchQuery={adminSearchQuery}
            setAdminSearchQuery={setAdminSearchQuery}
            searchPhysiciansAdmin={searchPhysiciansAdmin}
          />
        )}
      </main>
    </div>
  );
}
