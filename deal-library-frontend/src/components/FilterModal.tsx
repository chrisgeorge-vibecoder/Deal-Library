'use client';

import React, { useState } from 'react';
import { X, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { 
  GeographicFilters, 
  FilterPreset, 
  FILTER_PRESETS, 
  DEFAULT_FILTERS 
} from '@/types/filters';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'zip-codes' | 'markets' | 'segments';
  filters: GeographicFilters;
  onFiltersChange: (filters: GeographicFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  activeTab,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters
}: FilterModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([activeTab, 'data-quality'])
  );

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const applyPreset = (preset: FilterPreset) => {
    const newFilters = { ...DEFAULT_FILTERS };
    
    // Apply preset filters
    if (preset.filters.zipCode) {
      newFilters.zipCode = { ...newFilters.zipCode, ...preset.filters.zipCode };
    }
    if (preset.filters.market) {
      newFilters.market = { ...newFilters.market, ...preset.filters.market };
    }
    if (preset.filters.segment) {
      newFilters.segment = { ...newFilters.segment, ...preset.filters.segment };
    }
    if (preset.filters.dataQuality) {
      newFilters.dataQuality = { ...newFilters.dataQuality, ...preset.filters.dataQuality };
    }

    onFiltersChange(newFilters);
  };

  const updateZipCodeFilter = (key: keyof GeographicFilters['zipCode'], value: any) => {
    onFiltersChange({
      ...filters,
      zipCode: {
        ...filters.zipCode,
        [key]: value
      }
    });
  };

  const updateMarketFilter = (key: keyof GeographicFilters['market'], value: any) => {
    onFiltersChange({
      ...filters,
      market: {
        ...filters.market,
        [key]: value
      }
    });
  };

  const updateSegmentFilter = (key: keyof GeographicFilters['segment'], value: any) => {
    onFiltersChange({
      ...filters,
      segment: {
        ...filters.segment,
        [key]: value
      }
    });
  };

  const updateDataQualityFilter = (key: keyof GeographicFilters['dataQuality'], value: any) => {
    onFiltersChange({
      ...filters,
      dataQuality: {
        ...filters.dataQuality,
        [key]: value
      }
    });
  };

  const RangeInput = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1,
    suffix = ''
  }: {
    label: string;
    value: { min: number; max: number } | null;
    onChange: (value: { min: number; max: number } | null) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          placeholder="Min"
          value={value?.min || ''}
          onChange={(e) => onChange({
            min: parseFloat(e.target.value) || min,
            max: value?.max || max
          })}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
          min={min}
          max={max}
          step={step}
        />
        <span className="text-gray-500">to</span>
        <input
          type="number"
          placeholder="Max"
          value={value?.max || ''}
          onChange={(e) => onChange({
            min: value?.min || min,
            max: parseFloat(e.target.value) || max
          })}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
          min={min}
          max={max}
          step={step}
        />
        <span className="text-gray-500 text-sm">{suffix}</span>
      </div>
    </div>
  );

  const MultiSelect = ({ 
    label, 
    options, 
    value, 
    onChange 
  }: {
    label: string;
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded">
        {options.map((option) => (
          <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...value, option]);
                } else {
                  onChange(value.filter(v => v !== option));
                }
              }}
              className="mr-2"
            />
            <span className="text-sm">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] max-h-[800px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Advanced Filters</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClearFilters}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left Sidebar - Presets */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Filters</h3>
            <div className="space-y-3">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{preset.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{preset.description}</div>
                  <div className="text-xs text-blue-600 mt-2 capitalize">{preset.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content - Filter Controls */}
          <div className="flex-1 p-6 overflow-y-auto min-h-0">
            <div className="space-y-6 pb-6">
              {/* Zip Code Filters */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('zip-codes')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <h4 className="text-lg font-medium text-gray-900">Zip Code Filters</h4>
                  {expandedSections.has('zip-codes') ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('zip-codes') && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <MultiSelect
                        label="States"
                        options={['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA']}
                        value={filters.zipCode.states}
                        onChange={(value) => updateZipCodeFilter('states', value)}
                      />
                      <MultiSelect
                        label="DMAs"
                        options={['Los Angeles', 'New York', 'Chicago', 'Dallas', 'Houston', 'Philadelphia', 'San Francisco', 'Boston', 'Atlanta', 'Miami']}
                        value={filters.zipCode.dmas}
                        onChange={(value) => updateZipCodeFilter('dmas', value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <RangeInput
                        label="Population Range"
                        value={filters.zipCode.populationRange}
                        onChange={(value) => updateZipCodeFilter('populationRange', value)}
                        min={0}
                        max={100000}
                        step={1000}
                        suffix="people"
                      />
                      <RangeInput
                        label="Median Income Range"
                        value={filters.zipCode.incomeRange}
                        onChange={(value) => updateZipCodeFilter('incomeRange', value)}
                        min={0}
                        max={200000}
                        step={5000}
                        suffix="$"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <RangeInput
                        label="Market Penetration"
                        value={filters.zipCode.penetrationRange}
                        onChange={(value) => updateZipCodeFilter('penetrationRange', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        suffix="%"
                      />
                      <RangeInput
                        label="Opportunity Score"
                        value={filters.zipCode.opportunityRange}
                        onChange={(value) => updateZipCodeFilter('opportunityRange', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        suffix="%"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Market Filters */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('markets')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <h4 className="text-lg font-medium text-gray-900">Market (DMA) Filters</h4>
                  {expandedSections.has('markets') ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('markets') && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <RangeInput
                        label="DMA Rank"
                        value={filters.market.dmaRank}
                        onChange={(value) => updateMarketFilter('dmaRank', value)}
                        min={1}
                        max={210}
                        step={1}
                      />
                      <RangeInput
                        label="Growth Potential"
                        value={filters.market.growthPotential}
                        onChange={(value) => updateMarketFilter('growthPotential', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        suffix="%"
                      />
                    </div>
                    <div>
                      <MultiSelect
                        label="Saturation Levels"
                        options={['low', 'medium', 'high']}
                        value={filters.market.saturationLevels}
                        onChange={(value) => updateMarketFilter('saturationLevels', value)}
                      />
                    </div>
                    <div>
                      <MultiSelect
                        label="Regions"
                        options={['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West', 'Pacific']}
                        value={filters.market.regions}
                        onChange={(value) => updateMarketFilter('regions', value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Segment Filters */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('segments')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <h4 className="text-lg font-medium text-gray-900">Audience Segment Filters</h4>
                  {expandedSections.has('segments') ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('segments') && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <div>
                      <MultiSelect
                        label="Segment Types"
                        options={['Luxury Shoppers', 'Tech Professionals', 'New Parents', 'Health Enthusiasts', 'Pet Owners']}
                        value={filters.segment.segmentTypes}
                        onChange={(value) => updateSegmentFilter('segmentTypes', value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <RangeInput
                        label="Growth Rate"
                        value={filters.segment.growthRateRange}
                        onChange={(value) => updateSegmentFilter('growthRateRange', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        suffix="%"
                      />
                      <RangeInput
                        label="Average Income"
                        value={filters.segment.incomeRange}
                        onChange={(value) => updateSegmentFilter('incomeRange', value)}
                        min={0}
                        max={200000}
                        step={5000}
                        suffix="$"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <RangeInput
                        label="Penetration Rate"
                        value={filters.segment.penetrationRange}
                        onChange={(value) => updateSegmentFilter('penetrationRange', value)}
                        min={0}
                        max={1}
                        step={0.1}
                        suffix="%"
                      />
                      <RangeInput
                        label="Zip Code Coverage"
                        value={filters.segment.coverage}
                        onChange={(value) => updateSegmentFilter('coverage', value)}
                        min={1}
                        max={1000}
                        step={1}
                        suffix="zips"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Data Quality Filters */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('data-quality')}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <h4 className="text-lg font-medium text-gray-900">Data Quality Filters</h4>
                  {expandedSections.has('data-quality') ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.has('data-quality') && (
                  <div className="p-4 border-t border-gray-200 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data Freshness</label>
                        <select
                          value={filters.dataQuality.dataFreshness}
                          onChange={(e) => updateDataQualityFilter('dataFreshness', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Data</option>
                          <option value="recent">Recent (≤30 days)</option>
                          <option value="stale">Stale (&gt;30 days)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data Completeness</label>
                        <select
                          value={filters.dataQuality.dataCompleteness}
                          onChange={(e) => updateDataQualityFilter('dataCompleteness', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Data</option>
                          <option value="complete">Complete Data</option>
                          <option value="partial">Partial Data</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                        <select
                          value={filters.dataQuality.dataSource}
                          onChange={(e) => updateDataQualityFilter('dataSource', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Sources</option>
                          <option value="real">Real Data</option>
                          <option value="sample">Sample Data</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="text-sm text-gray-600">
            Filters will be applied to the {activeTab} view
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyFilters();
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
