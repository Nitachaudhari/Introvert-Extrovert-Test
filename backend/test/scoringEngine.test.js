const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateKIEIScore, C_SCALE_TABLE, NORMS } = require('../src/services/scoringEngine');

test('Scoring Engine: authentic hand-scored Kundu 1976 baseline verification', () => {
  const sampleAnswers = {
    // Block A
    1: 4, 2: 4, 3: 1, 4: 4, 5: 3, 6: 2, 7: 2, 8: 4, 9: 2, 10: 2, 11: 1,
    // Block B
    12: 1, 13: 1, 14: 3, 15: 5, 16: 2, 17: 1, 18: 1, 19: 3, 20: 3,
    21: 1, 22: 1, 23: 2, 24: 1, 25: 1, 26: 1, 27: 3, 28: 1,
    // Block C
    29: 2, 30: 1, 31: 3, 32: 2, 33: 2, 34: 3, 35: 1, 36: 3, 37: 1, 38: 1, 39: 2, 40: 1, 41: 1, 42: 2,
    // Block D
    43: 1, 44: 1, 45: 2, 46: 1, 47: 2, 48: 2, 49: 3, 50: 3, 51: 1, 52: 1, 53: 1, 54: 1, 55: 1, 56: 1,
    // Block E
    57: 'Y', 58: 'Y', 59: 'N', 60: 'Y', 61: 'N', 62: 'N', 63: 'N',
    64: 'Y', 65: 'Y', 66: 'Y', 67: 'N', 68: 'Y', 69: 'Y', 70: 'Y',
  };

  const result = calculateKIEIScore(sampleAnswers);

  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.rawScore, 189);
  assert.strictEqual(result.cScaleScore, 8);
  assert.strictEqual(result.classification, 'Moderately Introvert');
  assert.strictEqual(result.blockScores.A, 29);
  assert.strictEqual(result.blockScores.B, 71);
  assert.strictEqual(result.blockScores.C, 29);
  assert.strictEqual(result.blockScores.D, 38);
  assert.strictEqual(result.blockScores.E, 22);
  assert.strictEqual(result.zScore, 3.47);
});

test('Scoring Engine: incomplete assessment detection', () => {
  const incompleteAnswers = { 1: 1, 2: 2 };
  const result = calculateKIEIScore(incompleteAnswers);

  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.scoringValidationStatus, 'incomplete');
  assert.strictEqual(result.missingQuestions.length, 68);
});

test('Scoring Engine: Table 5 C-Scale continuum boundaries', () => {
  assert.strictEqual(C_SCALE_TABLE.length, 11);
  assert.strictEqual(C_SCALE_TABLE[0].cScale, 0);
  assert.strictEqual(C_SCALE_TABLE[0].classification, 'Extremely Extravert');
  assert.strictEqual(C_SCALE_TABLE[5].cScale, 5);
  assert.strictEqual(C_SCALE_TABLE[5].classification, 'Ambivert');
  assert.strictEqual(C_SCALE_TABLE[10].cScale, 10);
  assert.strictEqual(C_SCALE_TABLE[10].classification, 'Extremely Introvert');
});
