const test = require('node:test');
const assert = require('node:assert/strict');
const { getPatientFields, validatePatient } = require('../src/controllers/patientController');

const validPatient = {
  fullName: 'Synthetic Test Patient',
  dob: '1990-04-10',
  gender: 'Other',
  mobile: '0000000000',
  consentStatus: true,
};

test('accepts a complete synthetic patient registration with recorded consent', () => {
  assert.deepEqual(validatePatient(validPatient, { creating: true }), []);
});

test('rejects registration unless consent is explicitly recorded', () => {
  assert.ok(validatePatient({ ...validPatient, consentStatus: false }, { creating: true }).includes(
    'Patient consent must be recorded before registration.'
  ));
});

test('rejects invalid gender and future date of birth', () => {
  const errors = validatePatient({ ...validPatient, gender: 'Unknown', dob: '2999-01-01' }, { creating: true });
  assert.ok(errors.includes('Select a valid gender.'));
  assert.ok(errors.includes('A valid date of birth in the past is required.'));
});

test('only editable patient fields pass through the request whitelist', () => {
  const fields = getPatientFields({
    ...validPatient,
    patientId: 'FORGED-ID',
    age: 99,
    registrationDate: '2000-01-01',
  });
  assert.equal(fields.patientId, undefined);
  assert.equal(fields.age, undefined);
  assert.equal(fields.registrationDate, undefined);
  assert.equal(fields.fullName, validPatient.fullName);
});
