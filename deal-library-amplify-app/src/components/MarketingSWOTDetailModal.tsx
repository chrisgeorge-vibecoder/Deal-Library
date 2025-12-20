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
        {/* Minimalist Header */}
        <div className="bg-white border-b border-slate-200/60 p-6 sm:rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                <Target className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">{swot.companyName}</h3>
                <p className="text-sm text-slate-500 mt-0.5">Marketing SWOT Analysis</p>
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
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                  }`}
                >
                  {isSaved(`marketing-swot-${swot.companyName}`) ? (
                    <BookmarkCheck className="w-5 h-5" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>
              )}
              <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Export Toolbar */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-medium mr-2">Export:</span>
            <button onClick={() => handleCopyAsHTML(`#${modalId}`)} disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors disabled:opacity-50 border border-slate-200/60">
              {exportSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{exportSuccess ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={() => handleDownloadAsImage(`#${modalId}`, filename)} disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors disabled:opacity-50 border border-slate-200/60">
              <Download className="w-3.5 h-3.5" /><span>Image</span>
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors border border-slate-200/60">
              <Printer className="w-3.5 h-3.5" /><span>Print</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div id={modalId} className="p-6 space-y-6">
          
          {/* SWOT Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-slate-600" />
                <h4 className="font-semibold text-slate-900 tracking-tight">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {strengths.slice(0, 4).map((strength, index) => (
                  <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{strength}</span>
                  </li>
                ))}
                {strengths.length === 0 && (
                  <li className="text-sm text-slate-400 italic">No strengths data available</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-slate-600" />
                <h4 className="font-semibold text-slate-900 tracking-tight">Weaknesses</h4>
              </div>
              <ul className="space-y-2">
                {weaknesses.slice(0, 4).map((weakness, index) => (
                  <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{weakness}</span>
                  </li>
                ))}
                {weaknesses.length === 0 && (
                  <li className="text-sm text-slate-400 italic">No weaknesses data available</li>
                )}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                <h4 className="font-semibold text-slate-900 tracking-tight">Opportunities</h4>
              </div>
              <ul className="space-y-2">
                {opportunities.slice(0, 4).map((opportunity, index) => (
                  <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{opportunity}</span>
                  </li>
                ))}
                {opportunities.length === 0 && (
                  <li className="text-sm text-slate-400 italic">No opportunities data available</li>
                )}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-slate-600" />
                <h4 className="font-semibold text-slate-900 tracking-tight">Threats</h4>
              </div>
              <ul className="space-y-2">
                {threats.slice(0, 4).map((threat, index) => (
                  <li key={index} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span>{threat}</span>
                  </li>
                ))}
                {threats.length === 0 && (
                  <li className="text-sm text-slate-400 italic">No threats data available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Strategic Recommendations */}
          {(swot.recommendedActions || swot.recommendations) && (swot.recommendedActions || swot.recommendations)!.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-slate-600" />
                <h4 className="font-semibold text-slate-900 tracking-tight">Strategic Recommendations</h4>
              </div>
              <div className="space-y-3">
                {(swot.recommendedActions || swot.recommendations)!.slice(0, 4).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-slate-200/60">
                    <div className="w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-slate-700 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {swot.sources && swot.sources.length > 0 && (
            <div className="pt-4 border-t border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2 tracking-wide">Sources</h4>
              <div className="space-y-1">
                {swot.sources.map((src, idx) => (
                  <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="text-slate-400">•</span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-slate-900 hover:underline transition-colors">
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
        <div className="sticky bottom-0 bg-white border-t border-slate-200/60 px-6 py-4 sm:rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">AI-generated SWOT analysis</div>
            <button onClick={onClose}
              className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium border border-slate-200/60">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
