import React, { useState, useEffect } from 'react';
import { GeoCard } from '@/types/deal';
import { X, MapPin, Users, TrendingUp, Download, ExternalLink, Target, BarChart3, FileText, Bookmark, BookmarkCheck } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import InteractiveMap to avoid SSR issues
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  )
});

interface GeoDetailModalProps {
  geo: GeoCard | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDeals?: (geo: GeoCard) => void;
  onSaveCard?: (card: { type: 'geo-cards', data: GeoCard }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export default function GeoDetailModal({ 
  geo, 
  isOpen, 
  onClose, 
  onViewDeals,
  onSaveCard,
  onUnsaveCard,
  isSaved
}: GeoDetailModalProps) {
  if (!isOpen || !geo) return null;

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
        className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Geo Insights: {geo.audienceName}
              </h2>
              <p className="text-sm text-gray-600">Detailed geographic distribution analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSaveCard && onUnsaveCard && isSaved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSaved(`geo-cards-${geo.id}`)) {
                    onUnsaveCard(`geo-cards-${geo.id}`);
                  } else {
                    onSaveCard({ type: 'geo-cards', data: geo });
                  }
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isSaved(`geo-cards-${geo.id}`)
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    : 'text-neutral-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={isSaved(`geo-cards-${geo.id}`) ? 'Remove from saved' : 'Save card'}
              >
                {isSaved(`geo-cards-${geo.id}`) ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Interactive Map */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              Geographic Distribution Map
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Interactive Map */}
              <InteractiveMap geo={geo} />
              
              {/* Map Controls */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      <MapPin className="w-4 h-4 mr-1" />
                      Reset View
                    </button>
                    <button className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                      <Download className="w-4 h-4 mr-1" />
                      Export Map
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Click markers for details • Scroll to zoom • Drag to pan
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Markets Table */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              Top Markets Breakdown
            </h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Region</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Percentage</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {geo.topMarkets.map((market, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{market.region}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{market.percentage}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          index === 0 ? 'bg-green-100 text-green-800' : 
                          index === 1 ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {index === 0 ? 'Primary' : index === 1 ? 'Secondary' : 'Tertiary'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Geographic Insights */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              Key Geo Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {geo.insights.map((insight, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demographics */}
          {geo.demographics && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                Demographics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Population</h4>
                  <p className="text-sm text-gray-600">{geo.demographics.population}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Median Age</h4>
                  <p className="text-sm text-gray-600">{geo.demographics.medianAge}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Median Income</h4>
                  <p className="text-sm text-gray-600">{geo.demographics.medianIncome}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Urban/Rural Split</h4>
                  <p className="text-sm text-gray-600">{geo.demographics.urbanRuralSplit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Market Characteristics */}
          {geo.marketCharacteristics && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                Market Characteristics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Economic Profile</h4>
                  <p className="text-sm text-gray-600">{geo.marketCharacteristics.economicProfile}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tech Adoption</h4>
                  <p className="text-sm text-gray-600">{geo.marketCharacteristics.techAdoption}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Media Consumption</h4>
                  <p className="text-sm text-gray-600">{geo.marketCharacteristics.mediaConsumption}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Purchase Behavior</h4>
                  <p className="text-sm text-gray-600">{geo.marketCharacteristics.purchaseBehavior}</p>
                </div>
              </div>
            </div>
          )}

          {/* Advertising Opportunities */}
          {geo.advertisingOpportunities && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Target className="w-5 h-5 text-red-600 mr-2" />
                Advertising Opportunities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Optimal Channels</h4>
                  <div className="flex flex-wrap gap-1">
                    {geo.advertisingOpportunities.optimalChannels.map((channel, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Peak Engagement</h4>
                  <div className="flex flex-wrap gap-1">
                    {geo.advertisingOpportunities.peakEngagement.map((time, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Creative Considerations</h4>
                  <div className="flex flex-wrap gap-1">
                    {geo.advertisingOpportunities.creativeConsiderations.map((consideration, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {consideration}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Budget Recommendations</h4>
                  <p className="text-sm text-gray-600">{geo.advertisingOpportunities.budgetRecommendations}</p>
                </div>
              </div>
            </div>
          )}

          {/* Competitive Landscape */}
          {geo.competitiveLandscape && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <BarChart3 className="w-5 h-5 text-indigo-600 mr-2" />
                Competitive Landscape
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Market Saturation</h4>
                  <span className={`px-2 py-1 text-xs rounded ${
                    geo.competitiveLandscape.marketSaturation === 'High' ? 'bg-red-100 text-red-800' :
                    geo.competitiveLandscape.marketSaturation === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {geo.competitiveLandscape.marketSaturation}
                  </span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Competitors</h4>
                  <div className="flex flex-wrap gap-1">
                    {geo.competitiveLandscape.keyCompetitors.map((competitor, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {competitor}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2">White Space Opportunities</h4>
                  <div className="flex flex-wrap gap-1">
                    {geo.competitiveLandscape.whiteSpaceOpportunities.map((opportunity, index) => (
                      <span key={index} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded">
                        {opportunity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Total Addressable Market */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Total Addressable Market</h3>
                <p className="text-sm text-gray-600">Estimated audience size across all regions</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{geo.totalAddressable}</div>
                <div className="text-sm text-gray-500">Total Reach</div>
              </div>
            </div>
          </div>

          {/* Sources */}
          {geo.sources && geo.sources.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 text-gray-600 mr-2" />
                Sources
              </h3>
              <div className="space-y-2">
                {geo.sources.map((source, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {source.title}
                    </a>
                    {source.note && (
                      <p className="text-xs text-gray-500 mt-1">{source.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Data Disclaimer */}
          {geo.sampleData && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <p className="text-sm text-blue-800">
                  <strong>Sample Data:</strong> This geographic analysis is based on sample data for demonstration purposes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (onViewDeals) {
                  onViewDeals(geo);
                }
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Related Deals
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
