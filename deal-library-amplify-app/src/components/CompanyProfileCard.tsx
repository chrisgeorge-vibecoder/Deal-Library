import React from 'react';
import { Building2, TrendingUp, DollarSign, Users } from 'lucide-react';
import { CompanyProfile } from '@/types/deal';

interface CompanyProfileCardProps {
  profile: CompanyProfile;
  onClick?: () => void;
  onViewDetails?: () => void;
}

export default function CompanyProfileCard({ profile, onClick, onViewDetails }: CompanyProfileCardProps) {
  const getTrendIcon = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive':
        return '↗️';
      case 'negative':
        return '↘️';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div 
      className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600" />
          <div>
            <h3 className="font-semibold text-neutral-900">{profile.stockSymbol}</h3>
            <p className="text-xs text-neutral-500">{profile.companyInfo.name}</p>
          </div>
        </div>
        {profile.sampleData && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
            Sample Data
          </span>
        )}
      </div>

      {/* Company Info */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Sector:</span>
            <span className="font-medium">{profile.companyInfo.sector}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Price:</span>
            <span className="font-medium">{profile.companyInfo.recentPrice}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-neutral-400" />
            <span className="font-medium">{profile.companyInfo.marketCap}</span>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Recent Performance</h4>
        <p className="text-xs text-neutral-600 line-clamp-2">{profile.recentPerformance.executiveSummary}</p>
        
        <div className="mt-2 space-y-1">
          {profile.recentPerformance.keyMetrics.slice(0, 2).map((metric, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">{metric.metric}</span>
              <div className="flex items-center gap-1">
                <span className={getTrendColor(metric.trend)}>{metric.value}</span>
                <span>{getTrendIcon(metric.trend)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Position */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Competitive Position</h4>
        <p className="text-xs text-neutral-600 line-clamp-1">{profile.competitiveAnalysis.competitivePosition}</p>
        <div className="mt-1">
          <span className="text-xs text-neutral-500">Market Share: </span>
          <span className="text-xs font-medium">{profile.competitiveAnalysis.marketShare}</span>
        </div>
      </div>

      {/* Growth Opportunities Preview */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-neutral-700 mb-2">Top Opportunities</h4>
        <div className="space-y-1">
          {profile.growthOpportunities.slice(0, 2).map((opp, index) => (
            <div key={index} className="text-xs text-neutral-600 flex items-start gap-1">
              <span className="text-primary-600 mt-0.5">•</span>
              <span>{opp.opportunity}</span>
            </div>
          ))}
          {profile.growthOpportunities.length > 2 && (
            <div className="text-xs text-neutral-500">+{profile.growthOpportunities.length - 2} more opportunities</div>
          )}
        </div>
      </div>

      {/* Investment Recommendation */}
      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-xs text-brand-gold">
          <TrendingUp className="w-3 h-3" />
          <span>Financial analysis</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded ${
            profile.investmentOutlook.recommendation.toLowerCase().includes('buy') 
              ? 'bg-green-100 text-green-800'
              : profile.investmentOutlook.recommendation.toLowerCase().includes('sell')
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {profile.investmentOutlook.recommendation.split(' ')[0]}
          </span>
          
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
    </div>
  );
}
