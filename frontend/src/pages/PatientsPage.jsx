import React from 'react';
import ModulePlaceholder from './ModulePlaceholder';

export const PatientsPage = () => {
  return (
    <ModulePlaceholder
      moduleNumber={2}
      title="Patient Management"
      subtitle="Complete clinical roster for patient records, demographic tracking, and longitudinal assessment histories."
      description="Patient Management module handles unique Patient ID generation, age derivation from date of birth, consent verification, and clinical notes with restricted access."
      features={[
        'Auto-generated Patient IDs (PAT-YYYY-XXXX)',
        'DOB to Age calculation & validation',
        'Duplicate record detection (mobile/name)',
        'Patient search & demographic filtering',
        'Longitudinal assessment history linking',
        'Secure clinical notes restricted storage',
      ]}
      nextModule={{ name: 'Start New Assessment', path: '/assessments/new' }}
    />
  );
};

export default PatientsPage;

