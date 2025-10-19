import React from 'react';
import { X, Building2, TrendingUp, TrendingDown, Minus, DollarSign, Users, BarChart3, Target, AlertTriangle, Bookmark, BookmarkCheck } from 'lucide-react';
import { CompanyProfile } from '@/types/deal';

interface CompanyProfileDetailModalProps {
  profile: CompanyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'company-profile', data: CompanyProfile }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export function CompanyProfileDetailModal({ profile, isOpen, onClose, onSaveCard, onUnsaveCard, isSaved }: CompanyProfileDetailModalProps) {
  if (!isOpen || !profile) return null;

  const getTrendIcon = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-neutral-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-primary-600" />
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                {profile.companyInfo.name} ({profile.stockSymbol})
              </h3>
              <p className="text-sm text-neutral-600">{profile.companyInfo.sector}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSaveCard && onUnsaveCard && isSaved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSaved(`company-profile-${profile.stockSymbol}`)) {
                    onUnsaveCard(`company-profile-${profile.stockSymbol}`);
                  } else {
                    onSaveCard({ type: 'company-profile', data: profile });
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved(`company-profile-${profile.stockSymbol}`)
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-neutral-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isSaved(`company-profile-${profile.stockSymbol}`) ? 'Remove from saved' : 'Save card'}
              >
                {isSaved(`company-profile-${profile.stockSymbol}`) ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            )}
            <button onClick={(e) => {
              e.stopPropagation();
              onClose();
            }} className="p-2 rounded-full hover:bg-neutral-100 transition-colors">
              <X className="w-5 h-5 text-neutral-600" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Company Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Company Info</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-blue-700">Market Cap:</span>
                  <div className="font-medium text-blue-900">{profile.companyInfo.marketCap}</div>
                </div>
                <div>
                  <span className="text-sm text-blue-700">Stock Price:</span>
                  <div className="font-medium text-blue-900">{profile.companyInfo.recentPrice}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Performance</h4>
              </div>
              <p className="text-sm text-green-800 line-clamp-3">{profile.recentPerformance.earningsSummary}</p>
            </div>

            <div className={`rounded-lg p-6 ${profile.investmentOutlook.recommendation.toLowerCase().includes('buy') 
              ? 'bg-green-50 border border-green-200' 
              : profile.investmentOutlook.recommendation.toLowerCase().includes('sell')
              ? 'bg-red-50 border border-red-200'
              : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Recommendation</h4>
              </div>
              <div className={`text-lg font-bold ${
                profile.investmentOutlook.recommendation.toLowerCase().includes('buy') 
                  ? 'text-green-600' 
                  : profile.investmentOutlook.recommendation.toLowerCase().includes('sell')
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}>
                {profile.investmentOutlook.recommendation}
              </div>
            </div>
          </div>

          {/* Recent Performance */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Recent Performance
            </h4>
            
            <div className="mb-4">
              <p className="text-neutral-700 mb-4">{profile.recentPerformance.executiveSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.recentPerformance.keyMetrics.map((metric, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getTrendColor(metric.trend)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{metric.metric}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="text-lg font-semibold">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive Analysis */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" />
              Competitive Analysis
            </h4>
            
            <div className="mb-6">
              <p className="text-neutral-700 mb-2">{profile.competitiveAnalysis.competitivePosition}</p>
              <div>
                <span className="text-sm text-neutral-600">Market Share: </span>
                <span className="font-medium">{profile.competitiveAnalysis.marketShare}</span>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-neutral-900 mb-3">Main Competitors</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.competitiveAnalysis.mainCompetitors.map((competitor, index) => (
                  <div key={index} className="bg-neutral-50 rounded-lg p-4">
                    <h6 className="font-medium text-neutral-900 mb-2">{competitor.name}</h6>
                    <p className="text-sm text-neutral-600">{competitor.strength}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Growth Opportunities */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-600" />
              Growth Opportunities
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.growthOpportunities.map((opportunity, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h6 className="font-medium text-blue-900 mb-2">{opportunity.opportunity}</h6>
                  <p className="text-sm text-blue-800">{opportunity.potential}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Outlook */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Strengths
              </h4>
              <div className="space-y-3">
                {profile.investmentOutlook.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-neutral-700">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Risks
              </h4>
              <div className="space-y-3">
                {profile.investmentOutlook.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-neutral-700">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-sm font-bold">ℹ</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-1">Financial Analysis Disclaimer</h4>
                <p className="text-sm text-amber-700">
                  This company profile is generated using AI and may not reflect the most current information. 
                  Always verify with official financial documents and consult with financial advisors before 
                  making investment decisions. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-neutral-200 bg-neutral-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600">
              Generated by AI • {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
