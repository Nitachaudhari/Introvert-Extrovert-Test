const mongoose = require('mongoose');
const AssessmentReport = require('../models/AssessmentReport');
const TestSession = require('../models/TestSession');
const { NORMS, C_SCALE_TABLE } = require('../services/scoringEngine');

/**
 * GET /api/reports
 * List all generated clinical assessment reports
 */
const listReports = async (req, res, next) => {
  try {
    const reports = await AssessmentReport.find()
      .populate('patient', 'patientId fullName age gender mobile')
      .populate('testSession', 'sessionId status rawScore cScaleScore classification blockScores completedAt administrationMethod')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({ success: true, data: reports });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/reports/:id
 * Retrieve a single report by reportId or _id
 */
const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = mongoose.isValidObjectId(id) ? { _id: id } : { reportId: id };

    const report = await AssessmentReport.findOne(filter)
      .populate('patient', 'patientId fullName dob age gender mobile email education occupation clinicalNotes')
      .populate('testSession');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Assessment report not found.' });
    }

    const session = report.testSession;
    const zScore = session && session.rawScore
      ? parseFloat(((session.rawScore - NORMS.total.mean) / NORMS.total.sd).toFixed(2))
      : 0;

    const matchedCScale = C_SCALE_TABLE.find((t) => t.cScale === (session?.cScaleScore)) || {
      cScale: session?.cScaleScore,
      classification: session?.classification,
      interpretation: '',
    };

    return res.status(200).json({
      success: true,
      data: {
        report,
        session,
        scoringSummary: {
          rawScore: session?.rawScore,
          cScaleScore: session?.cScaleScore,
          classification: session?.classification,
          blockScores: session?.blockScores,
          zScore,
          cScaleDetails: matchedCScale,
          norms: NORMS,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listReports,
  getReportById,
};
