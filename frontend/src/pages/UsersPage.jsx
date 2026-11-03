import React from 'react';
import ModulePlaceholder from './ModulePlaceholder';

export const UsersPage = () => {
  return (
    <ModulePlaceholder
      moduleNumber={8}
      title="User & Access Management"
      subtitle="Role-based access controls for psychologists, psychometrists, and clinic administrators."
      description="Enforces strict separation of duties, ensuring only authorized clinical staff access protected health information, clinical notes, and psychological interpretation reports."
      features={[
        'Role definitions (Admin, Psychologist, Psychometrist)',
        'Granular permissions on clinical notes & reports',
        'Audit logs for patient record access',
        'Secure bcrypt-hashed authentication',
        'Session expiry & security monitoring',
      ]}
      nextModule={{ name: 'Clinic Settings', path: '/settings' }}
    />
  );
};

export default UsersPage;

