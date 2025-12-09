'use client';

import React, { useState, useEffect } from 'react';
import { Filter, X, Save, ChevronDown, ChevronUp } from 'lucide-react';

export interface MarketFilters {
  includeCommercialZips?: boolean;
  populationMin?: number;
  populationMax?: number;
  incomeMin?: number;
  incomeMax?: number;
  collegeEducatedMin?: number;
  homeOwnershipMin?: number;
  ageMedianMin?: number;
  ageMedianMax?: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: MarketFilters;
}

interface MarketFiltersPanelProps {
  onFiltersChange: (filters: MarketFilters) => void;
  activeFilters: MarketFilters;
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'affluent-markets',
    name: 'Affluent Markets',
    filters: {
      incomeMin: 75000,
      collegeEducatedMin: 30,
      homeOwnershipMin: 60
    }
  },
  {
    id: 'emerging-markets',
    name: 'Emerging Markets',
    filters: {
      populationMin: 50000,
      populationMax: 250000,
      incomeMin: 45000,
      incomeMax: 65000
    }
  },
  {
    id: 'young-professional',
    name: 'Young Professional Markets',
    filters: {
      ageMedianMin: 25,
      ageMedianMax: 40,
      collegeEducatedMin: 35,
      incomeMin: 55000
    }
  },
  {
    id: 'family-oriented',
    name: 'Family-Oriented Markets',
    filters: {
      ageMedianMin: 30,
      ageMedianMax: 50,
      homeOwnershipMin: 65,
      populationMin: 100000
    }
  }
];

export default function MarketFiltersPanel({ onFiltersChange, activeFilters }: MarketFiltersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<MarketFilters>(activeFilters);
  const [customPresets, setCustomPresets] = useState<FilterPreset[]>([]);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Load custom presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('marketFilterPresets');
    if (saved) {
      try {
        setCustomPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    }
  }, []);

  const handleFilterChange = (key: keyof MarketFilters, value: number | boolean | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const applyPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    onFiltersChange(preset.filters);
  };

  const saveCustomPreset = () => {
    if (!presetName.trim()) return;

    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name: presetName,
      filters: { ...filters }
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem('marketFilterPresets', JSON.stringify(updated));
    setPresetName('');
    setShowSavePreset(false);
  };

  const deletePreset = (id: string) => {
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('marketFilterPresets', JSON.stringify(updated));
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const allPresets = [...DEFAULT_PRESETS, ...customPresets];

  return (
    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-brand-gold" />
          <h3 className="font-semibold text-brand-charcoal">Advanced Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              {Object.keys(filters).length} active
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 border-t border-neutral-200 space-y-6">
          {/* Commercial ZIPs Toggle */}
          <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <input
              type="checkbox"
              id="includeCommercialZipsFilter"
              checked={filters.includeCommercialZips || false}
              onChange={(e) => handleFilterChange('includeCommercialZips', e.target.checked)}
              className="w-4 h-4 text-brand-gold border-neutral-300 rounded focus:ring-brand-gold focus:ring-2"
            />
            <label htmlFor="includeCommercialZipsFilter" className="text-sm text-neutral-700 cursor-pointer">
              Include downtown commercial ZIPs
              <span className="text-neutral-500 ml-1">(non-residential areas)</span>
            </label>
          </div>

          {/* Filter Presets */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Quick Presets</h4>
            <div className="flex flex-wrap gap-2">
              {allPresets.map((preset) => (
                <div key={preset.id} className="relative group">
                  <button
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded transition-colors"
                  >
                    {preset.name}
                  </button>
                  {preset.id.startsWith('custom-') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePreset(preset.id);
                      }}
                      className="absolute -top-1 -right-1 hidden group-hover:flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-xs"
                      title="Delete preset"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Population Range */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Population Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Minimum</label>
                <input
                  type="number"
                  value={filters.populationMin || ''}
                  onChange={(e) => handleFilterChange('populationMin', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Maximum</label>
                <input
                  type="number"
                  value={filters.populationMax || ''}
                  onChange={(e) => handleFilterChange('populationMax', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 500000"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
            </div>
          </div>

          {/* Income Range */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Median Household Income</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Minimum</label>
                <input
                  type="number"
                  value={filters.incomeMin || ''}
                  onChange={(e) => handleFilterChange('incomeMin', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Maximum</label>
                <input
                  type="number"
                  value={filters.incomeMax || ''}
                  onChange={(e) => handleFilterChange('incomeMax', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 100000"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
            </div>
          </div>

          {/* Demographic Criteria */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Demographic Criteria</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">College Educated (min %)</label>
                <input
                  type="number"
                  value={filters.collegeEducatedMin || ''}
                  onChange={(e) => handleFilterChange('collegeEducatedMin', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 30"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Home Ownership (min %)</label>
                <input
                  type="number"
                  value={filters.homeOwnershipMin || ''}
                  onChange={(e) => handleFilterChange('homeOwnershipMin', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 60"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
            </div>
          </div>

          {/* Age Range */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-700 mb-2">Median Age Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Minimum</label>
                <input
                  type="number"
                  value={filters.ageMedianMin || ''}
                  onChange={(e) => handleFilterChange('ageMedianMin', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 25"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-600 mb-1 block">Maximum</label>
                <input
                  type="number"
                  value={filters.ageMedianMax || ''}
                  onChange={(e) => handleFilterChange('ageMedianMax', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 45"
                  className="w-full px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
            <button
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>

            {hasActiveFilters && !showSavePreset && (
              <button
                onClick={() => setShowSavePreset(true)}
                className="flex items-center gap-2 px-3 py-2 bg-brand-gold text-white rounded text-sm font-medium hover:bg-brand-gold/90 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Preset
              </button>
            )}

            {showSavePreset && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Preset name..."
                  className="px-3 py-2 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  onKeyPress={(e) => e.key === 'Enter' && saveCustomPreset()}
                />
                <button
                  onClick={saveCustomPreset}
                  disabled={!presetName.trim()}
                  className="px-3 py-2 bg-brand-gold text-white rounded text-sm font-medium hover:bg-brand-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSavePreset(false);
                    setPresetName('');
                  }}
                  className="px-3 py-2 text-neutral-600 hover:text-neutral-900 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

