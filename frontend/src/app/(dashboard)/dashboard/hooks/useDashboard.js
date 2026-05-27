'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// API Services
import { getPatients, registerPatient, deletePatient } from '@/features/patients/api/patients';
import { getDoctors, searchDoctors } from '@/features/doctors/api/doctors';
import { bookAppointment, getDoctorAppointments, updateAppointmentStatus } from '@/features/appointments/api/appointments';
import { getQueue, checkinPatient, updateQueueStatus } from '@/features/queue/api/queue';
import { getDoctorStatsReport } from '@/features/reports/api/reports';

export function useDashboard() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  // Navigation Guard
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user]);

  // Global State
  const [activeTab, setActiveTab] = useState(
    user?.role === 'ADMIN' ? 'reports' : user?.role === 'RECEPTIONIST' ? 'patients' : 'appointments'
  );

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
    if (!token) return;
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
    if (user && (user.role === 'RECEPTIONIST' || user.role === 'ADMIN')) {
      fetchPatients(1);
    }
  }, [patientSearch, patientGender, token]);

  // Fetch Doctors for booking drop-down
  const fetchDoctorsDropdown = async () => {
    if (!token) return;
    try {
      const data = await getDoctors();
      setDoctorsList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDoctorsDropdown();
    }
  }, [token]);

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
    if (!user || user.role !== 'DOCTOR' || doctorsList.length === 0) return;
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
    if (user && user.role === 'DOCTOR' && doctorsList.length > 0) {
      fetchDoctorWorklist();
    }
  }, [doctorsList, user]);

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

  return {
    user,
    token,
    logout,
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
  };
}
