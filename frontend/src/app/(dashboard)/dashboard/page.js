'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import { useRouter } from 'next/navigation';
import { 
  Users, CalendarDays, Activity, Search, Sparkles, UserPlus, 
  Trash2, ClipboardList, TrendingUp, DollarSign, Award, Clock,
  ArrowRight, ShieldAlert, CheckCircle, Volume2
} from 'lucide-react';

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

// API Services
import { getPatients, registerPatient, deletePatient } from '@/features/patients/api/patients';
import { getDoctors, searchDoctors } from '@/features/doctors/api/doctors';
import { bookAppointment, getDoctorAppointments, updateAppointmentStatus } from '@/features/appointments/api/appointments';
import { getQueue, checkinPatient, updateQueueStatus } from '@/features/queue/api/queue';
import { getDoctorStatsReport } from '@/features/reports/api/reports';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  // Navigation Guard
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  if (!user) return null;

  // Global State
  const [activeTab, setActiveTab] = useState(user.role === 'ADMIN' ? 'reports' : user.role === 'RECEPTIONIST' ? 'patients' : 'appointments');

  // ==========================================
  // STATE FOR RECEPTIONIST WORKFLOWS
  // ==========================================
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientGender, setPatientGender] = useState('All');
  const [patientsPagination, setPatientsPagination] = useState({ page: 1, totalPages: 1 });
  
  // Registration Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regHistory, setRegHistory] = useState('');
  const [regMessage, setRegMessage] = useState('');

  // Queue and Appointment Booking
  const [doctorsList, setDoctorsList] = useState([]);
  const [bookingPatientId, setBookingPatientId] = useState('');
  const [bookingDoctorId, setBookingDoctorId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [checkinMessage, setCheckinMessage] = useState('');

  // ==========================================
  // STATE FOR DOCTOR WORKFLOWS
  // ==========================================
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [doctorQueue, setDoctorQueue] = useState([]);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);

  // ==========================================
  // STATE FOR ADMIN WORKFLOWS
  // ==========================================
  const [adminReportData, setAdminReportData] = useState(null);
  const [adminReportLoading, setAdminReportLoading] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // ==========================================
  // RECEPTIONIST FUNCTIONS
  // ==========================================
  
  // Fetch Patients List
  const fetchPatients = async (page = 1) => {
    setPatientsLoading(true);
    try {
      const data = await getPatients(page, patientSearch, patientGender);
      if (data.success) {
        setPatients(data.patients);
        setPatientsPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          totalPatients: data.pagination.totalPatients
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPatientsLoading(false);
    }
  };

  // Trigger Patient List Fetch (Every keystroke trigger re-renders parent! - Performance bug)
  useEffect(() => {
    if (user.role === 'RECEPTIONIST' || user.role === 'ADMIN') {
      fetchPatients(1);
    }
  }, [patientSearch, patientGender]);

  // Fetch Doctors for booking drop-down
  const fetchDoctorsDropdown = async () => {
    try {
      const data = await getDoctors();
      setDoctorsList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDoctorsDropdown();
  }, []);

  // Handle Patient Registration
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setRegMessage('');

    if (!regName || !regPhone || !regAge) {
      setRegMessage('Error: Name, Age and Phone number are required.');
      return;
    }

    try {
      await registerPatient({
        name: regName,
        email: regEmail,
        phoneNumber: regPhone,
        age: regAge,
        gender: regGender,
        medicalHistory: regHistory
      });

      setRegMessage('Success: Patient registered successfully!');
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegAge('');
      setRegHistory('');
      fetchPatients(1);
    } catch (err) {
      setRegMessage(`Error: ${err.response?.data?.error || err.message || 'Failed to register'}`);
    }
  };

  // Handle Appointment Booking
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingMessage('');

    if (!bookingPatientId || !bookingDoctorId || !bookingDate) {
      setBookingMessage('Error: All booking fields are required.');
      return;
    }

    try {
      await bookAppointment({
        patientId: bookingPatientId,
        doctorId: bookingDoctorId,
        appointmentDate: bookingDate,
        reason: bookingReason
      });

      setBookingMessage('Success: Appointment booked successfully!');
      setBookingReason('');
      if (user.role === 'DOCTOR') fetchDoctorWorklist();
    } catch (err) {
      setBookingMessage(`Error: ${err.response?.data?.error || err.message || 'Failed to book'}`);
    }
  };

  // Delete Patient (Bypassed authorization admin check!)
  const handleDeletePatient = async (id) => {
    if (!confirm('Are you sure you want to delete this patient record?')) return;
    try {
      const data = await deletePatient(id);
      alert(data.message || 'Patient deleted.');
      fetchPatients(patientsPagination.page);
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message || 'Unauthorized deletion!'}`);
    }
  };

  // Queue Token Checkin (Race condition API!)
  const handleQueueCheckin = async (patientId, doctorId, appointmentId = null) => {
    setCheckinMessage('');
    try {
      const data = await checkinPatient({ patientId, doctorId, appointmentId });
      setCheckinMessage(`Checked in! Generated Token #${data.token.tokenNumber}`);
      if (user.role === 'DOCTOR') fetchDoctorWorklist();
    } catch (err) {
      setCheckinMessage(`Error check-in: ${err.response?.data?.error || err.message}`);
    }
  };

  // ==========================================
  // DOCTOR WORKFLOW FUNCTIONS
  // ==========================================
  const fetchDoctorWorklist = async () => {
    if (user.role !== 'DOCTOR') return;
    try {
      const matchedDoc = doctorsList.find(d => d.userId === user.id);
      if (!matchedDoc) return;

      // 1. Fetch appointments for this doctor
      const appData = await getDoctorAppointments(matchedDoc.id);
      if (appData.success) {
        setDoctorAppointments(appData.appointments);
      }

      // 2. Fetch queue list for this doctor today
      const queueData = await getQueue(matchedDoc.id);
      setDoctorQueue(queueData);

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user.role === 'DOCTOR' && doctorsList.length > 0) {
      fetchDoctorWorklist();
    }
  }, [doctorsList]);

  // Update token status (WAITING -> CALLING -> COMPLETED / SKIPPED)
  const handleUpdateQueueStatus = async (tokenId, newStatus) => {
    try {
      await updateQueueStatus(tokenId, newStatus);
      fetchDoctorWorklist();
    } catch (e) {
      console.error(e);
    }
  };

  // Complete consultation of an appointment
  const handleCompleteAppointment = async (appId) => {
    try {
      await updateAppointmentStatus(appId, 'COMPLETED');
      fetchDoctorWorklist();
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // ADMIN SYSTEM WORKFLOWS
  // ==========================================
  
  // Slow report generator fetch
  const generateSystemReport = async () => {
    setAdminReportLoading(true);
    try {
      const data = await getDoctorStatsReport();
      setAdminReportData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAdminReportLoading(false);
    }
  };

  // Search Doctors (SQL Injection vulnerable API!)
  const searchPhysiciansAdmin = async () => {
    try {
      const data = await searchDoctors(adminSearchQuery);
      if (Array.isArray(data)) {
        setDoctorsList(data);
      } else {
        alert(`API Error: ${data.sqlMessage || data.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
