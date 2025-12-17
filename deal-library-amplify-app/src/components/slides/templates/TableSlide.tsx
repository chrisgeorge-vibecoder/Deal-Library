'use client';

import React from 'react';
import { LucideIcon, MoreHorizontal } from 'lucide-react';
import { formatMarkdownText, truncateWithMarkdown } from '../utils/formatText';

export interface TableRow {
  cells: string[];
  highlight?: boolean;
  tag?: string;
  tagColor?: string;
}

export interface TableSlideContent {
  title: string;
  icon?: LucideIcon;
  accentColor?: string;
  headers: string[];
  rows: TableRow[];
  footer?: string;
}

interface TableSlideProps {
  content: TableSlideContent;
}

// Max rows to prevent overflow
const MAX_ROWS = 8;
const MAX_CELL_LENGTH = 60;

// Truncate text helper (plain version)
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
};

export default function TableSlide({ content }: TableSlideProps) {
  const { 
    title, 
    icon: Icon, 
    accentColor = '#1E40AF',
    headers, 
    rows,
    footer 
  } = content;

  // Limit rows to prevent overflow
  const visibleRows = rows.slice(0, MAX_ROWS);
  const hasOverflow = rows.length > MAX_ROWS;
  const remainingCount = rows.length - MAX_ROWS;

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

      {/* Table */}
      <div className="flex-1">
        <table className="w-full">
          <thead>
            <tr 
              className="border-b-2"
              style={{ borderColor: accentColor }}
            >
              {headers.map((header, index) => (
                <th 
                  key={index}
                  className="px-3 py-2 text-left text-xs font-bold text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={`border-b border-gray-200 ${
                  row.highlight ? 'bg-blue-50' : rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {row.cells.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex}
                    className="px-3 py-2 text-xs text-gray-700"
                  >
                    {formatMarkdownText(truncateWithMarkdown(cell, MAX_CELL_LENGTH))}
                    {cellIndex === row.cells.length - 1 && row.tag && (
                      <span 
                        className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${row.tagColor || '#22C55E'}20`,
                          color: row.tagColor || '#22C55E'
                        }}
                      >
                        {row.tag}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Overflow indicator */}
      {hasOverflow && (
        <div 
          className="mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-dashed"
          style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}08` }}
        >
          <MoreHorizontal className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-sm font-medium" style={{ color: accentColor }}>
            +{remainingCount} more row{remainingCount > 1 ? 's' : ''} in detail view
          </span>
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">{footer}</p>
        </div>
      )}
    </div>
  );
}

