import React from 'react';
import { AgentCustomers } from '../agent/AgentCustomers';
import { VerificationCenter } from './VerificationCenter';

export const CustomersSub: React.FC<{ subPage?: string }> = ({ subPage = 'all' }) => {
  if (subPage === 'verification') {
    return <VerificationCenter />;
  }
  return <AgentCustomers />;
};
