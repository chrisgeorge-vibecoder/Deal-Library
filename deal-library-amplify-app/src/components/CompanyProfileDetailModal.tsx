'use client';

import React from 'react';
import { X, Building2, TrendingUp, TrendingDown, Minus, AlertTriangle, Bookmark, BookmarkCheck, Copy, Download, Printer, CheckCircle2 } from 'lucide-react';
import { CompanyProfile } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';
import { getStrategyCardStyle } from '@/data/strategyCardStyles';
import { HighlightedText } from './HighlightedText';

interface CompanyProfileDetailModalProps {
  profile: CompanyProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'company-profile', data: CompanyProfile }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export function CompanyProfileDetailModal({ profile, isOpen, onClose, onSaveCard, onUnsaveCard, isSaved }: CompanyProfileDetailModalProps) {
  const { handleCopyAsHTML, handleDownloadAsImage, handlePrint, isExporting, exportSuccess } = useCardExport();

  if (!isOpen || !profile) return null;

  const modalId = 'company-profile-modal-content';
  const filename = `company-profile-${profile.stockSymbol?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const style = getStrategyCardStyle('Company Profiles');

  const getTrendIcon = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive': return 'text-green-600 bg-white border-neutral-200';
      case 'negative': return 'text-red-600 bg-white border-neutral-200';
      default: return 'text-gray-600 bg-white border-neutral-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Colored Header */}
        <div className={`${style.headerBg} p-4 sm:rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-lg font-bold leading-tight">
                  {profile.companyInfo?.name} ({profile.stockSymbol})
                </h3>
                <p className="text-white/80 text-xs">{profile.companyInfo?.sector}</p>
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
                      ? 'bg-white text-[#2F4A7C]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isSaved(`company-profile-${profile.stockSymbol}`) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              )}
              <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Export Toolbar */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/20">
            <span className="text-xs text-white/70 font-medium mr-1">Export:</span>
            <button onClick={() => handleCopyAsHTML(`#${modalId}`)} disabled={isExporting}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded transition-colors disabled:opacity-50">
              {exportSuccess ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{exportSuccess ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={() => handleDownloadAsImage(`#${modalId}`, filename)} disabled={isExporting}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded transition-colors disabled:opacity-50">
              <Download className="w-3 h-3" /><span>Image</span>
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded transition-colors">
              <Printer className="w-3 h-3" /><span>Print</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div id={modalId} className="p-4 space-y-4 bg-white">
          
          {/* Section 1: Company Overview */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">💰</span>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Company Overview</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <h5 className="text-xs font-semibold text-[#2F4A7C] uppercase mb-0.5">Market Cap</h5>
                <div className="text-sm font-bold text-neutral-900">
                  <HighlightedText text={profile.companyInfo?.marketCap || 'N/A'} />
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <h5 className="text-xs font-semibold text-[#2F4A7C] uppercase mb-0.5">Stock Price</h5>
                <div className="text-sm font-bold text-neutral-900">
                  <HighlightedText text={profile.companyInfo?.recentPrice || 'N/A'} />
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-neutral-200">
                <h5 className="text-xs font-semibold text-neutral-600 uppercase mb-0.5">Recommendation</h5>
                <div className={`text-sm font-bold ${
                  profile.investmentOutlook?.recommendation?.toLowerCase().includes('buy')
                    ? 'text-green-600'
                    : profile.investmentOutlook?.recommendation?.toLowerCase().includes('sell')
                    ? 'text-red-600'
                    : 'text-neutral-700'
                }`}>
                  {profile.investmentOutlook?.recommendation || 'Hold'}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-2">
              {profile.recentPerformance?.keyMetrics?.slice(0, 3).map((metric, index) => (
                <div key={index} className={`p-2 rounded-lg border ${getTrendColor(metric.trend)}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold">{metric.metric}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="text-sm font-bold"><HighlightedText text={metric.value || ''} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Competitive Analysis */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">🏢</span>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Competitive Position</span>
            </div>
            
            <p className="text-sm text-neutral-600 leading-relaxed mb-2">{profile.competitiveAnalysis?.competitivePosition}</p>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-neutral-500">Market Share:</span>
              <span className="text-sm font-bold text-[#2F4A7C]">
                <HighlightedText text={profile.competitiveAnalysis?.marketShare || 'N/A'} />
              </span>
            </div>
            
            <div className="pt-2 border-t border-neutral-100">
              <h5 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Main Competitors</h5>
              <div className="grid grid-cols-3 gap-2">
                {profile.competitiveAnalysis?.mainCompetitors?.slice(0, 3).map((competitor, index) => (
                  <div key={index} className="bg-white p-2 rounded-lg border border-neutral-200">
                    <h6 className="font-semibold text-neutral-900 text-xs">{competitor.name}</h6>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{competitor.strength}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Investment Outlook */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-sm">🎯</span>
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Investment Outlook</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white border border-neutral-200 rounded-lg p-2">
                <h5 className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Strengths
                </h5>
                <ul className="space-y-0.5">
                  {profile.investmentOutlook?.strengths?.slice(0, 3).map((strength, index) => (
                    <li key={index} className="text-xs text-neutral-600 flex items-start gap-1">
                      <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="line-clamp-1">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-neutral-200 rounded-lg p-2">
                <h5 className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Risks
                </h5>
                <ul className="space-y-0.5">
                  {profile.investmentOutlook?.risks?.slice(0, 3).map((risk, index) => (
                    <li key={index} className="text-xs text-neutral-600 flex items-start gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                      <span className="line-clamp-1">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Growth Opportunities */}
            <div>
              <h5 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Growth Opportunities</h5>
              <div className="grid grid-cols-3 gap-2">
                {profile.growthOpportunities?.slice(0, 3).map((opp, index) => (
                  <div key={index} className="bg-white p-2 rounded-lg border border-neutral-200">
                    <h6 className="font-semibold text-neutral-900 text-xs mb-0.5">{opp.opportunity}</h6>
                    <p className="text-xs text-neutral-500 line-clamp-2">{opp.potential}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="pt-2 border-t border-neutral-100">
            <p className="text-xs text-neutral-400">
              <span className="font-semibold">Disclaimer:</span> AI-generated. Verify with official sources before making investment decisions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-4 py-3 sm:rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-400">AI-generated • {new Date().toLocaleDateString()}</div>
            <button onClick={onClose}
              className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
