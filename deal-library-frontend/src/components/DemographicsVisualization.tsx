/**
 * Demographics Visualization Component
 * Displays demographic data in interactive charts and graphs
 */

import React from 'react';
import { 
  Users, 
  DollarSign, 
  GraduationCap, 
  Home, 
  Clock,
  TrendingUp,
  MapPin,
  BarChart3
} from 'lucide-react';

interface DemographicsVisualizationProps {
  zipCodeInsights: any[];
  searchType: 'location' | 'audience-segment' | 'audience';
}

export default function DemographicsVisualization({ zipCodeInsights, searchType }: DemographicsVisualizationProps) {
  
  // Calculate demographic distributions
  const calculateDemographics = () => {
    if (!zipCodeInsights || zipCodeInsights.length === 0) {
      return {
        incomeDistribution: [],
        ageDistribution: [],
        educationDistribution: [],
        commuteDistribution: []
      };
    }

    // Income distribution
    const incomeRanges = [
      { label: 'Under $50k', min: 0, max: 50000, count: 0 },
      { label: '$50k-$75k', min: 50000, max: 75000, count: 0 },
      { label: '$75k-$100k', min: 75000, max: 100000, count: 0 },
      { label: '$100k-$150k', min: 100000, max: 150000, count: 0 },
      { label: 'Over $150k', min: 150000, max: Infinity, count: 0 }
    ];

    // Age distribution
    const ageRanges = [
      { label: 'Under 30', min: 0, max: 30, count: 0 },
      { label: '30-40', min: 30, max: 40, count: 0 },
      { label: '40-50', min: 40, max: 50, count: 0 },
      { label: '50-60', min: 50, max: 60, count: 0 },
      { label: 'Over 60', min: 60, max: Infinity, count: 0 }
    ];


    // Commute time distribution
    const commuteRanges = [
      { label: 'Under 20 min', min: 0, max: 20, count: 0 },
      { label: '20-30 min', min: 20, max: 30, count: 0 },
      { label: '30-45 min', min: 30, max: 45, count: 0 },
      { label: '45-60 min', min: 45, max: 60, count: 0 },
      { label: 'Over 60 min', min: 60, max: Infinity, count: 0 }
    ];

    zipCodeInsights.forEach(zip => {
      const income = zip.zipCodeData?.medianIncome || zip.censusData?.medianIncome || 0;
      const age = zip.censusData?.medianAge || zip.zipCodeData?.ageMedian || 0;
      const commuteTime = zip.zipCodeData?.commuteTime || 0;
      // Income distribution
      incomeRanges.forEach(range => {
        if (income >= range.min && income < range.max) {
          range.count++;
        }
      });

      // Age distribution
      ageRanges.forEach(range => {
        if (age >= range.min && age < range.max) {
          range.count++;
        }
      });

      // Commute distribution
      commuteRanges.forEach(range => {
        if (commuteTime >= range.min && commuteTime < range.max) {
          range.count++;
        }
      });
    });

    return {
      incomeDistribution: incomeRanges.filter(range => range.count > 0),
      ageDistribution: ageRanges.filter(range => range.count > 0),
      educationDistribution: [], // Will be populated when education data is available
      commuteDistribution: commuteRanges.filter(range => range.count > 0)
    };
  };

  const demographics = calculateDemographics();
  const totalZipCodes = zipCodeInsights.length;

  // Helper function to calculate percentage
  const getPercentage = (count: number) => ((count / totalZipCodes) * 100).toFixed(1);

  // Helper function to create progress bar
  const ProgressBar = ({ percentage, color }: { percentage: number; color: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
          Demographics Analysis
        </h2>
        <div className="text-sm text-neutral-600">
          {totalZipCodes} ZIP codes analyzed
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income Distribution */}
        <div className="bg-white rounded-xl shadow-sovrn border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Income Distribution
          </h3>
          <div className="space-y-3">
            {demographics.incomeDistribution.map((range, index) => {
              const percentage = parseFloat(getPercentage(range.count));
              const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700">{range.label}</span>
                    <span className="font-medium text-neutral-900">
                      {range.count} ZIP codes ({percentage}%)
                    </span>
                  </div>
                  <ProgressBar percentage={percentage} color={colors[index % colors.length]} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Age Distribution */}
        <div className="bg-white rounded-xl shadow-sovrn border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Age Distribution
          </h3>
          <div className="space-y-3">
            {demographics.ageDistribution.map((range, index) => {
              const percentage = parseFloat(getPercentage(range.count));
              const colors = ['bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800'];
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700">{range.label}</span>
                    <span className="font-medium text-neutral-900">
                      {range.count} ZIP codes ({percentage}%)
                    </span>
                  </div>
                  <ProgressBar percentage={percentage} color={colors[index % colors.length]} />
                </div>
              );
            })}
          </div>
        </div>


        {/* Commute Time Distribution */}
        <div className="bg-white rounded-xl shadow-sovrn border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-600" />
            Commute Time Distribution
          </h3>
          <div className="space-y-3">
            {demographics.commuteDistribution.map((range, index) => {
              const percentage = parseFloat(getPercentage(range.count));
              const colors = ['bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-600'];
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-700">{range.label}</span>
                    <span className="font-medium text-neutral-900">
                      {range.count} ZIP codes ({percentage}%)
                    </span>
                  </div>
                  <ProgressBar percentage={percentage} color={colors[index % colors.length]} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Key Statistics Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">
              {zipCodeInsights.reduce((sum, zip) => sum + (zip.zipCodeData?.population || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Total Population</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">
              ${Math.round(zipCodeInsights.reduce((sum, zip) => sum + (zip.zipCodeData?.medianIncome || 0), 0) / totalZipCodes).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Average Median Income</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">
              {Math.round(zipCodeInsights.reduce((sum, zip) => sum + (zip.censusData?.medianAge || 0), 0) / totalZipCodes)}
            </div>
            <div className="text-sm text-blue-700">Average Median Age</div>
          </div>
        </div>
      </div>
    </div>
  );
}
