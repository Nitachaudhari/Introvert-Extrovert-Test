import React from 'react';
import ModulePlaceholder from './ModulePlaceholder';

export const ReportsPage = () => {
  return (
    <ModulePlaceholder
      moduleNumber={6}
      title="Assessment Reports"
      subtitle="Clinical PDF report generation and verified psychological interpretations."
      description="Generates publication-quality, HIPAA-compliant assessment reports with graphical C-scale profiles, block breakdowns, psychologist observations, and non-pathological interpretative summaries."
      features={[
        'Automated PDF report compiler with clinic branding',
        'Graphical C-scale (0 to 10) bell curve mapping',
        'Block-wise breakdown & raw score summary',
        'Psychologist observations input & signature block',
        'Direct download & print support',
        'Non-pathological disclaimer compliance',
      ]}
      nextModule={{ name: 'Clinical Analytics', path: '/analytics' }}
    />
  );
};

export default ReportsPage;

