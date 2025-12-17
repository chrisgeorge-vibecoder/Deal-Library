'use client';

import React from 'react';
import { X, Target, Shield, AlertTriangle, TrendingUp, Bookmark, BookmarkCheck, CheckCircle, Copy, Download, Printer, CheckCircle2 } from 'lucide-react';
import { MarketingSWOT } from '@/types/deal';
import { useCardExport } from '@/hooks/useCardExport';
import { getStrategyCardStyle } from '@/data/strategyCardStyles';

interface MarketingSWOTDetailModalProps {
  swot: MarketingSWOT | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'marketing-swot', data: MarketingSWOT }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

// Helper to extract text from SWOT items (handles both string[] and {title, description}[] formats)
function extractSwotItems(items: any[] | undefined): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      // Handle {title, description} format
      if (item.title && item.description) {
        return `${item.title}: ${item.description}`;
      }
      return item.title || item.description || item.text || JSON.stringify(item);
    }
    return String(item);
  });
}

export function MarketingSWOTDetailModal({ swot, isOpen, onClose, onSaveCard, onUnsaveCard, isSaved }: MarketingSWOTDetailModalProps) {
  const { handleCopyAsHTML, handleDownloadAsImage, handlePrint, isExporting, exportSuccess } = useCardExport();

  if (!isOpen || !swot) return null;
  
  // Handle both nested (swot.swot.strengths) and flat (swot.strengths) data structures
  const swotData = swot.swot || swot;
  const strengths = extractSwotItems(swotData.strengths || swot.strengths);
  const weaknesses = extractSwotItems(swotData.weaknesses || swot.weaknesses);
  const opportunities = extractSwotItems(swotData.opportunities || swot.opportunities);
  const threats = extractSwotItems(swotData.threats || swot.threats);

  const modalId = 'marketing-swot-modal-content';
  const filename = `marketing-swot-${swot.companyName?.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const style = getStrategyCardStyle('Marketing SWOT');

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
        <div className={`${style.headerBg} p-6 sm:rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl sm:text-2xl font-bold">{swot.companyName}</h3>
                <p className="text-white/80 text-sm">Marketing SWOT Analysis</p>
              </div>
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
                      ? 'bg-white text-fuchsia-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isSaved(`marketing-swot-${swot.companyName}`) ? (
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
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
            <span className="text-xs text-white/70 font-medium mr-2">Export:</span>
            <button onClick={() => handleCopyAsHTML(`#${modalId}`)} disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50">
              {exportSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{exportSuccess ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={() => handleDownloadAsImage(`#${modalId}`, filename)} disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50">
              <Download className="w-3.5 h-3.5" /><span>Image</span>
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors">
              <Printer className="w-3.5 h-3.5" /><span>Print</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div id={modalId} className="p-6 space-y-6">
          
          {/* SWOT Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {strengths.slice(0, 4).map((strength, index) => (
                  <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{strength}</span>
                  </li>
                ))}
                {strengths.length === 0 && (
                  <li className="text-sm text-neutral-400 italic">No strengths data available</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-900">Weaknesses</h4>
              </div>
              <ul className="space-y-2">
                {weaknesses.slice(0, 4).map((weakness, index) => (
                  <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{weakness}</span>
                  </li>
                ))}
                {weaknesses.length === 0 && (
                  <li className="text-sm text-neutral-400 italic">No weaknesses data available</li>
                )}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Opportunities</h4>
              </div>
              <ul className="space-y-2">
                {opportunities.slice(0, 4).map((opportunity, index) => (
                  <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{opportunity}</span>
                  </li>
                ))}
                {opportunities.length === 0 && (
                  <li className="text-sm text-neutral-400 italic">No opportunities data available</li>
                )}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-amber-900">Threats</h4>
              </div>
              <ul className="space-y-2">
                {threats.slice(0, 4).map((threat, index) => (
                  <li key={index} className="text-sm text-neutral-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{threat}</span>
                  </li>
                ))}
                {threats.length === 0 && (
                  <li className="text-sm text-neutral-400 italic">No threats data available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Strategic Recommendations */}
          {(swot.recommendedActions || swot.recommendations) && (swot.recommendedActions || swot.recommendations)!.length > 0 && (
            <div className={`${style.bg} border ${style.border} rounded-xl p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <Target className={`w-5 h-5 ${style.text}`} />
                <h4 className={`font-semibold ${style.text}`}>Strategic Recommendations</h4>
              </div>
              <div className="space-y-3">
                {(swot.recommendedActions || swot.recommendations)!.slice(0, 4).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/50 p-3 rounded-lg">
                    <div className={`w-6 h-6 ${style.headerBg} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                      {index + 1}
                    </div>
                    <span className="text-neutral-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {swot.sources && swot.sources.length > 0 && (
            <div className="pt-4 border-t border-neutral-200">
              <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Sources</h4>
              <div className="space-y-1">
                {swot.sources.map((src, idx) => (
                  <div key={idx} className="text-xs text-neutral-600 flex items-center gap-2">
                    <span className="text-neutral-400">•</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-fuchsia-600 hover:underline">
                        {src.title || src.url}
                      </a>
                    ) : (
                      <span>{src.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-6 py-4 sm:rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-neutral-500">AI-generated SWOT analysis</div>
            <button onClick={onClose}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
