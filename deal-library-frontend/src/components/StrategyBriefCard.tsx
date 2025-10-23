import React from 'react';
import { Target, TrendingUp, AlertTriangle, DollarSign, Zap, Map, Eye, ChevronDown, ChevronUp } from 'lucide-react';

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

interface StrategyBriefCardProps {
  coaching: CoachingInsights;
  onExpand?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  className?: string;
}

export const StrategyBriefCard: React.FC<StrategyBriefCardProps> = ({
  coaching,
  onExpand,
  onSave,
  isSaved = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">🎯 Strategy Brief</h3>
            <p className="text-xs text-blue-700">Data-driven campaign insights</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={onSave}
              className={`p-1.5 rounded-lg transition-colors ${
                isSaved 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
              title={isSaved ? 'Saved' : 'Save strategy brief'}
            >
              {isSaved ? '✓' : '💾'}
            </button>
          )}
          
          <button
            onClick={toggleExpanded}
            className="p-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Strategy Rationale - Always visible */}
      {coaching.strategyRationale && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Strategy Rationale</span>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">{coaching.strategyRationale}</p>
        </div>
      )}

      {/* Quick metrics from testing framework */}
      {coaching.testingFramework && (
        <div className="flex gap-4 mb-4 text-xs">
          {coaching.testingFramework.minimumBudget && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="text-green-700 font-medium">{coaching.testingFramework.minimumBudget}</span>
            </div>
          )}
          {coaching.testingFramework.testDuration && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md">
              <Target className="h-3 w-3 text-purple-600" />
              <span className="text-purple-700 font-medium">{coaching.testingFramework.testDuration}</span>
            </div>
          )}
        </div>
      )}

      {/* Expandable Content */}
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-blue-200">
          
          {/* Hidden Opportunities */}
          {coaching.hiddenOpportunities && coaching.hiddenOpportunities.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Hidden Opportunities</span>
              </div>
              <ul className="space-y-1">
                {coaching.hiddenOpportunities.map((opportunity, index) => (
                  <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Warnings */}
          {coaching.riskWarnings && coaching.riskWarnings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Risk Warnings</span>
              </div>
              <ul className="space-y-1">
                {coaching.riskWarnings.map((warning, index) => (
                  <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Testing Framework Details */}
          {coaching.testingFramework && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Testing Framework</span>
              </div>
              <div className="bg-white rounded-lg p-3 space-y-3">
                {coaching.testingFramework.successMetrics && coaching.testingFramework.successMetrics.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-700 block mb-1">Success Metrics:</span>
                    <div className="space-y-1">
                      {coaching.testingFramework.successMetrics.map((metric, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {coaching.testingFramework.optimizationSignals && coaching.testingFramework.optimizationSignals.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-gray-700 block mb-1">Optimization Signals:</span>
                    <div className="space-y-1">
                      {coaching.testingFramework.optimizationSignals.map((signal, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {signal}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {coaching.quickWins && coaching.quickWins.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Quick Wins</span>
              </div>
              <ul className="space-y-1">
                {coaching.quickWins.map((win, index) => (
                  <li key={index} className="text-sm text-emerald-800 flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">🚀</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Competitive Intelligence */}
          {coaching.competitiveIntelligence && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Map className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">Competitive Intelligence</span>
              </div>
              <p className="text-sm text-indigo-800 leading-relaxed">{coaching.competitiveIntelligence}</p>
            </div>
          )}
        </div>
      )}

      {/* Expand Button (always visible at bottom) */}
      <div className="mt-3 pt-2 border-t border-blue-200">
        <button
          onClick={onExpand}
          className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1 transition-colors"
        >
          View Full Strategy Brief →
        </button>
      </div>
    </div>
  );
};

export default StrategyBriefCard;
