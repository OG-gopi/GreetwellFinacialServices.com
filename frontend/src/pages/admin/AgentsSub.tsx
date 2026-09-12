import React from 'react';
import { AgentManagement } from './AgentManagement';
import { VerificationCenter } from './VerificationCenter';

export const AgentsSub: React.FC<{ subPage?: string }> = ({ subPage = 'manage' }) => {
  if (subPage === 'verification') {
    return <VerificationCenter />;
  }
  return <AgentManagement />;
};
