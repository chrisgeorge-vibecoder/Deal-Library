import React from 'react';
import { BarChart3, TrendingUp, Users, Target, Globe } from 'lucide-react';

export interface MarketSizing {
  id: string;
  marketName: string;
  sources?: Array<{ title: string; url?: string; note?: string }>;
  totalMarketSize: string;
  growthRate: string;
  addressableMarket: string;
  addressableValue: string;
  demographics: {
    population: string;
    targetAge: string;
    penetration: string;
  };
  growthTrends: {
    growthRate: string;
    seasonality: string;
    keyOpportunities: string[];
  };
  marketInsights: {
    keyDrivers: string[];
    barriers: string[];
    opportunities: string[];
  };
  sampleData?: boolean;
}

interface MarketSizingCardProps {
  sizing: MarketSizing;
  onClick?: () => void;
  onViewDetails?: () => void;
}

export default function MarketSizingCard({ sizing, onClick, onViewDetails }: MarketSizingCardProps) {
  return (
    <div 
      className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-neutral-900">{sizing.marketName}</h3>
        </div>
        {sizing.sampleData && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            Sample Data
          </span>
        )}
      </div>

      {/* Market Size */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-neutral-700">Total Market Size</h4>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>{sizing.growthRate}</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-neutral-900 mb-1">
          {sizing.totalMarketSize}
        </div>
        <div className="text-xs text-neutral-500">
          Annual market size
        </div>
      </div>

      {/* Addressable Market */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-neutral-700">Addressable Market</h4>
          <span className="text-xs text-neutral-500">{sizing.addressableMarket}</span>
        </div>
        <div className="text-lg font-semibold text-primary-600 mb-1">
          {sizing.addressableValue}
        </div>
        <div className="text-xs text-neutral-500">
          Target market segment
        </div>
      </div>

      {/* Demographics */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Target Demographics</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-500">Population:</span>
          </div>
          <span className="font-medium">{sizing.demographics.population}</span>
          
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-500">Target:</span>
          </div>
          <span className="font-medium">{sizing.demographics.targetAge}</span>
          
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-500">Penetration:</span>
          </div>
          <span className="font-medium">{sizing.demographics.penetration}</span>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Growth Trends</h4>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Growth Rate:</span>
            <span className="font-medium text-green-600">{sizing.growthTrends.growthRate}</span>
          </div>
          <div className="text-xs text-neutral-600">
            <span className="text-neutral-500">Seasonality:</span> {sizing.growthTrends.seasonality}
          </div>
        </div>
      </div>

      {/* Key Opportunities */}
      <div>
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Key Opportunities</h4>
        <div className="space-y-1">
          {sizing.growthTrends.keyOpportunities.slice(0, 2).map((opportunity, index) => (
            <div key={index} className="text-xs text-neutral-600 flex items-start gap-1">
              <span className="text-primary-600 mt-0.5">•</span>
              <span>{opportunity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-neutral-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <BarChart3 className="w-3 h-3" />
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
}
