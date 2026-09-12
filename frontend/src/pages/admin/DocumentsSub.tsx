import React from 'react';
import { CustomerDocuments } from '../customer/CustomerDocuments';
import { VerificationCenter } from './VerificationCenter';

export const DocumentsSub: React.FC<{ subPage?: string }> = ({ subPage = 'all' }) => {
  if (subPage === 'verification') return <VerificationCenter />;
  return <CustomerDocuments />;
};
