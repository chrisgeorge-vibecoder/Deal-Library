'use client';

import React from 'react';
import { LucideIcon, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { formatMarkdownText, truncateWithMarkdown } from '../utils/formatText';

export type ColumnType = 'bullets' | 'text' | 'do' | 'dont';

export interface ColumnContent {
  title: string;
  titleColor?: string;
  items?: string[];
  content?: string;
  type?: ColumnType;
}

export interface TwoColumnSlideContent {
  title: string;
  icon?: LucideIcon;
  accentColor?: string;
  leftColumn: ColumnContent;
  rightColumn: ColumnContent;
}

interface TwoColumnSlideProps {
  content: TwoColumnSlideContent;
}

// Max items per column to prevent overflow
const MAX_ITEMS_PER_COLUMN = 5;
const MAX_TEXT_LENGTH = 350;
const MAX_ITEM_LENGTH = 100;

// Truncate text helper (plain version)
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
};

export default function TwoColumnSlide({ content }: TwoColumnSlideProps) {
  const { 
    title, 
    icon: Icon, 
    accentColor = '#1E40AF',
    leftColumn, 
    rightColumn 
  } = content;

  const renderColumn = (column: ColumnContent) => {
    const { title: colTitle, titleColor, items, content: colContent, type = 'bullets' } = column;
    
    const getBgColor = () => {
      if (type === 'do') return 'bg-green-50 border-green-200';
      if (type === 'dont') return 'bg-red-50 border-red-200';
      return 'bg-gray-50 border-gray-200';
    };

    const getItemIcon = () => {
      if (type === 'do') return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />;
      if (type === 'dont') return <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />;
      return <div className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0 mt-2" />;
    };

    const getOverflowColor = () => {
      if (type === 'do') return { bg: 'bg-green-100', text: 'text-green-700' };
      if (type === 'dont') return { bg: 'bg-red-100', text: 'text-red-700' };
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    };

    // Limit items and track overflow
    const visibleItems = items?.slice(0, MAX_ITEMS_PER_COLUMN) || [];
    const hasItemOverflow = items && items.length > MAX_ITEMS_PER_COLUMN;
    const remainingItems = items ? items.length - MAX_ITEMS_PER_COLUMN : 0;
    const overflowColors = getOverflowColor();

    return (
      <div className={`flex-1 p-4 rounded-xl border-2 flex flex-col ${getBgColor()}`}>
        <h3 
          className="text-base font-bold mb-3"
          style={{ color: titleColor || '#111827' }}
        >
          {colTitle}
        </h3>
        
        {colContent && (
          <p className="text-gray-700 leading-relaxed text-sm">{formatMarkdownText(truncateWithMarkdown(colContent, MAX_TEXT_LENGTH))}</p>
        )}
        
        {visibleItems.length > 0 && (
          <ul className="space-y-2 flex-1">
            {visibleItems.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700 text-sm">
                {getItemIcon()}
                <span className="leading-relaxed">{formatMarkdownText(truncateWithMarkdown(item, MAX_ITEM_LENGTH))}</span>
              </li>
            ))}
          </ul>
        )}

        {hasItemOverflow && (
          <div className={`mt-2 flex items-center justify-center gap-1 py-1 text-xs font-medium rounded ${overflowColors.bg} ${overflowColors.text}`}>
            <MoreHorizontal className="w-3 h-3" />
            +{remainingItems} more
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top accent bar for consistency */}
      <div 
        className="h-1.5 w-full flex-shrink-0 -mt-10 -mx-10 mb-6" 
        style={{ backgroundColor: accentColor, width: 'calc(100% + 5rem)' }}
      />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Two columns */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        {renderColumn(leftColumn)}
        {renderColumn(rightColumn)}
      </div>
    </div>
  );
}

