import React from 'react';
import { AgentApplications } from '../agent/AgentApplications';

export const ApplicationsSub: React.FC<{ subPage?: string }> = ({ subPage = 'all' }) => {
  if (subPage === 'loans') return <AgentApplications forcedType="LOAN" />;
  if (subPage === 'insurance') return <AgentApplications forcedType="INSURANCE" />;
  if (subPage === 'investments') return <AgentApplications forcedType="INVESTMENT" />;
  return <AgentApplications />;
};
