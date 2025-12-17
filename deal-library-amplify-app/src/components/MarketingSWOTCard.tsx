import React from 'react';
import { Target, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { MarketingSWOT } from '@/types/deal';

interface MarketingSWOTCardProps {
  swot: MarketingSWOT;
  onClick?: () => void;
  onViewDetails?: () => void;
}

export default function MarketingSWOTCard({ swot, onClick, onViewDetails }: MarketingSWOTCardProps) {
  return (
    <div 
      className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-neutral-900">{swot.companyName} Marketing SWOT</h3>
        </div>
        {swot.sampleData && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            Sample Data
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="mb-4">
        <p className="text-sm text-neutral-600 line-clamp-2">{swot.summary}</p>
      </div>

      {/* SWOT Preview */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-2">
            <Shield className="w-3 h-3 text-green-600" />
            <span className="font-medium text-green-800">Strengths</span>
          </div>
          <div className="space-y-1">
            {swot.swot.strengths.slice(0, 2).map((strength, index) => (
              <div key={index} className="text-green-700">
                <div className="font-medium">{strength.title}</div>
              </div>
            ))}
            {swot.swot.strengths.length > 2 && (
              <div className="text-green-600">+{swot.swot.strengths.length - 2} more</div>
            )}
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-2">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            <span className="font-medium text-red-800">Weaknesses</span>
          </div>
          <div className="space-y-1">
            {swot.swot.weaknesses.slice(0, 2).map((weakness, index) => (
              <div key={index} className="text-red-700">
                <div className="font-medium">{weakness.title}</div>
              </div>
            ))}
            {swot.swot.weaknesses.length > 2 && (
              <div className="text-red-600">+{swot.swot.weaknesses.length - 2} more</div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp className="w-3 h-3 text-blue-600" />
            <span className="font-medium text-blue-800">Opportunities</span>
          </div>
          <div className="space-y-1">
            {swot.swot.opportunities.slice(0, 2).map((opportunity, index) => (
              <div key={index} className="text-blue-700">
                <div className="font-medium">{opportunity.title}</div>
              </div>
            ))}
            {swot.swot.opportunities.length > 2 && (
              <div className="text-blue-600">+{swot.swot.opportunities.length - 2} more</div>
            )}
          </div>
        </div>

        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-2">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            <span className="font-medium text-orange-800">Threats</span>
          </div>
          <div className="space-y-1">
            {swot.swot.threats.slice(0, 2).map((threat, index) => (
              <div key={index} className="text-orange-700">
                <div className="font-medium">{threat.title}</div>
              </div>
            ))}
            {swot.swot.threats.length > 2 && (
              <div className="text-orange-600">+{swot.swot.threats.length - 2} more</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 mt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-xs text-brand-gold">
          <Target className="w-3 h-3" />
          <span>Marketing strategy analysis</span>
        </div>
        
        {onViewDetails && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
