const mongoose = require('mongoose');

const AssessmentReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    testSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestSession',
      required: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    psychologistName: {
      type: String,
      default: 'Dr. Parag Mahajan',
    },
    observations: {
      type: String,
      default: '',
    },
    interpretation: {
      type: String,
      default: '',
    },
    pdfGenerated: {
      type: Boolean,
      default: false,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AssessmentReport', AssessmentReportSchema);

