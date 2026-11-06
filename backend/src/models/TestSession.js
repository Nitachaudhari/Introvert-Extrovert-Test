const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    questionNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 70,
    },
    block: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E'],
      required: true,
    },
    selectedOption: {
      type: mongoose.Schema.Types.Mixed, // Number (1-5) or String ('Y'/'N')
      required: true,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const TestSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    testName: {
      type: String,
      default: 'Kundu Introversion Extraversion Inventory (K.I.E.I.)',
    },
    administrationMethod: {
      type: String,
      enum: ['self', 'clinician'],
      default: 'clinician',
    },
    testLanguage: {
      type: String,
      enum: ['en', 'hi', 'mr'],
      default: 'en',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      index: true,
    },
    answers: [AnswerSchema],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    rawScore: {
      type: Number,
      default: null,
    },
    cScaleScore: {
      type: Number,
      default: null,
    },
    classification: {
      type: String,
      default: null,
    },
    blockScores: {
      A: { type: Number, default: 0 },
      B: { type: Number, default: 0 },
      C: { type: Number, default: 0 },
      D: { type: Number, default: 0 },
      E: { type: Number, default: 0 },
    },
    scoringValidationStatus: {
      type: String,
      enum: ['unverified', 'verified', 'pending_manual_review'],
      default: 'unverified',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TestSession', TestSessionSchema);

