import React from 'react';
import { X, Target, Shield, AlertTriangle, TrendingUp, Bookmark, BookmarkCheck, CheckCircle, Copy, Download, Printer, CheckCircle2 } from 'lucide-react';
import { MarketingSWOT } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';

interface MarketingSWOTDetailModalProps {
  swot: MarketingSWOT | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'marketing-swot', data: MarketingSWOT }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export function MarketingSWOTDetailModal({ swot, isOpen, onClose, onSaveCard, onUnsaveCard, isSaved }: MarketingSWOTDetailModalProps) {
  const { handleCopyAsHTML, handleDownloadAsImage, handlePrint, isExporting, exportSuccess } = useCardExport();

  if (!isOpen || !swot) return null;

  const modalId = 'marketing-swot-modal-content';
  const filename = `marketing-swot-${swot.companyName?.replace(/[^a-zA-Z0-9]/g, '-')}`;

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
        className="relative bg-white rounded-lg shadow-xl w-full max-w-full sm:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-neutral-200 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary-600" />
              <h3 className="text-2xl font-bold text-neutral-900">
                Marketing SWOT Analysis: {swot.companyName}
              </h3>
            </div>
            <div className="flex items-center gap-2">
            {onSaveCard && onUnsaveCard && isSaved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSaved(`marketing-swot-${swot.companyName}`)) {
                    onUnsaveCard(`marketing-swot-${swot.companyName}`);
                  } else {
                    onSaveCard({ type: 'marketing-swot', data: swot });
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved(`marketing-swot-${swot.companyName}`)
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-neutral-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isSaved(`marketing-swot-${swot.companyName}`) ? 'Remove from saved' : 'Save card'}
              >
                {isSaved(`marketing-swot-${swot.companyName}`) ? (
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

          {/* Export Toolbar */}
          <div className="flex items-center gap-2 px-2">
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
        </div>

        {/* Modal Content */}
        <div id={modalId} className="p-8 space-y-10">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-8 shadow-sm">
            <h4 className="text-lg font-bold text-neutral-900 mb-4">Strategic Summary</h4>
            <p className="text-neutral-700 leading-relaxed text-base">{swot.summary}</p>
          </div>

          {/* SWOT Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strengths */}
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <Shield className="w-6 h-6 text-green-600" />
                <h4 className="text-lg font-bold text-green-800">Strengths</h4>
              </div>
              <div className="space-y-4">
                {swot.swot.strengths.map((strength, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <h5 className="font-bold text-green-900 mb-2">{strength.title}</h5>
                    <p className="text-sm text-green-800 leading-relaxed">{strength.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h4 className="text-lg font-bold text-red-800">Weaknesses</h4>
              </div>
              <div className="space-y-4">
                {swot.swot.weaknesses.map((weakness, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                    <h5 className="font-bold text-red-900 mb-2">{weakness.title}</h5>
                    <p className="text-sm text-red-800 leading-relaxed">{weakness.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-bold text-blue-800">Opportunities</h4>
              </div>
              <div className="space-y-4">
                {swot.swot.opportunities.map((opportunity, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <h5 className="font-bold text-blue-900 mb-2">{opportunity.title}</h5>
                    <p className="text-sm text-blue-800 leading-relaxed">{opportunity.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Threats */}
            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h4 className="text-lg font-bold text-orange-800">Threats</h4>
              </div>
              <div className="space-y-4">
                {swot.swot.threats.map((threat, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                    <h5 className="font-bold text-orange-900 mb-2">{threat.title}</h5>
                    <p className="text-sm text-orange-800 leading-relaxed">{threat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-gradient-to-r from-gray-50 to-neutral-50 rounded-xl border-2 border-neutral-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-primary-600" />
              <h4 className="text-lg font-bold text-neutral-900">Recommended Actions</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {swot.recommendedActions.map((action, index) => (
                <div key={index} className="bg-white rounded-xl p-5 border-2 border-neutral-300 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed font-medium">{action}</p>
                  </div>
                </div>
              ))}
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
                <h4 className="text-base font-bold text-amber-900 mb-2">Analysis Disclaimer</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  This Marketing SWOT analysis is generated using AI and may not be current or complete. 
                  It should be used as a starting point for strategic planning and should be validated with 
                  additional research and internal analysis.
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
