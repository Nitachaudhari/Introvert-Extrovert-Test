import React from 'react';
import ModulePlaceholder from './ModulePlaceholder';

export const KIEITestPage = () => {
  return (
    <ModulePlaceholder
      moduleNumber={3}
      title="K.I.E.I. Questionnaire Instrument"
      subtitle="70-item standardized psychological inventory partitioned into 5 authoritative blocks (A through E)."
      description="Implements the exact questions and uneven response choices from Dr. Ramanath Kundu's 1976 manual: Block A (11 items, 4 choices), Block B (17 items, 5 choices), Block C (14 items, 3 choices), Block D (14 items, 3 choices), and Block E (14 items, 2 choices)."
      features={[
        'Exact question wording from original 1976 test booklet',
        'Preserved response options and block-specific directions',
        'Progress bar & pagination controls (Previous/Next)',
        'Local caching & live MongoDB autosave',
        'Review screen before final submission',
        'Anti-accidental loss protections',
      ]}
      nextModule={{ name: 'Scoring Engine Diagnostics', path: '/reports' }}
    />
  );
};

export default KIEITestPage;

