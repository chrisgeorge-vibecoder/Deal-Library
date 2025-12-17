'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { formatMarkdownText, truncateWithMarkdown } from '../utils/formatText';

export interface TitleSlideContent {
  title: string;
  subtitle?: string;
  category?: string;
  icon?: LucideIcon;
  accentColor?: string;
  stats?: Array<{ label: string; value: string }>;
  footer?: string;
}

interface TitleSlideProps {
  content: TitleSlideContent;
}

// Max lengths to prevent overflow
const MAX_TITLE_LENGTH = 80;
const MAX_SUBTITLE_LENGTH = 250;
const MAX_STATS = 4;

// Truncate text helper (plain version)
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
};

export default function TitleSlide({ content }: TitleSlideProps) {
  const { title, subtitle, category, icon: Icon, accentColor = '#1E40AF', stats, footer } = content;

  // Limit stats to prevent overflow
  const visibleStats = stats?.slice(0, MAX_STATS) || [];

  return (
    <div className="flex flex-col h-full">
      {/* Header accent bar - thicker for better visibility */}
      <div 
        className="h-3 w-full flex-shrink-0" 
        style={{ backgroundColor: accentColor }}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-4">
        {/* Icon */}
        {Icon && (
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon 
              className="w-7 h-7" 
              style={{ color: accentColor }}
            />
          </div>
        )}

        {/* Category badge */}
        {category && (
          <span 
            className="px-4 py-1 rounded-full text-sm font-medium mb-3"
            style={{ 
              backgroundColor: `${accentColor}15`,
              color: accentColor 
            }}
          >
            {category}
          </span>
        )}

        {/* Title - with truncation */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3 max-w-4xl leading-tight">
          {truncateText(title, MAX_TITLE_LENGTH)}
        </h1>

        {/* Subtitle - with truncation and line clamping */}
        {subtitle && (
          <p className="text-lg text-gray-600 max-w-3xl leading-relaxed line-clamp-4">
            {formatMarkdownText(truncateWithMarkdown(subtitle, MAX_SUBTITLE_LENGTH))}
          </p>
        )}

        {/* Stats row */}
        {visibleStats.length > 0 && (
          <div className="flex items-center gap-6 mt-6">
            {visibleStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: accentColor }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="text-center pb-3 flex-shrink-0">
          <p className="text-xs text-gray-400">{formatMarkdownText(footer)}</p>
        </div>
      )}
    </div>
  );
}

