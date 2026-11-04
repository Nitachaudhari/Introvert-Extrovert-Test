const express = require('express');
const { listReports, getReportById } = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', listReports);
router.get('/:id', getReportById);

module.exports = router;
