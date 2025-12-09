/**
 * ZIP Code Insights Table Component
 * Displays detailed ZIP code data in a sortable, filterable table
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  Users, 
  DollarSign,
  Search,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface ZipCodeInsightsTableProps {
  zipCodeInsights: any[];
  searchType: 'location' | 'audience-segment';
}

type SortField = 'zipCode' | 'population' | 'medianIncome' | 'age' | 'commuteTime' | 'homeValue';
type SortDirection = 'asc' | 'desc';

export default function ZipCodeInsightsTable({ zipCodeInsights, searchType }: ZipCodeInsightsTableProps) {
  const [sortField, setSortField] = useState<SortField>('population');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minIncome: '',
    maxIncome: '',
    minPopulation: '',
    maxPopulation: ''
  });

  // Format number with commas
  const formatNumber = (num: number) => num.toLocaleString();
  
  // Format currency
  const formatCurrency = (num: number) => `$${num.toLocaleString()}`;

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 text-blue-600" /> : 
      <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = zipCodeInsights.filter(zip => {
      // Search filter
      const matchesSearch = !searchTerm || 
        zip.zipCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zip.zipCodeData?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zip.zipCodeData?.state?.toLowerCase().includes(searchTerm.toLowerCase());

      // Income filters
      const income = zip.zipCodeData?.medianIncome || zip.censusData?.medianIncome || 0;
      const matchesMinIncome = !filters.minIncome || income >= parseInt(filters.minIncome);
      const matchesMaxIncome = !filters.maxIncome || income <= parseInt(filters.maxIncome);

      // Population filters
      const population = zip.zipCodeData?.population || 0;
      const matchesMinPopulation = !filters.minPopulation || population >= parseInt(filters.minPopulation);
      const matchesMaxPopulation = !filters.maxPopulation || population <= parseInt(filters.maxPopulation);

      return matchesSearch && matchesMinIncome && matchesMaxIncome && matchesMinPopulation && matchesMaxPopulation;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'zipCode':
          aValue = a.zipCode || '';
          bValue = b.zipCode || '';
          break;
        case 'population':
          aValue = a.zipCodeData?.population || 0;
          bValue = b.zipCodeData?.population || 0;
          break;
        case 'medianIncome':
          aValue = a.zipCodeData?.medianIncome || a.censusData?.medianIncome || 0;
          bValue = b.zipCodeData?.medianIncome || b.censusData?.medianIncome || 0;
          break;
        case 'age':
          aValue = a.censusData?.medianAge || a.zipCodeData?.ageMedian || 0;
          bValue = b.censusData?.medianAge || b.zipCodeData?.ageMedian || 0;
          break;
        case 'commuteTime':
          aValue = a.zipCodeData?.commuteTime || 0;
          bValue = b.zipCodeData?.commuteTime || 0;
          break;
        case 'homeValue':
          aValue = a.zipCodeData?.homeValue || 0;
          bValue = b.zipCodeData?.homeValue || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [zipCodeInsights, sortField, sortDirection, searchTerm, filters]);

  return (
    <div className="bg-white rounded-xl shadow-sovrn border border-neutral-200">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            ZIP Code Details
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search ZIP codes, cities, or states..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Min Income
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minIncome}
                  onChange={(e) => setFilters({...filters, minIncome: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Max Income
                </label>
                <input
                  type="number"
                  placeholder="1000000"
                  value={filters.maxIncome}
                  onChange={(e) => setFilters({...filters, maxIncome: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Min Population
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPopulation}
                  onChange={(e) => setFilters({...filters, minPopulation: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Max Population
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  value={filters.maxPopulation}
                  onChange={(e) => setFilters({...filters, maxPopulation: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('zipCode')}
              >
                <div className="flex items-center space-x-1">
                  <span>ZIP Code</span>
                  {getSortIcon('zipCode')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Location
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('population')}
              >
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>Population</span>
                  {getSortIcon('population')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('medianIncome')}
              >
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Median Income</span>
                  {getSortIcon('medianIncome')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('age')}
              >
                <div className="flex items-center space-x-1">
                  <span>Median Age</span>
                  {getSortIcon('age')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('commuteTime')}
              >
                <div className="flex items-center space-x-1">
                  <span>Commute Time</span>
                  {getSortIcon('commuteTime')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredAndSortedData.map((zip, index) => (
              <tr key={index} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-neutral-900">
                    {zip.zipCode}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">
                    {zip.zipCodeData?.city || 'Unknown'}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {zip.zipCodeData?.state || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">
                    {formatNumber(zip.zipCodeData?.population || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">
                    {formatCurrency(zip.zipCodeData?.medianIncome || zip.censusData?.medianIncome || 0)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">
                    {zip.censusData?.medianAge || zip.zipCodeData?.ageMedian || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">
                    {zip.zipCodeData?.commuteTime || 0} min
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <div>
            Showing {filteredAndSortedData.length} of {zipCodeInsights.length} ZIP codes
          </div>
          <div>
            {searchTerm && (
              <span className="text-blue-600">
                Filtered by: "{searchTerm}"
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


