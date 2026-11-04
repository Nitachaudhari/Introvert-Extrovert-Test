const express = require('express');
const {
  listAssessments,
  createAssessment,
  getAssessment,
  saveProgress,
  submitAssessment,
  getAssessmentReport,
  updateReportObservations,
} = require('../controllers/assessmentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.route('/')
  .get(listAssessments)
  .post(createAssessment);

router.route('/:sessionId')
  .get(getAssessment);

router.route('/:sessionId/progress')
  .put(saveProgress);

router.route('/:sessionId/submit')
  .post(submitAssessment);

router.route('/:sessionId/report')
  .get(getAssessmentReport)
  .patch(updateReportObservations);

module.exports = router;
