'use client';

import React from 'react';
import { VotesProvider } from './VotesProvider';

export default function VotesProviderWrapper({
  stage,
  children,
}: {
  stage: 'group' | 'ro16' | 'qf' | 'sf' | 'final';
  children: React.ReactNode;
}) {
  // For the "group" stage we don't need a votes provider — avoid calling Firestore at all.
  if (stage === 'group') {
    return <>{children}</>;
  }

  // Only render VotesProvider for the stages that have predictions docs
  // (ro16, qf, sf, final).
  return <VotesProvider stage={stage as 'ro16' | 'qf' | 'sf' | 'final'}>{children}</VotesProvider>;
}
