import React from 'react';
import { GeoCard as GeoCardType } from '@/types/deal';

interface GeoCardProps {
  geo: GeoCardType;
  onClick?: () => void;
}

export const GeoCard: React.FC<GeoCardProps> = ({ geo, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      console.log('GeoCard clicked:', geo);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {geo.audienceName}
          </h3>
          <p className="text-sm text-gray-600">
            Geographic Distribution
          </p>
        </div>
        {geo.sampleData && (
          <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
            Sample Data
          </div>
        )}
      </div>

      {/* Geographic Overview */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Geographic Overview</p>
              <p className="text-xs text-gray-600">Click for detailed analysis</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{geo.totalAddressable}</div>
            <div className="text-xs text-gray-500">Total Reach</div>
          </div>
        </div>
        
        {/* Quick Stats */}
        {geo.demographics && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Population:</span>
              <span className="ml-1 font-medium text-gray-900">{geo.demographics.population}</span>
            </div>
            <div>
              <span className="text-gray-500">Median Age:</span>
              <span className="ml-1 font-medium text-gray-900">{geo.demographics.medianAge}</span>
            </div>
            <div>
              <span className="text-gray-500">Median Income:</span>
              <span className="ml-1 font-medium text-gray-900">{geo.demographics.medianIncome}</span>
            </div>
            <div>
              <span className="text-gray-500">Urban/Rural:</span>
              <span className="ml-1 font-medium text-gray-900">{geo.demographics.urbanRuralSplit}</span>
            </div>
          </div>
        )}
      </div>

      {/* Key Geographic Insights */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Top Markets</h4>
          <div className="space-y-1">
            {geo.topMarkets.map((market, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{market.region}</span>
                <span className="font-medium text-gray-900">{market.percentage}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Geo Insights</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {geo.insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Addressable</span>
            <span className="font-medium text-gray-900">{geo.totalAddressable}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
