const Patient = require('../models/Patient');
const TestSession = require('../models/TestSession');
const AssessmentReport = require('../models/AssessmentReport');

/**
 * GET /api/dashboard/summary
 * Retrieves live aggregated dashboard statistics directly from MongoDB Atlas
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalPatients,
      totalAssessments,
      completedTests,
      pendingTests,
      totalReports,
      recentPatients,
      recentAssessments,
    ] = await Promise.all([
      Patient.countDocuments(),
      TestSession.countDocuments(),
      TestSession.countDocuments({ status: 'completed' }),
      TestSession.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
      AssessmentReport.countDocuments(),
      Patient.find().sort({ createdAt: -1 }).limit(5).select('-clinicalNotes'),
      TestSession.find()
        .populate('patient', 'fullName patientId gender age mobile')
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    // Monthly Assessment Aggregation (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyStats = await TestSession.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Personality Distribution (only verified completed tests)
    const distributionStats = await TestSession.aggregate([
      {
        $match: {
          status: 'completed',
          classification: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$classification',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalPatients,
          totalAssessments,
          completedTests,
          pendingTests,
          totalReports,
        },
        recentPatients,
        recentAssessments,
        monthlyStats,
        distributionStats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};

