import React, { useState } from 'react';
import { X, Building2, TrendingUp, TrendingDown, Minus, DollarSign, Users, BarChart3, Target, AlertTriangle, Bookmark, BookmarkCheck, Copy, Download, Printer, CheckCircle2, Presentation, FileText } from 'lucide-react';
import { CompanyProfile } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';
import { SlideView, SlideRenderer } from '@/components/slides';
import { generateCompanyProfileSlides } from '@/lib/slideConfigs';

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
  const [viewMode, setViewMode] = useState<'detail' | 'slides'>('detail');

  if (!isOpen || !profile) return null;

  const modalId = 'company-profile-modal-content';
  const filename = `company-profile-${profile.stockSymbol?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const slides = generateCompanyProfileSlides(profile);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-6xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-neutral-200 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="text-2xl font-bold text-neutral-900">
                  {profile.companyInfo.name} ({profile.stockSymbol})
                </h3>
                <p className="text-sm text-neutral-600 font-medium">{profile.companyInfo.sector}</p>
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

          {/* View Mode Toggle & Export Toolbar */}
          <div className="flex items-center justify-between px-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
              <button
                onClick={() => setViewMode('detail')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'detail' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Detail</span>
              </button>
              <button
                onClick={() => setViewMode('slides')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'slides' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Slides</span>
              </button>
            </div>

            {/* Export Buttons (only show in detail view) */}
            {viewMode === 'detail' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium mr-2">Export:</span>
                <button
                  onClick={() => handleCopyAsHTML(`#${modalId}`)}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Copy formatted content for PowerPoint/Google Slides"
                >
                  {exportSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{exportSuccess ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownloadAsImage(`#${modalId}`, filename)}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Download as high-quality image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Image</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  title="Print or save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Content */}
        {viewMode === 'slides' ? (
          <div className="flex-1 min-h-[500px]">
            <SlideView
              slides={slides}
              cardType="company-profile"
              cardTitle={`${profile.companyInfo?.name || 'Company'} (${profile.stockSymbol || 'N/A'})`}
            >
              {(slide) => <SlideRenderer slide={slide} slideIndex={slides.indexOf(slide)} />}
            </SlideView>
          </div>
        ) : (
        <div id={modalId} className="p-8 space-y-10">
          {/* Company Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-blue-900">Company Info</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-blue-700 font-medium">Market Cap:</span>
                  <div className="text-lg font-bold text-blue-900">{profile.companyInfo.marketCap}</div>
                </div>
                <div>
                  <span className="text-sm text-blue-700 font-medium">Stock Price:</span>
                  <div className="text-lg font-bold text-blue-900">{profile.companyInfo.recentPrice}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
                <h4 className="font-bold text-green-900">Performance</h4>
              </div>
              <p className="text-sm text-green-800 line-clamp-3 leading-relaxed">{profile.recentPerformance.earningsSummary}</p>
            </div>

            <div className={`rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow ${profile.investmentOutlook.recommendation.toLowerCase().includes('buy') 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300' 
              : profile.investmentOutlook.recommendation.toLowerCase().includes('sell')
              ? 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300'
              : 'bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300'}`}>
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-gray-600" />
                <h4 className="font-bold text-gray-900">Recommendation</h4>
              </div>
              <div className={`text-2xl font-bold ${
                profile.investmentOutlook.recommendation.toLowerCase().includes('buy') 
                  ? 'text-green-700' 
                  : profile.investmentOutlook.recommendation.toLowerCase().includes('sell')
                  ? 'text-red-700'
                  : 'text-gray-700'
              }`}>
                {profile.investmentOutlook.recommendation}
              </div>
            </div>
          </div>

          {/* Recent Performance */}
          <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 shadow-sm">
            <h4 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-3 pb-3 border-b-2 border-neutral-200">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              Recent Performance
            </h4>
            
            <div className="mb-6">
              <p className="text-neutral-700 leading-relaxed text-base">{profile.recentPerformance.executiveSummary}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {profile.recentPerformance.keyMetrics.map((metric, index) => (
                <div key={index} className={`p-5 rounded-xl border-2 shadow-sm hover:shadow-lg transition-shadow ${getTrendColor(metric.trend)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-base">{metric.metric}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive Analysis */}
          <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 shadow-sm">
            <h4 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-3 pb-3 border-b-2 border-neutral-200">
              <Users className="w-6 h-6 text-primary-600" />
              Competitive Analysis
            </h4>
            
            <div className="mb-8">
              <p className="text-neutral-700 mb-4 leading-relaxed">{profile.competitiveAnalysis.competitivePosition}</p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                <span className="text-sm text-blue-700 font-semibold">Market Share: </span>
                <span className="font-bold text-blue-900 text-lg">{profile.competitiveAnalysis.marketShare}</span>
              </div>
            </div>

            <div>
              <h5 className="text-base font-bold text-neutral-900 mb-4">Main Competitors</h5>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {profile.competitiveAnalysis.mainCompetitors.map((competitor, index) => (
                  <div key={index} className="bg-neutral-50 rounded-xl p-5 border-2 border-neutral-200 hover:shadow-lg transition-shadow">
                    <h6 className="font-bold text-neutral-900 mb-3">{competitor.name}</h6>
                    <p className="text-sm text-neutral-600 leading-relaxed">{competitor.strength}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Growth Opportunities */}
          <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 shadow-sm">
            <h4 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-3 pb-3 border-b-2 border-neutral-200">
              <Target className="w-6 h-6 text-primary-600" />
              Growth Opportunities
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {profile.growthOpportunities.map((opportunity, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <DollarSign className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <h6 className="font-bold text-blue-900">{opportunity.opportunity}</h6>
                  </div>
                  <p className="text-sm text-blue-800 leading-relaxed">{opportunity.potential}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Outlook */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 shadow-sm">
              <h4 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-3 pb-3 border-b-2 border-green-200">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Strengths
              </h4>
              <div className="space-y-4">
                {profile.investmentOutlook.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-neutral-700 leading-relaxed">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border-2 border-neutral-200 rounded-xl p-8 shadow-sm">
              <h4 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-3 pb-3 border-b-2 border-red-200">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Risks
              </h4>
              <div className="space-y-4">
                {profile.investmentOutlook.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-neutral-700 leading-relaxed">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-base font-bold">ℹ</span>
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-amber-900 mb-2">Financial Analysis Disclaimer</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  This company profile is generated using AI and may not reflect the most current information. 
                  Always verify with official financial documents and consult with financial advisors before 
                  making investment decisions. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

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
