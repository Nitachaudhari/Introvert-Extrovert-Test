const { KIEI_QUESTIONS } = require('../data/kieiQuestions');

// Map questions by number for fast lookup
const QUESTION_MAP = new Map(KIEI_QUESTIONS.map((q) => [q.number, q]));

// C-Scale Conversion Table (Table 5 of Kundu 1976 Manual)
const C_SCALE_TABLE = [
  { cScale: 0, min: 0, max: 75, classification: 'Extremely Extravert', interpretation: 'Extreme deviation towards Extraversion.' },
  { cScale: 1, min: 76, max: 89, classification: 'Grossly Extravert', interpretation: 'Gross deviation towards Extraversion.' },
  { cScale: 2, min: 90, max: 112, classification: 'Moderately Extravert', interpretation: 'Moderate deviation towards Extraversion.' },
  { cScale: 3, min: 113, max: 130, classification: 'Slightly Extravert', interpretation: 'Slight deviation from ambivert condition towards Extraversion.' },
  { cScale: 4, min: 131, max: 144, classification: 'Ambivert', interpretation: 'Balanced disposition; within normal range of Ambiversion.' },
  { cScale: 5, min: 145, max: 157, classification: 'Ambivert', interpretation: 'Central population median; characteristic of Ambiversion.' },
  { cScale: 6, min: 158, max: 171, classification: 'Ambivert', interpretation: 'Balanced disposition; within normal range of Ambiversion.' },
  { cScale: 7, min: 172, max: 185, classification: 'Slightly Introvert', interpretation: 'Slight deviation from ambivert condition towards Introversion.' },
  { cScale: 8, min: 186, max: 199, classification: 'Moderately Introvert', interpretation: 'Moderate deviation towards Introversion.' },
  { cScale: 9, min: 200, max: 228, classification: 'Grossly Introvert', interpretation: 'Gross deviation towards Introversion.' },
  { cScale: 10, min: 229, max: 241, classification: 'Extremely Introvert', interpretation: 'Extreme deviation towards Introversion.' },
];

// Indian Standardization Norms (Table 4 of Kundu 1976 Manual, N=318)
const NORMS = {
  sampleSize: 318,
  total: { mean: 144.88, sd: 12.70 },
  blocks: {
    A: { mean: 27.86, sd: 3.36, maxPossible: 44, minPossible: 11 },
    B: { mean: 42.22, sd: 6.36, maxPossible: 85, minPossible: 17 },
    C: { mean: 28.91, sd: 4.14, maxPossible: 42, minPossible: 14 },
    D: { mean: 25.48, sd: 3.30, maxPossible: 42, minPossible: 14 },
    E: { mean: 21.28, sd: 2.43, maxPossible: 28, minPossible: 14 },
  },
};

/**
 * Verified K.I.E.I. Scoring Engine
 * Computes block scores, raw score, C-scale point, classification, and normative z-score
 * @param {Array|Object} answers - Array of { questionNumber, selectedOption } or Map { [num]: option }
 * @returns {Object} Full scoring result
 */
function calculateKIEIScore(answersInput) {
  // Normalize input into Map<questionNumber, selectedOption>
  const answerMap = new Map();
  if (Array.isArray(answersInput)) {
    answersInput.forEach((ans) => {
      if (ans && ans.questionNumber !== undefined) {
        answerMap.set(Number(ans.questionNumber), ans.selectedOption);
      }
    });
  } else if (typeof answersInput === 'object' && answersInput !== null) {
    Object.entries(answersInput).forEach(([num, opt]) => {
      answerMap.set(Number(num), opt);
    });
  }

  const answeredCount = answerMap.size;
  const missingQuestions = [];

  for (let i = 1; i <= 70; i++) {
    if (!answerMap.has(i) || answerMap.get(i) === undefined || answerMap.get(i) === null) {
      missingQuestions.push(i);
    }
  }

  if (missingQuestions.length > 0) {
    return {
      isValid: false,
      scoringValidationStatus: 'incomplete',
      answeredCount,
      missingQuestions,
      error: `Assessment is incomplete. ${missingQuestions.length} questions remaining.`,
    };
  }

  // Calculate block scores
  const blockScores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const itemScores = [];

  for (let num = 1; num <= 70; num++) {
    const q = QUESTION_MAP.get(num);
    const chosen = answerMap.get(num);

    let weight = q.rowWeights[chosen];
    // Coerce numeric or string if needed
    if (weight === undefined) {
      weight = q.rowWeights[String(chosen)] ?? q.rowWeights[Number(chosen)];
    }

    if (weight === undefined) {
      return {
        isValid: false,
        scoringValidationStatus: 'invalid_option',
        error: `Invalid option '${chosen}' selected for question ${num} (${q.block}).`,
      };
    }

    blockScores[q.block] += weight;
    itemScores.push({
      questionNumber: num,
      block: q.block,
      selectedOption: chosen,
      scoreWeight: weight,
    });
  }

  const rawScore =
    blockScores.A + blockScores.B + blockScores.C + blockScores.D + blockScores.E;

  // Convert Raw Score to C-Scale
  let matchedCScale = C_SCALE_TABLE.find(
    (tier) => rawScore >= tier.min && rawScore <= tier.max
  );

  if (!matchedCScale) {
    if (rawScore < 70) matchedCScale = C_SCALE_TABLE[0];
    else matchedCScale = C_SCALE_TABLE[C_SCALE_TABLE.length - 1];
  }

  // Calculate z-score against standardization norms
  const zScore = parseFloat(((rawScore - NORMS.total.mean) / NORMS.total.sd).toFixed(2));

  // Generate verified psychological interpretation
  const clinicalInterpretation =
    `The candidate achieved an overall K.I.E.I. Raw Score of ${rawScore} ` +
    `corresponding to C-Scale Point ${matchedCScale.cScale} (${matchedCScale.classification}). ` +
    `${matchedCScale.interpretation} ` +
    `Block breakdown: Block A (Objective Activities)=${blockScores.A}, ` +
    `Block B (Introspection)=${blockScores.B}, Block C (Paired Preferences)=${blockScores.C}, ` +
    `Block D (Feeling Statements)=${blockScores.D}, Block E (Habit Choices)=${blockScores.E}. ` +
    `Note: This psychometric assessment reflects non-pathological personality dimension and behavioural preference; ` +
    `it does not represent an independent psychiatric diagnosis.`;

  return {
    isValid: true,
    scoringValidationStatus: 'verified',
    scoringVersion: 'KIEI-1976-Standard',
    calculatedAt: new Date().toISOString(),
    rawScore,
    cScaleScore: matchedCScale.cScale,
    classification: matchedCScale.classification,
    interpretationText: clinicalInterpretation,
    blockScores,
    zScore,
    normsReference: {
      standardizationSampleSize: NORMS.sampleSize,
      normMean: NORMS.total.mean,
      normSD: NORMS.total.sd,
    },
    itemScores,
  };
}

module.exports = {
  calculateKIEIScore,
  C_SCALE_TABLE,
  NORMS,
};

