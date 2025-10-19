import React from 'react';
import { X, Target, Shield, AlertTriangle, TrendingUp, Bookmark, BookmarkCheck, CheckCircle } from 'lucide-react';
import { MarketingSWOT } from '@/types/deal';

interface MarketingSWOTDetailModalProps {
  swot: MarketingSWOT | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'marketing-swot', data: MarketingSWOT }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export function MarketingSWOTDetailModal({ swot, isOpen, onClose, onSaveCard, onUnsaveCard, isSaved }: MarketingSWOTDetailModalProps) {
  if (!isOpen || !swot) return null;

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
        className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-neutral-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-primary-600" />
            <h3 className="text-xl font-semibold text-neutral-900">
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

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-neutral-900 mb-3">Strategic Summary</h4>
            <p className="text-neutral-700 leading-relaxed">{swot.summary}</p>
          </div>

          {/* SWOT Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-semibold text-green-800">Strengths</h4>
              </div>
              <div className="space-y-4">
                {swot.swot.strengths.map((strength, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-green-100">
                    <h5 className="font-medium text-green-900 mb-2">{strength.title}</h5>
                    <p className="text-sm text-green-800">{strength.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="text-lg font-semibold text-red-800">Weaknesses</h4>
              </div>
              <div className="space-y-4">
                {swot.swot.weaknesses.map((weakness, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-red-100">
                    <h5 className="font-medium text-red-900 mb-2">{weakness.title}</h5>
                    <p className="text-sm text-red-800">{weakness.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-semibold text-blue-800">Opportunities</h4>
              </div>
              <div className="space-y-4">
                {swot.swot.opportunities.map((opportunity, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                    <h5 className="font-medium text-blue-900 mb-2">{opportunity.title}</h5>
                    <p className="text-sm text-blue-800">{opportunity.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Threats */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h4 className="text-lg font-semibold text-orange-800">Threats</h4>
              </div>
              <div className="space-y-4">
                {swot.swot.threats.map((threat, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-100">
                    <h5 className="font-medium text-orange-900 mb-2">{threat.title}</h5>
                    <p className="text-sm text-orange-800">{threat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-gradient-to-r from-gray-50 to-neutral-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-primary-600" />
              <h4 className="text-lg font-semibold text-neutral-900">Recommended Actions</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {swot.recommendedActions.map((action, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-neutral-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-neutral-700">{action}</p>
                  </div>
                </div>
              ))}
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
                <h4 className="text-sm font-semibold text-amber-800 mb-1">Analysis Disclaimer</h4>
                <p className="text-sm text-amber-700">
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
