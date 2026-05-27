import * as patientService from '../services/patientService.js';

export const getAllPatients = async (req, res, next) => {
  try {
    const { search, gender, page, limit } = req.query;
    const { patients, pagination } = await patientService.getAllPatients({
      search,
      gender,
      pageQuery: page,
      limitQuery: limit,
    });

    return res.json({
      success: true,
      patients,
      pagination,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch patients', details: error.message });
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.params.id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    return res.json(patient);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createPatient = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, age, gender, medicalHistory } = req.body;
    const patient = await patientService.createPatient({
      name,
      email,
      phoneNumber,
      age,
      gender,
      medicalHistory,
    });

    return res.status(201).json(patient);
  } catch (error) {
    if (error.message === 'Name, phoneNumber, age, and gender are required.') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to register patient', details: error.message });
  }
};

export const deletePatient = async (req, res, next) => {
  try {
    const patientName = await patientService.deletePatient(req.params.id);
    return res.json({ message: `Successfully deleted patient ${patientName}` });
  } catch (error) {
    if (error.message === 'Patient not found') {
      return res.status(404).json({ error: 'Patient not found' });
    }
    return res.status(500).json({ error: 'Failed to delete patient', details: error.message });
  }
};
