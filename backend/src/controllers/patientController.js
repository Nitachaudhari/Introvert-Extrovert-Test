const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const TestSession = require('../models/TestSession');

const editableFields = [
  'fullName',
  'dob',
  'gender',
  'mobile',
  'email',
  'education',
  'occupation',
  'address',
  'consentStatus',
  'clinicalNotes',
];

const getPatientFields = (body) =>
  editableFields.reduce((fields, key) => {
    if (Object.prototype.hasOwnProperty.call(body, key)) fields[key] = body[key];
    return fields;
  }, {});

const validatePatient = (fields, { creating = false } = {}) => {
  const errors = [];
  if (creating || Object.prototype.hasOwnProperty.call(fields, 'fullName')) {
    if (typeof fields.fullName !== 'string' || !fields.fullName.trim()) {
      errors.push('Full name is required.');
    }
  }
  if (creating || Object.prototype.hasOwnProperty.call(fields, 'dob')) {
    const dob = new Date(fields.dob);
    if (!fields.dob || Number.isNaN(dob.getTime()) || dob > new Date()) {
      errors.push('A valid date of birth in the past is required.');
    }
  }
  if (creating || Object.prototype.hasOwnProperty.call(fields, 'gender')) {
    if (!['Male', 'Female', 'Other'].includes(fields.gender)) {
      errors.push('Select a valid gender.');
    }
  }
  if (creating || Object.prototype.hasOwnProperty.call(fields, 'mobile')) {
    if (typeof fields.mobile !== 'string' || !fields.mobile.trim()) {
      errors.push('Mobile number is required.');
    }
    if (
      Object.prototype.hasOwnProperty.call(fields, 'email') &&
      fields.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)
    ) {
      errors.push('Enter a valid email address.');
    }
  }
  if (creating && fields.consentStatus !== true) {
    errors.push('Patient consent must be recorded before registration.');
  }
  if (
    Object.prototype.hasOwnProperty.call(fields, 'consentStatus') &&
    typeof fields.consentStatus !== 'boolean'
  ) {
    errors.push('Consent status must be true or false.');
  }
  return errors;
};

const createPatient = async (req, res, next) => {
  try {
    const fields = getPatientFields(req.body);
    if (req.user.role === 'assistant' && fields.clinicalNotes) {
      return res.status(403).json({ success: false, message: 'Assistant accounts cannot create or view clinical notes.' });
    }
    const errors = validatePatient(fields, { creating: true });
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    const patient = await Patient.create({
      ...fields,
      patientId: `PAT-${new Date().getFullYear()}-${randomUUID().toUpperCase()}`,
    });
    const data = patient.toObject();
    if (req.user.role === 'assistant') delete data.clinicalNotes;
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const listPatients = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const filter = {};
    if (['Male', 'Female', 'Other'].includes(req.query.gender)) filter.gender = req.query.gender;
    if (req.query.consent === 'true') filter.consentStatus = true;
    if (req.query.consent === 'false') filter.consentStatus = false;
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const escaped = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const expression = new RegExp(escaped, 'i');
      filter.$or = [
        { patientId: expression },
        { fullName: expression },
        { mobile: expression },
        { email: expression },
      ];
    }

    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .select('-clinicalNotes')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Patient.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: { patients, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    return next(error);
  }
};

const getPatient = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
    }
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    const assessments = await TestSession.find({ patient: patient._id })
      .select('sessionId testName administrationMethod status startedAt completedAt scoringValidationStatus')
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: { patient, assessments } });
  } catch (error) {
    return next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
    }
    const fields = getPatientFields(req.body);
    if (!Object.keys(fields).length) {
      return res.status(400).json({ success: false, message: 'No editable patient fields were provided.' });
    }
    const errors = validatePatient(fields);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    patient.set(fields);
    await patient.save();
    return res.status(200).json({ success: true, data: patient });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPatient,
  listPatients,
  getPatient,
  updatePatient,
  getPatientFields,
  validatePatient,
};
