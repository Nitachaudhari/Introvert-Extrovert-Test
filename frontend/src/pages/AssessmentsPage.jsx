import React from 'react';
import ModulePlaceholder from './ModulePlaceholder';

export const AssessmentsPage = () => {
  return (
    <ModulePlaceholder
      moduleNumber={4}
      title="All Assessments"
      subtitle="Comprehensive ledger of all clinical test administrations, session stages, and raw submissions."
      description="Track pending, in-progress, and completed K.I.E.I. assessments with filterable search and audit logs."
      features={[
        'Full session ledger with MongoDB filtering',
        'In-progress session resumption links',
        'Raw response inspect & audit logging',
        'Completed test validation status markers',
        'Batch export & search by session or patient',
      ]}
      nextModule={{ name: 'View Reports', path: '/reports' }}
    />
  );
};

export default AssessmentsPage;

