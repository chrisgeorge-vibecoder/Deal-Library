'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ListItem {
  title?: string;
  content: string;
  tag?: string;
  tagColor?: string;
}

export interface ListSlideContent {
  title: string;
  icon?: LucideIcon;
  accentColor?: string;
  items: ListItem[];
  numbered?: boolean;
  twoColumn?: boolean;
  header?: string;
}

interface ListSlideProps {
  content: ListSlideContent;
}

export default function ListSlide({ content }: ListSlideProps) {
  const { 
    title, 
    icon: Icon, 
    accentColor = '#1E40AF',
    items, 
    numbered = false,
    twoColumn = false,
    header
  } = content;

  const renderItem = (item: ListItem, index: number) => (
    <div 
      key={index}
      className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200"
    >
      {/* Number or bullet */}
      {numbered ? (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {index + 1}
        </div>
      ) : (
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Content */}
      <div className="flex-1">
        {item.title && (
          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
        )}
        <p className="text-gray-700 leading-relaxed">{item.content}</p>
      </div>

      {/* Tag */}
      {item.tag && (
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium flex-shrink-0"
          style={{ 
            backgroundColor: `${item.tagColor || accentColor}20`,
            color: item.tagColor || accentColor
          }}
        >
          {item.tag}
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* Optional header text */}
      {header && (
        <p className="text-gray-600 mb-4 leading-relaxed">{header}</p>
      )}

      {/* List - no overflow, content should be split across slides */}
      <div className={`flex-1 ${twoColumn ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </div>
  );
}

