'use client';

import React from 'react';
import { Shield, AlertTriangle, TrendingUp, LucideIcon, MoreHorizontal } from 'lucide-react';
import { formatMarkdownText, truncateWithMarkdown } from '../utils/formatText';

export interface SWOTItem {
  title: string;
  description: string;
}

export interface SWOTSlideContent {
  companyName?: string;
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
}

interface SWOTSlideProps {
  content: SWOTSlideContent;
}

// Max items per quadrant
const MAX_ITEMS_PER_QUADRANT = 3;

// Truncate text helper (plain version)
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
};

export default function SWOTSlide({ content }: SWOTSlideProps) {
  const { companyName, strengths, weaknesses, opportunities, threats } = content;

  const renderQuadrant = (
    items: SWOTItem[], 
    title: string, 
    bgColor: string,
    borderColor: string,
    textColor: string,
    Icon: LucideIcon
  ) => {
    const visibleItems = items.slice(0, MAX_ITEMS_PER_QUADRANT);
    const hasMore = items.length > MAX_ITEMS_PER_QUADRANT;
    const remainingCount = items.length - MAX_ITEMS_PER_QUADRANT;
    
    return (
      <div 
        className="p-3 rounded-xl border-2 flex flex-col"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-4 h-4" style={{ color: textColor }} />
          <h3 className="font-bold text-sm" style={{ color: textColor }}>{title}</h3>
          <span className="text-xs opacity-70" style={{ color: textColor }}>({items.length})</span>
        </div>
        <div className="space-y-1.5 flex-1">
          {visibleItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-2 border border-gray-100">
              <h4 className="font-semibold text-gray-900 text-xs mb-0.5">{truncateText(item.title, 40)}</h4>
              <p className="text-xs text-gray-600 leading-snug line-clamp-2">{formatMarkdownText(truncateWithMarkdown(item.description, 100))}</p>
            </div>
          ))}
        </div>
        {hasMore && (
          <div 
            className="mt-1.5 flex items-center justify-center gap-1 py-1 text-xs font-medium rounded"
            style={{ backgroundColor: `${textColor}15`, color: textColor }}
          >
            <MoreHorizontal className="w-3 h-3" />
            +{remainingCount} more
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top accent bar for consistency - indigo for SWOT */}
      <div 
        className="h-1.5 w-full flex-shrink-0 -mt-10 -mx-10 mb-4" 
        style={{ backgroundColor: '#6366F1', width: 'calc(100% + 5rem)' }}
      />
      
      {/* Header */}
      <div className="flex items-center justify-center mb-3">
        <h2 className="text-xl font-bold text-gray-900">
          SWOT Analysis{companyName ? `: ${truncateText(companyName, 30)}` : ''}
        </h2>
      </div>

      {/* SWOT Grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3">
        {/* Strengths - Top Left */}
        {renderQuadrant(
          strengths,
          'Strengths',
          '#ECFDF5', // green-50
          '#86EFAC', // green-300
          '#166534', // green-800
          Shield
        )}

        {/* Weaknesses - Top Right */}
        {renderQuadrant(
          weaknesses,
          'Weaknesses',
          '#FEF2F2', // red-50
          '#FCA5A5', // red-300
          '#991B1B', // red-800
          AlertTriangle
        )}

        {/* Opportunities - Bottom Left */}
        {renderQuadrant(
          opportunities,
          'Opportunities',
          '#EFF6FF', // blue-50
          '#93C5FD', // blue-300
          '#1E40AF', // blue-800
          TrendingUp
        )}

        {/* Threats - Bottom Right */}
        {renderQuadrant(
          threats,
          'Threats',
          '#FFF7ED', // orange-50
          '#FDBA74', // orange-300
          '#9A3412', // orange-800
          AlertTriangle
        )}
      </div>
    </div>
  );
}

