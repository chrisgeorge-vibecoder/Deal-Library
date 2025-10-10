/**
 * Summary Overview Component for Geo Insights
 * Displays key metrics and insights at the top of results
 */

import React from 'react';
import { 
  Users, 
  DollarSign, 
  MapPin, 
  TrendingUp, 
  Clock, 
  Home,
  GraduationCap,
  Building2
} from 'lucide-react';
import { SummaryOverview as SummaryOverviewType, SearchType } from '@/types/zipInsights';

interface SummaryOverviewProps {
  overview: SummaryOverviewType;
  searchType: SearchType;
  searchQuery: string;
}

export default function SummaryOverview({ overview, searchType, searchQuery }: SummaryOverviewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sovrn border border-neutral-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {searchType === 'location' ? '📍 Location Analysis' : '👥 Audience Insights'}
          </h2>
          <p className="text-neutral-600">
            Analysis for: <span className="font-semibold text-neutral-900">{searchQuery}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-blue-700">
            {overview.totalZipCodes} ZIP codes analyzed
          </span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Population</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(overview.totalPopulation)}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Average Income</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(overview.averageIncome)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Median Age</p>
              <p className="text-2xl font-bold text-purple-900">{overview.keyMetrics.medianAge}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Home Ownership</p>
              <p className="text-2xl font-bold text-orange-900">{overview.keyMetrics.homeOwnershipRate.toFixed(1)}%</p>
            </div>
            <Home className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Demographics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-neutral-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-neutral-600" />
            Demographics Profile
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600">Age Group:</span>
              <span className="font-medium text-neutral-900">{overview.dominantDemographics.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Ethnicity:</span>
              <span className="font-medium text-neutral-900">{overview.dominantDemographics.ethnicity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Education:</span>
              <span className="font-medium text-neutral-900">{overview.dominantDemographics.education}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Area Type:</span>
              <span className="font-medium text-neutral-900">{overview.dominantDemographics.urbanRural}</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-neutral-600" />
            Economic Indicators
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-600">Unemployment Rate:</span>
              <span className="font-medium text-neutral-900">{overview.keyMetrics.unemploymentRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Average Commute:</span>
              <span className="font-medium text-neutral-900">{overview.keyMetrics.averageCommuteTime.toFixed(1)} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">ZIP Codes:</span>
              <span className="font-medium text-neutral-900">{overview.totalZipCodes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Top Opportunities
          </h3>
          <div className="space-y-2">
            {overview.topOpportunities.map((opportunity, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-neutral-700">{opportunity}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            Market Insights
          </h3>
          <div className="space-y-2">
            {overview.marketInsights.map((insight, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-neutral-700">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
