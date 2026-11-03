import React from 'react';
import ModulePlaceholder from './ModulePlaceholder';

export const SettingsPage = () => {
  return (
    <ModulePlaceholder
      moduleNumber={8}
      title="Clinic Settings & Configuration"
      subtitle="Institutional parameters, assessment defaults, and cloud connection monitors."
      description="Configure clinic name, logo for generated PDF reports, scoring verification strictness, and backup/export options."
      features={[
        'Clinic branding (Name, Logo, Address, Contact)',
        'Default psychologist signature configuration',
        'Scoring rule verification enforcement toggle',
        'Database backup and JSON export utilities',
        'Integration credentials and webhook endpoints',
      ]}
      nextModule={{ name: 'System Diagnostics', path: '/status' }}
    />
  );
};

export default SettingsPage;

