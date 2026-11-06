const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const TestSession = require('../models/TestSession');
const Patient = require('../models/Patient');
const AssessmentReport = require('../models/AssessmentReport');
const { calculateKIEIScore, NORMS, C_SCALE_TABLE } = require('../services/scoringEngine');
const { KIEI_QUESTIONS } = require('../data/kieiQuestions');

const QUESTION_MAP = new Map(KIEI_QUESTIONS.map((q) => [q.number, q]));

/**
 * GET /api/assessments
 * List assessments with optional status or patient filter
 */
const listAssessments = async (req, res, next) => {
  try {
    const filter = {};
    if (['pending', 'in_progress', 'completed'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.patient) {
      if (!mongoose.isValidObjectId(req.query.patient)) {
        return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
      }
      filter.patient = req.query.patient;
    }

    const assessments = await TestSession.find(filter)
      .populate('patient', 'patientId fullName age gender mobile email')
      .sort({ updatedAt: -1 })
      .limit(100);

    return res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/assessments
 * Create a new assessment session for a patient
 */
const createAssessment = async (req, res, next) => {
  try {
    const { patientId, administrationMethod = 'clinician', testLanguage = 'en' } = req.body || {};

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient selection is required to start an assessment.' });
    }

    let patient;
    if (mongoose.isValidObjectId(patientId)) {
      patient = await Patient.findById(patientId);
    } else {
      patient = await Patient.findOne({ patientId });
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Selected patient record not found.' });
    }

    if (!patient.consentStatus) {
      return res.status(400).json({
        success: false,
        message: 'Patient consent must be recorded before an assessment session can be initialized.',
      });
    }

    const validMethod = ['self', 'clinician'].includes(administrationMethod)
      ? administrationMethod
      : 'clinician';

    const validLang = ['en', 'hi', 'mr'].includes(testLanguage) ? testLanguage : 'en';

    const shortId = randomUUID().split('-')[0].toUpperCase();
    const sessionId = `SES-${new Date().getFullYear()}-${shortId}`;

    const session = await TestSession.create({
      sessionId,
      patient: patient._id,
      testName: 'Kundu Introversion Extraversion Inventory (K.I.E.I.)',
      administrationMethod: validMethod,
      testLanguage: validLang,
      status: 'in_progress',
      answers: [],
      currentQuestionIndex: 0,
      startedAt: new Date(),
    });

    const populatedSession = await TestSession.findById(session._id).populate(
      'patient',
      'patientId fullName age gender mobile email education occupation'
    );

    return res.status(201).json({
      success: true,
      message: 'Assessment session initialized successfully.',
      data: populatedSession,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/assessments/:sessionId
 * Retrieve assessment session state and answers
 */
const getAssessment = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const filter = mongoose.isValidObjectId(sessionId)
      ? { _id: sessionId }
      : { sessionId };

    const session = await TestSession.findOne(filter).populate(
      'patient',
      'patientId fullName age gender mobile email education occupation clinicalNotes'
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/assessments/:sessionId/progress
 * Autosave answers and update active question index
 */
const saveProgress = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { answers = [], currentQuestionIndex = 0 } = req.body || {};

    const filter = mongoose.isValidObjectId(sessionId)
      ? { _id: sessionId }
      : { sessionId };

    const session = await TestSession.findOne(filter);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed assessments are locked against further modification.',
      });
    }

    // Format and sanitize answers
    const formattedAnswers = answers
      .filter((a) => a && a.questionNumber && a.selectedOption !== undefined)
      .map((a) => {
        const qNum = Number(a.questionNumber);
        const qMeta = QUESTION_MAP.get(qNum);
        return {
          questionNumber: qNum,
          block: qMeta ? qMeta.block : a.block,
          selectedOption: a.selectedOption,
          answeredAt: a.answeredAt || new Date(),
        };
      });

    session.answers = formattedAnswers;
    session.currentQuestionIndex = Math.max(0, Math.min(69, Number(currentQuestionIndex) || 0));
    if (req.body.testLanguage && ['en', 'hi', 'mr'].includes(req.body.testLanguage)) {
      session.testLanguage = req.body.testLanguage;
    }
    session.status = 'in_progress';
    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Assessment progress saved.',
      data: {
        sessionId: session.sessionId,
        answeredCount: formattedAnswers.length,
        currentQuestionIndex: session.currentQuestionIndex,
        updatedAt: session.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/assessments/:sessionId/submit
 * Validate all 70 items, execute Kundu 1976 scoring engine, compute C-Scale and lock session
 */
const submitAssessment = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const filter = mongoose.isValidObjectId(sessionId)
      ? { _id: sessionId }
      : { sessionId };

    const session = await TestSession.findOne(filter).populate('patient');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This assessment session has already been scored and locked.',
        data: session,
      });
    }

    // Merge answers from body if provided, else use session.answers
    let finalAnswers = session.answers;
    if (req.body && Array.isArray(req.body.answers) && req.body.answers.length > 0) {
      finalAnswers = req.body.answers.map((a) => {
        const qNum = Number(a.questionNumber);
        const qMeta = QUESTION_MAP.get(qNum);
        return {
          questionNumber: qNum,
          block: qMeta ? qMeta.block : a.block,
          selectedOption: a.selectedOption,
          answeredAt: a.answeredAt || new Date(),
        };
      });
    }

    // Execute backend psychometric scoring engine
    const scoringResult = calculateKIEIScore(finalAnswers);

    if (!scoringResult.isValid) {
      return res.status(400).json({
        success: false,
        message: scoringResult.error,
        missingQuestions: scoringResult.missingQuestions,
        answeredCount: scoringResult.answeredCount,
      });
    }

    // Save scored session state
    session.answers = finalAnswers;
    session.rawScore = scoringResult.rawScore;
    session.cScaleScore = scoringResult.cScaleScore;
    session.classification = scoringResult.classification;
    session.blockScores = scoringResult.blockScores;
    session.scoringValidationStatus = 'verified';
    session.status = 'completed';
    session.completedAt = new Date();
    if (req.body.testLanguage && ['en', 'hi', 'mr'].includes(req.body.testLanguage)) {
      session.testLanguage = req.body.testLanguage;
    }
    await session.save();

    // Create or update clinical AssessmentReport
    const reportShortId = randomUUID().split('-')[0].toUpperCase();
    const reportId = `REP-${new Date().getFullYear()}-${reportShortId}`;

    const report = await AssessmentReport.findOneAndUpdate(
      { testSession: session._id },
      {
        $setOnInsert: {
          reportId,
          testSession: session._id,
          patient: session.patient._id,
          psychologistName: req.user?.name || 'Dr. Parag Mahajan',
        },
        language: session.testLanguage || 'en',
        observations:
          req.body.observations ||
          `Standardized K.I.E.I. administration completed. Patient raw score: ${scoringResult.rawScore}, C-Scale: ${scoringResult.cScaleScore} (${scoringResult.classification}).`,
        interpretation: scoringResult.interpretationText,
        pdfGenerated: false,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Assessment successfully evaluated and finalized.',
      data: {
        session,
        scoring: scoringResult,
        report,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/assessments/:sessionId/report
 * Retrieve comprehensive clinical report details
 */
const getAssessmentReport = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const filter = mongoose.isValidObjectId(sessionId)
      ? { _id: sessionId }
      : { sessionId };

    const session = await TestSession.findOne(filter).populate(
      'patient',
      'patientId fullName dob age gender mobile email education occupation clinicalNotes'
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Assessment is not completed yet. Scored reports are available only after completion.',
      });
    }

    let report = await AssessmentReport.findOne({ testSession: session._id });
    if (!report) {
      const scoring = calculateKIEIScore(session.answers);
      const reportShortId = randomUUID().split('-')[0].toUpperCase();
      report = await AssessmentReport.create({
        reportId: `REP-${new Date().getFullYear()}-${reportShortId}`,
        testSession: session._id,
        patient: session.patient._id,
        psychologistName: 'Dr. Parag Mahajan',
        language: session.testLanguage || 'en',
        observations: 'Standardized assessment completed.',
        interpretation: scoring.isValid ? scoring.interpretationText : '',
      });
    }

    // Build dimensional norm comparison
    const zScore = session.rawScore
      ? parseFloat(((session.rawScore - NORMS.total.mean) / NORMS.total.sd).toFixed(2))
      : 0;

    const matchedCScale = C_SCALE_TABLE.find((t) => t.cScale === session.cScaleScore) || {
      cScale: session.cScaleScore,
      classification: session.classification,
      interpretation: '',
    };

    return res.status(200).json({
      success: true,
      data: {
        session,
        report,
        scoringSummary: {
          rawScore: session.rawScore,
          cScaleScore: session.cScaleScore,
          classification: session.classification,
          blockScores: session.blockScores,
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

/**
 * PATCH /api/assessments/:sessionId/report
 * Update clinical observations or psychologist notes on the report
 */
const updateReportObservations = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { observations, psychologistName } = req.body || {};

    const filter = mongoose.isValidObjectId(sessionId)
      ? { _id: sessionId }
      : { sessionId };

    const session = await TestSession.findOne(filter);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    const report = await AssessmentReport.findOne({ testSession: session._id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report record not found for this session.' });
    }

    if (observations !== undefined) report.observations = observations;
    if (psychologistName) report.psychologistName = psychologistName;
    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Clinical observations saved successfully.',
      data: report,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listAssessments,
  createAssessment,
  getAssessment,
  saveProgress,
  submitAssessment,
  getAssessmentReport,
  updateReportObservations,
};
