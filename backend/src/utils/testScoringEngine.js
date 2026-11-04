const { calculateKIEIScore } = require('../services/scoringEngine');
const { KIEI_QUESTIONS } = require('../data/kieiQuestions');

console.log('🧪 Starting K.I.E.I. Scoring Engine Verification Tests...\n');

// TEST 1: Authentic Hand-Scored Sample from Uploaded Answer Sheet
// From WhatsApp Image 2026-10-31 at 22.27.02 (2).jpeg:
// Expected: A=29, B=71, C=29, D=38, E=22 -> Total=189 -> C-scale=8 ("Moderately Introvert")
const sampleAnswers = {};

// Block A answers from image ticks:
// Q1: tick on box 4 (row 3) -> option 4 (wt 3)
// Q2: tick on box 4 (row 3) -> option 4 (wt 3)
// Q3: tick on box 1 (row 1) -> option 1 (wt 1)
// Q4: tick on box 4 (row 1) -> option 4 (wt 1)
// Q5: tick on box 3 (row 3) -> option 3 (wt 3)
// Q6: tick on box 2 (row 3) -> option 2 (wt 3)
// Q7: tick on box 2 (row 2) -> option 2 (wt 2)
// Q8: tick on box 4 (row 4) -> option 4 (wt 4)
// Q9: tick on box 2 (row 2) -> option 2 (wt 2)
// Q10: tick on box 2 (row 3) -> option 2 (wt 3)
// Q11: tick on box 1 (row 4) -> option 1 (wt 4)
const blockATicks = {
  1: 4, 2: 4, 3: 1, 4: 4, 5: 3, 6: 2, 7: 2, 8: 4, 9: 2, 10: 2, 11: 1
};
Object.assign(sampleAnswers, blockATicks);

// Block B answers:
// Q12: 1 (row 5 wt 5), Q13: 1 (row 5 wt 5), Q14: 3 (row 2 wt 2), Q15: 5 (row 3 wt 3), Q16: 2 (row 5 wt 5),
// Q17: 1 (row 5 wt 5), Q18: 1 (row 5 wt 5), Q19: 3 (row 2 wt 2), Q20: 3 (row 2 wt 2), Q21: 1 (row 5 wt 5),
// Q22: 1 (row 5 wt 5), Q23: 2 (row 5 wt 5), Q24: 1 (row 5 wt 5), Q25: 1 (row 5 wt 5), Q26: 1 (row 5 wt 5),
// Q27: 3 (row 2 wt 2), Q28: 1 (row 5 wt 5)
const blockBTicks = {
  12: 1, 13: 1, 14: 3, 15: 5, 16: 2, 17: 1, 18: 1, 19: 3, 20: 3,
  21: 1, 22: 1, 23: 2, 24: 1, 25: 1, 26: 1, 27: 3, 28: 1
};
Object.assign(sampleAnswers, blockBTicks);

// Block C answers:
// Q29: 2 (row 1 wt 1), Q30: 1 (row 3 wt 3), Q31: 3 (row 2 wt 2), Q32: 2 (row 1 wt 1), Q33: 2 (row 1 wt 1),
// Q34: 3 (row 2 wt 2), Q35: 1 (row 3 wt 3), Q36: 3 (row 2 wt 2), Q37: 1 (row 3 wt 3), Q38: 1 (row 3 wt 3),
// Q39: 2 (row 1 wt 1), Q40: 1 (row 3 wt 3), Q41: 1 (row 1 wt 1), Q42: 2 (row 3 wt 3)
const blockCTicks = {
  29: 2, 30: 1, 31: 3, 32: 2, 33: 2, 34: 3, 35: 1, 36: 3, 37: 1, 38: 1, 39: 2, 40: 1, 41: 1, 42: 2
};
Object.assign(sampleAnswers, blockCTicks);

// Block D answers:
// Q43: 1 (row 3 wt 3), Q44: 1 (row 3 wt 3), Q45: 2 (row 1 wt 1), Q46: 1 (row 3 wt 3), Q47: 2 (row 3 wt 3),
// Q48: 2 (row 3 wt 3), Q49: 3 (row 2 wt 2), Q50: 3 (row 2 wt 2), Q51: 1 (row 3 wt 3), Q52: 1 (row 3 wt 3),
// Q53: 1 (row 3 wt 3), Q54: 1 (row 3 wt 3), Q55: 1 (row 3 wt 3), Q56: 1 (row 3 wt 3)
const blockDTicks = {
  43: 1, 44: 1, 45: 2, 46: 1, 47: 2, 48: 2, 49: 3, 50: 3, 51: 1, 52: 1, 53: 1, 54: 1, 55: 1, 56: 1
};
Object.assign(sampleAnswers, blockDTicks);

// Block E answers:
// Q57: Y (row 2 wt 2), Q58: Y (row 1 wt 1), Q59: N (row 1 wt 1), Q60: Y (row 2 wt 2), Q61: N (row 1 wt 1),
// Q62: N (row 1 wt 1), Q63: N (row 2 wt 2), Q64: Y (row 2 wt 2), Q65: Y (row 2 wt 2), Q66: Y (row 1 wt 1),
// Q67: N (row 2 wt 2), Q68: Y (row 2 wt 2), Q69: Y (row 2 wt 2), Q70: Y (row 1 wt 1)
const blockETicks = {
  57: 'Y', 58: 'Y', 59: 'N', 60: 'Y', 61: 'N', 62: 'N', 63: 'N',
  64: 'Y', 65: 'Y', 66: 'Y', 67: 'N', 68: 'Y', 69: 'Y', 70: 'Y'
};
Object.assign(sampleAnswers, blockETicks);

const result = calculateKIEIScore(sampleAnswers);

console.log('--- TEST 1: Hand-Scored Answer Sheet Sample ---');
console.log('Block Scores:', result.blockScores);
console.log('Total Raw Score:', result.rawScore, '(Expected: 189)');
console.log('C-Scale Point:', result.cScaleScore, '(Expected: 8)');
console.log('Classification:', result.classification, '(Expected: Moderately Introvert)');
console.log('Z-Score vs Indian Norms:', result.zScore);

const assert = require('assert');
assert.strictEqual(result.isValid, true);
assert.strictEqual(result.rawScore, 189);
assert.strictEqual(result.cScaleScore, 8);
assert.strictEqual(result.classification, 'Moderately Introvert');
assert.strictEqual(result.blockScores.A, 29);
assert.strictEqual(result.blockScores.B, 71);
assert.strictEqual(result.blockScores.C, 29);
assert.strictEqual(result.blockScores.D, 38);
assert.strictEqual(result.blockScores.E, 22);

console.log('\n✅ TEST 1 PASSED: 100% exact match with Kundu 1976 Hand-Scored Sheet!\n');

// TEST 2: Incomplete Assessment
const incompleteAnswers = { 1: 1, 2: 2 };
const incompleteResult = calculateKIEIScore(incompleteAnswers);
assert.strictEqual(incompleteResult.isValid, false);
assert.strictEqual(incompleteResult.missingQuestions.length, 68);
console.log('✅ TEST 2 PASSED: Incomplete test validation works correctly.\n');

console.log('🎉 ALL SCORING ENGINE TESTS PASSED!');

