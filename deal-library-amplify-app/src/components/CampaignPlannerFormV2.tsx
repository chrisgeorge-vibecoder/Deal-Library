'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Loader, Search, X, Check } from 'lucide-react';
import { audienceInsightsReports } from '@/data/audienceInsightsReports';

interface CampaignPlannerFormV2Props {
  onSubmit: (formData: CampaignPlannerFormData) => void;
  disabled?: boolean;
}

export interface CampaignPlannerFormData {
  advertiserName: string;
  selectedAudiences: string[]; // Array of segment names
  campaignObjective: string;
  budgetRange?: string;
  geographicFocus?: string;
}

const CAMPAIGN_OBJECTIVES = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'consideration', label: 'Consideration & Engagement' },
  { value: 'conversion', label: 'Drive Conversions & Sales' },
  { value: 'full-funnel', label: 'Full Funnel' },
];

// Get all available segment names from pre-generated reports
const getAllSegments = (): string[] => {
  return Object.keys(audienceInsightsReports).sort();
};

export default function CampaignPlannerFormV2({ onSubmit, disabled = false }: CampaignPlannerFormV2Props) {
  const [formData, setFormData] = useState<CampaignPlannerFormData>({
    advertiserName: '',
    selectedAudiences: [],
    campaignObjective: '',
    budgetRange: '',
    geographicFocus: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Get all segments (computed once)
  const allSegments = useMemo(() => getAllSegments(), []);

  // Filter segments based on search query with improved matching
  const filteredSegments = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSegments.slice(0, 50); // Show first 50 when no search
    }
    const query = searchQuery.toLowerCase().trim();
    
    // Filter with better matching logic
    const filtered = allSegments.filter(segment => {
      const lowerSegment = segment.toLowerCase();
      
      // Exact match gets highest priority
      if (lowerSegment === query) return true;
      
      // Starts with match (high priority)
      if (lowerSegment.startsWith(query)) return true;
      
      // Word boundary match (avoid substring matches like "car" in "care")
      const words = lowerSegment.split(/[\s&]+/);
      if (words.some(word => word.startsWith(query))) return true;
      
      // Contains match (lowest priority)
      return lowerSegment.includes(query);
    });
    
    // Sort by relevance
    const sorted = filtered.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      // Prioritize exact matches
      if (aLower === query && bLower !== query) return -1;
      if (bLower === query && aLower !== query) return 1;
      
      // Prioritize starts-with matches
      const aStarts = aLower.startsWith(query);
      const bStarts = bLower.startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;
      
      // Alphabetical for same priority
      return a.localeCompare(b);
    });
    
    return sorted.slice(0, 50); // Limit to 50 results for performance
  }, [searchQuery, allSegments]);

  const handleAddAudience = (segment: string) => {
    if (!formData.selectedAudiences.includes(segment) && formData.selectedAudiences.length < 3) {
      setFormData(prev => ({
        ...prev,
        selectedAudiences: [...prev.selectedAudiences, segment]
      }));
      setSearchQuery('');
      setShowDropdown(false);
      setErrors(prev => ({ ...prev, selectedAudiences: '' }));
    }
  };

  const handleRemoveAudience = (segment: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAudiences: prev.selectedAudiences.filter(s => s !== segment)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.advertiserName.trim()) {
      newErrors.advertiserName = 'Advertiser name is required';
    }

    if (formData.selectedAudiences.length === 0) {
      newErrors.selectedAudiences = 'Please select at least one audience';
    }

    if (!formData.campaignObjective) {
      newErrors.campaignObjective = 'Please select a campaign objective';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Transform to match old form data format for compatibility
    onSubmit({
      advertiserName: formData.advertiserName,
      targetAudiences: formData.selectedAudiences,
      campaignObjectives: [formData.campaignObjective],
      budgetRange: formData.budgetRange,
      geographicFocus: formData.geographicFocus,
    } as any);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        advertiserName: '',
        selectedAudiences: [],
        campaignObjective: '',
        budgetRange: '',
        geographicFocus: '',
      });
      setSearchQuery('');
      setShowDropdown(false);
      setErrors({});
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Details</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Advertiser Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Advertiser Name
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.advertiserName}
            onChange={(e) => setFormData(prev => ({ ...prev, advertiserName: e.target.value }))}
            placeholder="e.g., Nike, Starbucks, Tesla"
            className={`input w-full ${errors.advertiserName ? 'border-red-500' : ''}`}
            disabled={disabled}
          />
          {errors.advertiserName && (
            <p className="text-red-500 text-sm mt-1">{errors.advertiserName}</p>
          )}
        </div>

        {/* Audience Selector - Searchable Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audiences
            <span className="text-red-500 ml-1">*</span>
            <span className="text-gray-400 ml-2 text-xs">(Select 1-3 audiences)</span>
          </label>
          
          {/* Selected Audiences Display */}
          {formData.selectedAudiences.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.selectedAudiences.map((segment) => (
                <span
                  key={segment}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
                >
                  {segment}
                  <button
                    type="button"
                    onClick={() => handleRemoveAudience(segment)}
                    className="hover:text-purple-900"
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search Input */}
          {formData.selectedAudiences.length < 3 && (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search for audience segments (e.g., Sports, Fitness, Tech)"
                  className={`input w-full pl-10 ${errors.selectedAudiences ? 'border-red-500' : ''}`}
                  disabled={disabled}
                />
              </div>

              {/* Dropdown Results */}
              {showDropdown && filteredSegments.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredSegments
                    .filter(segment => !formData.selectedAudiences.includes(segment))
                    .map((segment) => (
                      <button
                        key={segment}
                        type="button"
                        onClick={() => handleAddAudience(segment)}
                        className="w-full text-left px-4 py-2 hover:bg-purple-50 transition-colors flex items-center justify-between"
                        disabled={disabled}
                      >
                        <span className="text-sm text-gray-900">{segment}</span>
                        {formData.selectedAudiences.includes(segment) && (
                          <Check className="w-4 h-4 text-purple-600" />
                        )}
                      </button>
                    ))}
                  {filteredSegments.filter(segment => !formData.selectedAudiences.includes(segment)).length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                      All matching segments already selected
                    </div>
                  )}
                </div>
              )}

              {showDropdown && searchQuery && filteredSegments.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 text-sm text-gray-500 text-center">
                  No segments found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}

          {errors.selectedAudiences && (
            <p className="text-red-500 text-sm mt-1">{errors.selectedAudiences}</p>
          )}

          {formData.selectedAudiences.length >= 3 && (
            <p className="text-sm text-gray-500 mt-2">
              Maximum of 3 audiences selected. Remove one to add another.
            </p>
          )}
        </div>

        {/* Campaign Objective */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Objective
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CAMPAIGN_OBJECTIVES.map((objective) => (
              <button
                key={objective.value}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, campaignObjective: objective.value }));
                  setErrors(prev => ({ ...prev, campaignObjective: '' }));
                }}
                className={`px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors touch-manipulation active:scale-95 ${
                  formData.campaignObjective === objective.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${errors.campaignObjective ? 'border-2 border-red-500' : ''}`}
                disabled={disabled}
              >
                {objective.label}
              </button>
            ))}
          </div>
          {errors.campaignObjective && (
            <p className="text-red-500 text-sm mt-1">{errors.campaignObjective}</p>
          )}
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Range
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.budgetRange}
            onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
            placeholder="e.g., $100K-$250K, $1M+"
            className="input w-full"
            disabled={disabled}
          />
        </div>

        {/* Geographic Focus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Geographic Focus
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.geographicFocus}
            onChange={(e) => setFormData(prev => ({ ...prev, geographicFocus: e.target.value }))}
            placeholder="e.g., US National, Northeast US, Major metros"
            className="input w-full"
            disabled={disabled}
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
          >
            {disabled ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Campaign
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 min-h-[44px] bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium touch-manipulation active:scale-95"
            disabled={disabled}
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

