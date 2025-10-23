import React from 'react';
import { 
  X, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Zap, 
  Map, 
  Download,
  Bookmark,
  BookmarkCheck,
  Calendar,
  BarChart3,
  Lightbulb,
  Shield
} from 'lucide-react';

interface TestingFramework {
  minimumBudget?: string;
  testDuration?: string;
  successMetrics?: string[];
  optimizationSignals?: string[];
}

interface CoachingInsights {
  strategyRationale?: string;
  hiddenOpportunities?: string[];
  riskWarnings?: string[];
  testingFramework?: TestingFramework;
  quickWins?: string[];
  scalingPath?: string[];
  competitiveIntelligence?: string;
}

interface StrategyBriefDetailModalProps {
  coaching: CoachingInsights | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCard?: (card: { type: 'strategy-brief', data: CoachingInsights }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export const StrategyBriefDetailModal: React.FC<StrategyBriefDetailModalProps> = ({
  coaching,
  isOpen,
  onClose,
  onSaveCard,
  onUnsaveCard,
  isSaved
}) => {
  if (!isOpen || !coaching) return null;

  const handleDownloadPDF = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting strategy brief to PDF...');
  };

  // Use the same ID generation as AppLayout for consistency
  const cardId = `strategy-brief-${coaching?.strategyRationale ? btoa(coaching.strategyRationale).substring(0, 10) : Date.now()}`;
  const isCardSaved = isSaved ? isSaved(cardId) : false;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Strategy Brief</h2>
              <p className="text-sm text-gray-500">Campaign strategy and implementation guide</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSaveCard && onUnsaveCard && (
              <button
                onClick={() => {
                  if (isCardSaved) {
                    onUnsaveCard(cardId);
                  } else {
                    onSaveCard({ type: 'strategy-brief', data: coaching });
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isCardSaved
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-neutral-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isCardSaved ? 'Remove from saved' : 'Save strategy brief'}
              >
                {isCardSaved ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-neutral-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export to PDF"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Strategy Rationale */}
          {coaching.strategyRationale && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Strategy Rationale
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{coaching.strategyRationale}</p>
              </div>
            </div>
          )}

          {/* Two Column Layout for Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              
              {/* Hidden Opportunities */}
              {coaching.hiddenOpportunities && coaching.hiddenOpportunities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-green-600" />
                    Hidden Opportunities
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <ul className="space-y-3">
                      {coaching.hiddenOpportunities.map((opportunity, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{opportunity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Quick Wins */}
              {coaching.quickWins && coaching.quickWins.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                    Quick Wins
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <ul className="space-y-3">
                      {coaching.quickWins.map((win, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-3">
                          <span className="text-yellow-600 mt-1">🚀</span>
                          <span>{win}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Risk Warnings */}
              {coaching.riskWarnings && coaching.riskWarnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                    Risk Warnings
                  </h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <ul className="space-y-3">
                      {coaching.riskWarnings.map((warning, index) => (
                        <li key={index} className="text-gray-700 flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Competitive Intelligence */}
              {coaching.competitiveIntelligence && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Map className="h-5 w-5 mr-2 text-purple-600" />
                    Competitive Intelligence
                  </h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{coaching.competitiveIntelligence}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Testing Framework - Full Width */}
          {coaching.testingFramework && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                Testing Framework
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {coaching.testingFramework.minimumBudget && (
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-gray-900">Minimum Budget</span>
                      </div>
                      <p className="text-lg font-semibold text-green-600">{coaching.testingFramework.minimumBudget}</p>
                    </div>
                  )}
                  
                  {coaching.testingFramework.testDuration && (
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Test Duration</span>
                      </div>
                      <p className="text-lg font-semibold text-blue-600">{coaching.testingFramework.testDuration}</p>
                    </div>
                  )}
                </div>

                {coaching.testingFramework.successMetrics && coaching.testingFramework.successMetrics.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-indigo-600" />
                      Success Metrics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {coaching.testingFramework.successMetrics.map((metric, index) => (
                        <div key={index} className="bg-white p-3 rounded border text-sm text-gray-700">
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {coaching.testingFramework.optimizationSignals && coaching.testingFramework.optimizationSignals.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-indigo-600" />
                      Optimization Signals
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {coaching.testingFramework.optimizationSignals.map((signal, index) => (
                        <div key={index} className="bg-white p-3 rounded border text-sm text-gray-700">
                          {signal}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scaling Path - Full Width */}
          {coaching.scalingPath && coaching.scalingPath.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                Scaling Path
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <div className="space-y-4">
                  {coaching.scalingPath.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StrategyBriefDetailModal;
