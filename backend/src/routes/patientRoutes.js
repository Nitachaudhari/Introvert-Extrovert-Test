const express = require('express');
const {
  createPatient,
  listPatients,
  getPatient,
  updatePatient,
} = require('../controllers/patientController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.route('/').get(listPatients).post(createPatient);
router.route('/:id')
  .get(requireRole('admin', 'psychologist'), getPatient)
  .patch(requireRole('admin', 'psychologist'), updatePatient);

module.exports = router;
