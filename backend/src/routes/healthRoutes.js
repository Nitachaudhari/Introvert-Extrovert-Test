const express = require('express');
const router = express.Router();
const {
  getHealth,
  getDbHealth,
  testConnection,
} = require('../controllers/healthController');

router.get('/health', getHealth);
router.get('/db-health', getDbHealth);
router.get('/test-connection', testConnection);

module.exports = router;

