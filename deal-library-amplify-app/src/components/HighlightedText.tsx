'use client';

import React from 'react';
import { formatWithHighlights } from '@/data/strategyCardStyles';

interface HighlightedTextProps {
  text: string;
  className?: string;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, className = '' }) => {
  if (!text) return null;
  
  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: formatWithHighlights(text) }}
    />
  );
};

export default HighlightedText;

