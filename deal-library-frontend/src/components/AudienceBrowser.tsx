'use client';

import { useState, useEffect } from 'react';
import { AudienceSegment } from '@/types/audience';
import { Search, Target, ShoppingCart, Plus, Trash2 } from 'lucide-react';

interface AudienceBrowserProps {
  onAudienceClick: (segment: AudienceSegment) => void;
  onOpenCart: () => void;
  onRequestCustomAudience: () => void;
  onAddToCart: (segment: AudienceSegment) => void;
  onRemoveFromCart: (segmentId: string) => void;
  isInCart: (segmentId: string) => boolean;
  cart: any[];
}

export default function AudienceBrowser({ 
  onAudienceClick,
  onOpenCart,
  onRequestCustomAudience,
  onAddToCart,
  onRemoveFromCart,
  isInCart,
  cart
}: AudienceBrowserProps) {
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [filteredSegments, setFilteredSegments] = useState<AudienceSegment[]>([]);
  const [selectedDemographicCategories, setSelectedDemographicCategories] = useState<string[]>([]);
  const [selectedInterestCategories, setSelectedInterestCategories] = useState<string[]>([]);
  const [selectedCommerceCategories, setSelectedCommerceCategories] = useState<string[]>([]);
  const [selectedDeviceCategories, setSelectedDeviceCategories] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    demographic: false,
    interest: false,
    commerceAudience: true,  // Default expanded
    device: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Group segments by segmentType and extract unique tier2 categories for each type
  const segmentsByType = {
    demographic: segments.filter(s => s.segmentType === 'Demographic'),
    interest: segments.filter(s => s.segmentType === 'Interest'),
    commerceAudience: segments.filter(s => s.segmentType === 'Commerce Audience'),
    device: segments.filter(s => s.segmentType === 'Device')
  };

  // Extract unique tier2 values for each segment type and sort alphabetically
  const demographicCategories = Array.from(new Set(
    segmentsByType.demographic.map(s => s.tier2).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b)) as string[];
  const interestCategories = Array.from(new Set(
    segmentsByType.interest.map(s => s.tier2).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b)) as string[];
  const commerceCategories = Array.from(new Set(
    segmentsByType.commerceAudience.map(s => s.tier2).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b)) as string[];
  const deviceCategories = Array.from(new Set(
    segmentsByType.device.map(s => s.tier2).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b)) as string[];

  // Load segments on mount
  useEffect(() => {
    const loadSegments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3002/api/audiences/browse');
        
        if (!response.ok) {
          throw new Error(`Failed to load audiences: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSegments(data.segments || []);
        setFilteredSegments(data.segments || []);
      } catch (err) {
        console.error('Error loading audiences:', err);
        setError('Failed to load audiences. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSegments();
  }, []);

  // Filter segments
  useEffect(() => {
    let filtered = [...segments];

    // Collect all selected categories across segment types
    const allSelectedCategories = [
      ...selectedDemographicCategories,
      ...selectedInterestCategories,
      ...selectedCommerceCategories,
      ...selectedDeviceCategories
    ];

    // Filter by selected categories (OR logic across types)
    if (allSelectedCategories.length > 0) {
      filtered = filtered.filter(s => 
        s.tier2 && allSelectedCategories.includes(s.tier2)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.segmentName.toLowerCase().includes(query) ||
        s.segmentDescription.toLowerCase().includes(query) ||
        s.fullPath.toLowerCase().includes(query)
      );
    }

    setFilteredSegments(filtered);
  }, [segments, selectedDemographicCategories, selectedInterestCategories, selectedCommerceCategories, selectedDeviceCategories, searchQuery]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => {
      // If clicking on the currently expanded section, collapse it
      if (prev[section]) {
        return { 
          demographic: false, 
          interest: false, 
          commerceAudience: false, 
          device: false 
        };
      }
      // Otherwise, expand only the clicked section and collapse others
      return {
        demographic: section === 'demographic',
        interest: section === 'interest',
        commerceAudience: section === 'commerceAudience',
        device: section === 'device'
      };
    });
  };

  const toggleFilter = (filterArray: string[], setFilter: (val: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(v => v !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedDemographicCategories([]);
    setSelectedInterestCategories([]);
    setSelectedCommerceCategories([]);
    setSelectedDeviceCategories([]);
    setSearchQuery('');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
              <Target className="w-7 h-7 text-brand-orange" />
              Audiences
            </h1>
            <p className="text-neutral-600 mt-1">
              Browse and filter audience segments by category
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onRequestCustomAudience}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Plus className="w-4 h-4" />
              Request Custom Audience
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - Filter Sections */}
      <div className="w-80 bg-white border-r border-neutral-200 flex flex-col h-full overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-neutral-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search audiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
            />
          </div>
        </div>

        {/* Filter Sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Demographic Section */}
          <div className="border-b border-neutral-200">
            <button
              onClick={() => toggleSection('demographic')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">Demographic</span>
                {selectedDemographicCategories.length > 0 && (
                  <span className="px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full">
                    {selectedDemographicCategories.length}
                  </span>
                )}
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${expandedSections.demographic ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.demographic && (
              <div className="px-4 pb-4 space-y-1">
                {demographicCategories.map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDemographicCategories.includes(category)}
                      onChange={() => toggleFilter(selectedDemographicCategories, setSelectedDemographicCategories, category)}
                      className="text-brand-orange focus:ring-brand-orange rounded"
                    />
                    <span className="text-sm text-neutral-600">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Interest Section */}
          <div className="border-b border-neutral-200">
            <button
              onClick={() => toggleSection('interest')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">Interest</span>
                {selectedInterestCategories.length > 0 && (
                  <span className="px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full">
                    {selectedInterestCategories.length}
                  </span>
                )}
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${expandedSections.interest ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.interest && (
              <div className="px-4 pb-4 space-y-1">
                {interestCategories.map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedInterestCategories.includes(category)}
                      onChange={() => toggleFilter(selectedInterestCategories, setSelectedInterestCategories, category)}
                      className="text-brand-orange focus:ring-brand-orange rounded"
                    />
                    <span className="text-sm text-neutral-600">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Commerce Audience Section */}
          <div className="border-b border-neutral-200">
            <button
              onClick={() => toggleSection('commerceAudience')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">Commerce Audience</span>
                {selectedCommerceCategories.length > 0 && (
                  <span className="px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full">
                    {selectedCommerceCategories.length}
                  </span>
                )}
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${expandedSections.commerceAudience ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.commerceAudience && (
              <div className="px-4 pb-4 space-y-1">
                {commerceCategories.map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCommerceCategories.includes(category)}
                      onChange={() => toggleFilter(selectedCommerceCategories, setSelectedCommerceCategories, category)}
                      className="text-brand-orange focus:ring-brand-orange rounded"
                    />
                    <span className="text-sm text-neutral-600">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Device Section */}
          <div className="border-b border-neutral-200">
            <button
              onClick={() => toggleSection('device')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">Device</span>
                {selectedDeviceCategories.length > 0 && (
                  <span className="px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full">
                    {selectedDeviceCategories.length}
                  </span>
                )}
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${expandedSections.device ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.device && (
              <div className="px-4 pb-4 space-y-1">
                {deviceCategories.map((category) => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDeviceCategories.includes(category)}
                      onChange={() => toggleFilter(selectedDeviceCategories, setSelectedDeviceCategories, category)}
                      className="text-brand-orange focus:ring-brand-orange rounded"
                    />
                    <span className="text-sm text-neutral-600">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Clear All Filters Button */}
          <div className="p-4">
            <button
              onClick={clearAllFilters}
              className="w-full text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Audience Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                {loading ? 'Loading...' : 'All Audiences'}
              </h2>
              <p className="text-sm text-neutral-600">
                {loading ? 'Please wait...' : `${filteredSegments.length} audience${filteredSegments.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Error Loading Audiences</h3>
                <p className="text-neutral-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading audiences...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredSegments.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-500 mb-2">No audiences found</h3>
              <p className="text-neutral-400 mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Try selecting different filters'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-secondary"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Audience Grid */}
          {!loading && !error && filteredSegments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 max-w-4xl">
              {filteredSegments.map(segment => {
                const inCart = isInCart(segment.sovrnSegmentId);
                
                return (
                  <div
                    key={segment.sovrnSegmentId}
                    className="card p-4 hover:shadow-sovrn-lg transition-all duration-200 group cursor-pointer"
                    onClick={() => onAudienceClick(segment)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                        {segment.segmentName}
                      </h4>
                      {segment.activelyGenerated && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-neutral-600 mb-3 leading-relaxed line-clamp-2">
                      {segment.segmentDescription}
                    </p>

                    {/* Full Path */}
                    <div className="text-xs text-neutral-500 mb-3 line-clamp-1">
                      {segment.fullPath}
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                        ${segment.cpm.toFixed(2)} CPM
                      </span>
                      <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-800 text-xs font-medium rounded-full">
                        {(segment.mediaPercentCost * 100).toFixed(0)}% Media Cost
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="pt-4 border-t border-neutral-200">
                      {inCart ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromCart(segment.sovrnSegmentId);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove from Cart
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(segment);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-gold/10 text-brand-charcoal hover:bg-brand-gold/20 rounded-lg transition-colors text-sm font-medium"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

