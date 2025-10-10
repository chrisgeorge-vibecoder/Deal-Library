import React from 'react';
import { Users, TrendingUp, MapPin, Smartphone, DollarSign, Eye } from 'lucide-react';

export interface AudienceInsights {
  id: string;
  audienceName: string;
  sources?: Array<{ title: string; url?: string; note?: string }>;
  demographics: {
    ageRange: string;
    incomeRange: string;
    genderSplit: string;
    topLocations: string[];
  };
  behavior: {
    deviceUsage: {
      mobile: number;
      desktop: number;
      tablet: number;
    };
    peakHours: string[];
    purchaseFrequency: string;
    avgOrderValue: string;
  };
  insights: {
    keyCharacteristics: string[];
    interests: string[];
    painPoints: string[];
  };
  creativeGuidance?: {
    messagingTone: string;
    visualStyle: string;
    keyMessages: string[];
    avoidMessaging: string[];
  };
  mediaStrategy?: {
    preferredChannels: string[];
    optimalTiming: string[];
    creativeFormats: string[];
    targetingApproach: string;
  };
  sampleData?: boolean;
}

interface AudienceInsightsCardProps {
  insights: AudienceInsights;
  onClick?: () => void;
  onViewDetails?: () => void;
}

export default function AudienceInsightsCard({ insights, onClick, onViewDetails }: AudienceInsightsCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-neutral-900">{insights.audienceName || 'Audience Insights'}</h3>
        </div>
        {insights.sampleData && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            Sample Data
          </span>
        )}
      </div>

      {/* Demographics - Compact */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Age:</span>
            <span className="font-medium">{insights?.demographics?.ageRange || '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Income:</span>
            <span className="font-medium">{insights?.demographics?.incomeRange || '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Gender:</span>
            <span className="font-medium">{insights?.demographics?.genderSplit || '—'}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-neutral-400" />
            <span className="font-medium">{(insights?.demographics?.topLocations && insights.demographics.topLocations[0]) || 'Top locations vary'}</span>
          </div>
        </div>
      </div>

      {/* Behavior Highlights */}
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-500">Top device:</span>
            <span className="font-medium">
              {insights?.behavior?.deviceUsage?.mobile > 50 ? 'Mobile' : 
               insights?.behavior?.deviceUsage?.desktop > insights?.behavior?.deviceUsage?.tablet ? 'Desktop' : 'Tablet'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-neutral-400" />
            <span className="text-neutral-500">Purchase:</span>
            <span className="font-medium">{insights?.behavior?.purchaseFrequency || 'Varies'}</span>
          </div>
        </div>
      </div>

      {/* Key Insights - Only show first 2 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Key Insights</h4>
        <div className="space-y-1">
          {(insights?.insights?.keyCharacteristics || []).slice(0, 2).map((characteristic, index) => (
            <div key={index} className="text-xs text-neutral-600 flex items-start gap-1">
              <span className="text-primary-600 mt-0.5">•</span>
              <span>{characteristic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with View Details button */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>Peak: {(insights?.behavior?.peakHours && insights.behavior.peakHours[0]) || 'Varies'}</span>
          <span>AOV: {insights?.behavior?.avgOrderValue || '—'}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.();
          }}
          className="flex items-center gap-1 px-3 py-1 text-xs bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <Eye className="w-3 h-3" />
          View Details
        </button>
      </div>
    </div>
  );
}
