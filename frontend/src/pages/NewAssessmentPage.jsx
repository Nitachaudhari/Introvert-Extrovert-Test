import React from 'react';
import ModulePlaceholder from './ModulePlaceholder';

export const NewAssessmentPage = () => {
  return (
    <ModulePlaceholder
      moduleNumber={3}
      title="New Assessment Session"
      subtitle="Initiate a K.I.E.I. session with independent self-administration or clinician-assisted entry."
      description="Select an enrolled patient from MongoDB, choose administration method (Independent Patient or Psychologist Administered), and initialize session state."
      features={[
        'Patient selection from verified roster',
        'Dual administration modes (Self vs Clinician)',
        'Unique Session ID generation',
        'Real-time response autosave to MongoDB',
        'Seamless resumption of incomplete sessions',
        'Submission locking & duplicate prevention',
      ]}
      nextModule={{ name: 'K.I.E.I. Instrument', path: '/kiei-test' }}
    />
  );
};

export default NewAssessmentPage;

