import React from 'react';
import { X, ShoppingCart, Users, Target, Lightbulb, TrendingUp, Clock, Smartphone, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react';
import { AudienceInsights } from './AudienceInsightsCard';

interface AudienceInsightsDetailModalProps {
  insights: AudienceInsights | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDeals: (insights: AudienceInsights) => void;
  onSaveCard?: (card: { type: 'audience-insights', data: AudienceInsights }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export const AudienceInsightsDetailModal: React.FC<AudienceInsightsDetailModalProps> = ({
  insights,
  isOpen,
  onClose,
  onViewDeals,
  onSaveCard,
  onUnsaveCard,
  isSaved
}) => {
  if (!isOpen || !insights) return null;

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
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{insights.audienceName}</h2>
              <p className="text-sm text-gray-500">Audience Insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSaveCard && onUnsaveCard && isSaved ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSaved(`audience-insights-${insights.audienceName}`)) {
                    onUnsaveCard(`audience-insights-${insights.audienceName}`);
                  } else {
                    onSaveCard({ type: 'audience-insights', data: insights });
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved(`audience-insights-${insights.audienceName}`)
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-neutral-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isSaved(`audience-insights-${insights.audienceName}`) ? 'Remove from saved' : 'Save card'}
              >
                {isSaved(`audience-insights-${insights.audienceName}`) ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            ) : null}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Demographics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Age Range</div>
                <div className="text-gray-900">{insights.demographics.ageRange}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Income Range</div>
                <div className="text-gray-900">{insights.demographics.incomeRange}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Gender Split</div>
                <div className="text-gray-900">{insights.demographics.genderSplit}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-1">Top Locations</div>
                <div className="text-gray-900">{insights.demographics.topLocations.join(', ')}</div>
              </div>
            </div>
          </div>

          {/* Behavior */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Behavior Patterns
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Device Usage</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-600">Mobile</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{insights.behavior.deviceUsage.mobile}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-4 w-4 mr-2 bg-gray-300 rounded"></div>
                      <span className="text-sm text-gray-600">Desktop</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{insights.behavior.deviceUsage.desktop}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-4 w-4 mr-2 bg-gray-300 rounded"></div>
                      <span className="text-sm text-gray-600">Tablet</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{insights.behavior.deviceUsage.tablet}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Purchase Behavior</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-medium text-gray-700">Peak Hours: </span>
                      {Array.isArray(insights.behavior.peakHours) 
                        ? insights.behavior.peakHours.join(', ')
                        : insights.behavior.peakHours
                      }
                    </div>
                  </li>
                  <li className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-medium text-gray-700">Frequency: </span>
                      {insights.behavior.purchaseFrequency}
                    </div>
                  </li>
                  <li className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <div>
                      <span className="font-medium text-gray-700">Avg Order: </span>
                      {insights.behavior.avgOrderValue}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
              Key Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Characteristics</h4>
                <ul className="space-y-2">
                  {insights.insights.keyCharacteristics.map((characteristic, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {characteristic}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {insights.insights.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Pain Points</h4>
              <ul className="space-y-2">
                {insights.insights.painPoints.map((painPoint, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {painPoint}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Creative Guidance */}
          {insights.creativeGuidance && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-purple-600" />
                Creative Guidance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Messaging Tone</h4>
                  <p className="text-sm text-gray-600 mb-4">{insights.creativeGuidance.messagingTone}</p>
                  
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Visual Style</h4>
                  <p className="text-sm text-gray-600">{insights.creativeGuidance.visualStyle}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Key Messages</h4>
                  <ul className="space-y-2 mb-4">
                    {insights.creativeGuidance.keyMessages.map((message, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {message}
                      </li>
                    ))}
                  </ul>
                  
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Avoid Messaging</h4>
                  <ul className="space-y-2">
                    {insights.creativeGuidance.avoidMessaging.map((message, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Media Strategy */}
          {insights.mediaStrategy && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-indigo-600" />
                Media Strategy
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Preferred Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.mediaStrategy.preferredChannels.map((channel, index) => (
                      <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Optimal Timing</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.mediaStrategy.optimalTiming.map((timing, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {timing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Creative Formats</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {insights.mediaStrategy.creativeFormats.map((format, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {format}
                    </span>
                  ))}
                </div>
                
                <h4 className="text-sm font-medium text-gray-700 mb-3">Targeting Approach</h4>
                <p className="text-sm text-gray-600">{insights.mediaStrategy.targetingApproach}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sources */}
        {insights.sources && insights.sources.length > 0 && (
          <div className="px-6 pb-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Sources</h3>
            <ul className="space-y-1">
              {insights.sources.map((src, idx) => (
                <li key={idx} className="text-xs text-gray-600">
                  {src.url ? (
                    <a href={src.url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                      {src.title || src.url}
                    </a>
                  ) : (
                    <span>{src.title}</span>
                  )}
                  {src.note && <span className="text-gray-500"> — {src.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            AI-generated audience insights
          </div>
          <div className="flex space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onViewDeals(insights)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Find Relevant Deals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
