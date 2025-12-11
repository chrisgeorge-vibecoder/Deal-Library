'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus, MoreHorizontal } from 'lucide-react';
import { formatMarkdownText, truncateWithMarkdown } from '../utils/formatText';

export interface StatItem {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: LucideIcon;
  color?: string;
}

export interface StatsSlideContent {
  title: string;
  icon?: LucideIcon;
  accentColor?: string;
  stats: StatItem[];
  summary?: string;
  layout?: 'row' | 'featured';
  featuredStat?: StatItem;
}

interface StatsSlideProps {
  content: StatsSlideContent;
}

// Max stats to show
const MAX_STATS = 6;
const MAX_SUMMARY_LENGTH = 200;

// Truncate text helper (plain version)
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
};

export default function StatsSlide({ content }: StatsSlideProps) {
  const { 
    title, 
    icon: Icon, 
    accentColor = '#1E40AF',
    stats, 
    summary,
    layout = 'row',
    featuredStat
  } = content;

  // Limit stats to prevent overflow
  const visibleStats = stats.slice(0, MAX_STATS);
  const hasOverflow = stats.length > MAX_STATS;
  const remainingCount = stats.length - MAX_STATS;

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const renderStatCard = (stat: StatItem, isFeatured = false) => {
    const StatIcon = stat.icon;
    return (
      <div 
        className={`p-3 rounded-xl border-2 ${isFeatured ? 'col-span-2 row-span-2' : ''}`}
        style={{ 
          borderColor: stat.color ? `${stat.color}40` : '#E5E7EB',
          backgroundColor: stat.color ? `${stat.color}08` : '#F9FAFB'
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          {StatIcon && (
            <StatIcon 
              className={`${isFeatured ? 'w-5 h-5' : 'w-3 h-3'}`}
              style={{ color: stat.color || accentColor }}
            />
          )}
          <span className={`font-medium text-gray-600 ${isFeatured ? 'text-sm' : 'text-xs'}`}>
            {stat.label}
          </span>
        </div>
        
        <div 
          className={`font-bold ${isFeatured ? 'text-3xl' : 'text-xl'}`}
          style={{ color: stat.color || '#111827' }}
        >
          {stat.value}
        </div>
        
        {stat.trendValue && (
          <div className="flex items-center gap-1 mt-1">
            {getTrendIcon(stat.trend)}
            <span className={`text-xs ${getTrendColor(stat.trend)}`}>
              {stat.trendValue}
            </span>
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

      {/* Summary */}
      {summary && (
        <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">{formatMarkdownText(truncateWithMarkdown(summary, MAX_SUMMARY_LENGTH))}</p>
      )}

      {/* Stats Grid */}
      <div className={`flex-1 ${
        layout === 'featured' && featuredStat
          ? 'grid grid-cols-3 gap-3'
          : 'grid grid-cols-3 gap-3'
      }`}>
        {layout === 'featured' && featuredStat && (
          <div className="row-span-2">
            {renderStatCard(featuredStat, true)}
          </div>
        )}
        {visibleStats.map((stat, index) => (
          <React.Fragment key={index}>
            {renderStatCard(stat)}
          </React.Fragment>
        ))}
      </div>

      {/* Overflow indicator */}
      {hasOverflow && (
        <div 
          className="mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-dashed"
          style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}08` }}
        >
          <MoreHorizontal className="w-4 h-4" style={{ color: accentColor }} />
          <span className="text-sm font-medium" style={{ color: accentColor }}>
            +{remainingCount} more stat{remainingCount > 1 ? 's' : ''} in detail view
          </span>
        </div>
      )}
    </div>
  );
}

