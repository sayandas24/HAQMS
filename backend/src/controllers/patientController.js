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
    const msg = error.message;
    
    // Graceful routing of validation errors to 400 Bad Request
    if (
      msg.includes('required') || 
      msg.includes('Age must be') || 
      msg.includes('Invalid email') || 
      msg.includes('Invalid phone')
    ) {
      return res.status(400).json({ error: msg });
    }
    
    // Graceful routing of unique constraints conflicts to 409 Conflict
    if (msg.includes('already registered')) {
      return res.status(409).json({ error: msg });
    }

    return res.status(500).json({ error: 'Failed to register patient', details: msg });
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
