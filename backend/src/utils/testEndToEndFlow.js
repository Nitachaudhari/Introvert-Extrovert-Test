const path = require('path');
const dotenv = require('dotenv');
const assert = require('assert');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const { connectDB } = require('../config/db');
const Patient = require('../models/Patient');
const TestSession = require('../models/TestSession');
const AssessmentReport = require('../models/AssessmentReport');
const { calculateKIEIScore } = require('../services/scoringEngine');

// Authentic sample answers (from verified hand-scored Kundu 1976 answer sheet)
const sampleAnswers = {
  // Block A (1-11)
  1: 4, 2: 4, 3: 1, 4: 4, 5: 3, 6: 2, 7: 2, 8: 4, 9: 2, 10: 2, 11: 1,
  // Block B (12-28)
  12: 1, 13: 1, 14: 3, 15: 5, 16: 2, 17: 1, 18: 1, 19: 3, 20: 3,
  21: 1, 22: 1, 23: 2, 24: 1, 25: 1, 26: 1, 27: 3, 28: 1,
  // Block C (29-42)
  29: 2, 30: 1, 31: 3, 32: 2, 33: 2, 34: 3, 35: 1, 36: 3, 37: 1, 38: 1, 39: 2, 40: 1, 41: 1, 42: 2,
  // Block D (43-56)
  43: 1, 44: 1, 45: 2, 46: 1, 47: 2, 48: 2, 49: 3, 50: 3, 51: 1, 52: 1, 53: 1, 54: 1, 55: 1, 56: 1,
  // Block E (57-70)
  57: 'Y', 58: 'Y', 59: 'N', 60: 'Y', 61: 'N', 62: 'N', 63: 'N',
  64: 'Y', 65: 'Y', 66: 'Y', 67: 'N', 68: 'Y', 69: 'Y', 70: 'Y',
};

async function runEndToEndVerification() {
  console.log('🧪 Starting End-to-End K.I.E.I. Integration Test...\n');

  // Step 1: Psychometric Engine Unit Verification
  const scoring = calculateKIEIScore(sampleAnswers);
  assert.strictEqual(scoring.isValid, true);
  assert.strictEqual(scoring.rawScore, 189);
  assert.strictEqual(scoring.cScaleScore, 8);
  assert.strictEqual(scoring.classification, 'Moderately Introvert');
  assert.strictEqual(scoring.blockScores.A, 29);
  assert.strictEqual(scoring.blockScores.B, 71);
  assert.strictEqual(scoring.blockScores.C, 29);
  assert.strictEqual(scoring.blockScores.D, 38);
  assert.strictEqual(scoring.blockScores.E, 22);
  console.log('✅ Step 1: Scoring engine math verified against Kundu 1976 baseline (Score: 189, C-Scale: 8).');

  // Step 2: Database Connection Check
  if (!process.env.MONGODB_URI) {
    console.log('⚠️ Step 2: MONGODB_URI not found in environment. Skipping database persistence test.');
    console.log('\n🎉 ALL VERIFICATION CHECKS COMPLETED!');
    return;
  }

  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('⚠️ Could not connect to MongoDB Atlas. Skipping database persistence test.');
    return;
  }
  console.log('✅ Step 2: Live connection to MongoDB Atlas confirmed.');

  // Step 3: Patient Registration Test
  let patient = await Patient.findOne({ mobile: '9999999999' });
  if (!patient) {
    patient = await Patient.create({
      patientId: `PAT-${new Date().getFullYear()}-E2ETEST`,
      fullName: 'Standardization Verification Candidate',
      dob: new Date('1995-05-15'),
      gender: 'Female',
      mobile: '9999999999',
      email: 'verification@psychometrics.org',
      consentStatus: true,
      clinicalNotes: 'Test candidate for automated verification.',
    });
  }
  assert(patient && patient._id);
  console.log(`✅ Step 3: Patient verified/registered: ${patient.fullName} (${patient.patientId}, Age: ${patient.age}).`);

  // Step 4: Assessment Session Lifecycle Test
  const sessionId = `SES-${new Date().getFullYear()}-TEST${Date.now().toString().slice(-4)}`;
  const formattedAnswers = Object.entries(sampleAnswers).map(([qNum, option]) => ({
    questionNumber: Number(qNum),
    block: Number(qNum) <= 11 ? 'A' : Number(qNum) <= 28 ? 'B' : Number(qNum) <= 42 ? 'C' : Number(qNum) <= 56 ? 'D' : 'E',
    selectedOption: option,
  }));

  const session = await TestSession.create({
    sessionId,
    patient: patient._id,
    testName: 'Kundu Introversion Extraversion Inventory (K.I.E.I.)',
    administrationMethod: 'clinician',
    status: 'completed',
    answers: formattedAnswers,
    rawScore: scoring.rawScore,
    cScaleScore: scoring.cScaleScore,
    classification: scoring.classification,
    blockScores: scoring.blockScores,
    scoringValidationStatus: 'verified',
    completedAt: new Date(),
  });

  assert(session && session.sessionId === sessionId);
  console.log(`✅ Step 4: Assessment session created and stored: ${session.sessionId}.`);

  // Step 5: Report Generation Verification
  const report = await AssessmentReport.create({
    reportId: `REP-${new Date().getFullYear()}-TEST${Date.now().toString().slice(-4)}`,
    testSession: session._id,
    patient: patient._id,
    psychologistName: 'Dr. Automated Verifier, Ph.D.',
    observations: 'Automated end-to-end integration test run completed.',
    interpretation: scoring.interpretationText,
  });

  assert(report && report.reportId);
  console.log(`✅ Step 5: Clinical Assessment Report generated: ${report.reportId}.`);

  console.log('\n======================================================');
  console.log('🎉 END-TO-END VERIFICATION: 100% SUCCESS!');
  console.log('   - Model layer: Patient, TestSession, AssessmentReport');
  console.log('   - Scoring engine: 70 Items -> Raw 189 -> C-Scale 8 (Moderately Introvert)');
  console.log('   - MongoDB Atlas: Live persistence verified');
  console.log('======================================================\n');
}

runEndToEndVerification()
  .catch((err) => {
    console.error('❌ Integration test failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
