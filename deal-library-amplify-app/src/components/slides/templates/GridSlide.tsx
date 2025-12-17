'use client';

import React from 'react';
import { LucideIcon, MoreHorizontal } from 'lucide-react';
import { formatMarkdownText, truncateWithMarkdown } from '../utils/formatText';

export interface GridItem {
  label: string;
  value: string;
  icon?: LucideIcon;
  color?: string;
  bgColor?: string;
}

export interface GridSlideContent {
  title: string;
  icon?: LucideIcon;
  accentColor?: string;
  items: GridItem[];
  columns?: 2 | 3 | 4;
  footer?: string;
}

interface GridSlideProps {
  content: GridSlideContent;
}

// Max items based on columns
const MAX_ITEMS_BY_COLUMNS: Record<number, number> = {
  2: 4,
  3: 6,
  4: 8,
};

// Max value length based on columns
const MAX_VALUE_LENGTH_BY_COLUMNS: Record<number, number> = {
  2: 150,
  3: 80,
  4: 60,
};

// Truncate text helper (plain version)
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
};

export default function GridSlide({ content }: GridSlideProps) {
  const { 
    title, 
    icon: Icon, 
    accentColor = '#1E40AF',
    items, 
    columns = 2,
    footer 
  } = content;

  const maxItems = MAX_ITEMS_BY_COLUMNS[columns] || 4;
  const maxValueLength = MAX_VALUE_LENGTH_BY_COLUMNS[columns] || 100;
  const visibleItems = items.slice(0, maxItems);
  const hasOverflow = items.length > maxItems;
  const remainingCount = items.length - maxItems;

  const getGridCols = () => {
    switch (columns) {
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      default: return 'grid-cols-2';
    }
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

      {/* Grid */}
      <div className={`flex-1 grid ${getGridCols()} gap-3`}>
        {visibleItems.map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <div 
              key={index}
              className="p-4 rounded-xl border-2"
              style={{ 
                backgroundColor: item.bgColor || '#F9FAFB',
                borderColor: item.color ? `${item.color}40` : '#E5E7EB'
              }}
            >
              <div className="flex items-start gap-2 mb-1">
                {ItemIcon && (
                  <ItemIcon 
                    className="w-4 h-4 flex-shrink-0" 
                    style={{ color: item.color || accentColor }}
                  />
                )}
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </div>
              <div 
                className="text-sm font-bold leading-snug"
                style={{ color: item.color || '#111827' }}
              >
                {formatMarkdownText(truncateWithMarkdown(item.value, maxValueLength))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overflow indicator */}
      {hasOverflow && (
        <div 
          className="mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-dashed"
          style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}08` }}
        >
          <MoreHorizontal className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-sm font-medium" style={{ color: accentColor }}>
            +{remainingCount} more item{remainingCount > 1 ? 's' : ''} in detail view
          </span>
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500 line-clamp-2">{footer}</p>
        </div>
      )}
    </div>
  );
}

