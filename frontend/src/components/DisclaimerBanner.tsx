import React from 'react';

const DisclaimerBanner: React.FC = () => (
  <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
    <span className="flex-shrink-0 mt-0.5">⚠️</span>
    <span>
      AI-generated documents are for informational purposes only and must be reviewed by a qualified
      advocate enrolled with the{' '}
      <strong>Bar Council of Maharashtra &amp; Goa</strong> before use in any legal proceedings.
    </span>
  </div>
);

export default DisclaimerBanner;
