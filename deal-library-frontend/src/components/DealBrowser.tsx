'use client';

import { useState, useEffect } from 'react';
import { Deal } from '@/types/deal';
import { Search, Filter, ShoppingCart, Trash2, Plus, Monitor, Video, Smartphone, Radio, Square, Globe, Tv } from 'lucide-react';

interface DealBrowserProps {
  onDealClick: (deal: Deal) => void;
  onAddToCart: (deal: Deal) => void;
  onRemoveFromCart: (dealId: string) => void;
  isInCart: (dealId: string) => boolean;
  onRequestCustomDeal: () => void;
  cart: Deal[];
  onOpenCart: () => void;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: any;
  mediaTypes: string[];
}

export default function DealBrowser({ 
  onDealClick, 
  onAddToCart, 
  onRemoveFromCart, 
  isInCart,
  onRequestCustomDeal,
  cart,
  onOpenCart
}: DealBrowserProps) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    channels: false,
    formats: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'pets', name: 'Pets & Animals' },
    { id: 'entertainment', name: 'Entertainment & Gaming' },
    { id: 'food', name: 'Food & Beverage' },
    { id: 'fashion', name: 'Fashion & Beauty' },
    { id: 'family', name: 'Family & Parenting' },
    { id: 'sports', name: 'Sports & Fitness' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'tech', name: 'Technology & Digital' },
    { id: 'automotive', name: 'Automotive' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'travel', name: 'Travel' },
    { id: 'business', name: 'Business & Finance' }
  ];

  const channels = [
    { id: 'all', name: 'All Channels' },
    { id: 'Web', name: 'Web' },
    { id: 'App', name: 'Mobile App' },
    { id: 'CTV', name: 'CTV' },
    { id: 'Multi', name: 'Multi-Channel' }
  ];

  const formats = [
    { id: 'all', name: 'All Formats' },
    { id: 'Display', name: 'Display' },
    { id: 'Video', name: 'Video' },
    { id: 'Native', name: 'Native' },
    { id: 'Multi-format', name: 'Multi-Format' }
  ];

  // Load deals on component mount
  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('http://localhost:3001/api/deals');
        
        if (!response.ok) {
          throw new Error(`Failed to load deals: ${response.statusText}`);
        }
        
        const dealsData = await response.json();
        setDeals(dealsData.deals || []);
        setFilteredDeals(dealsData.deals || []);
      } catch (err) {
        console.error('Error loading deals:', err);
        setError('Failed to load deals. Please try again later.');
        // Use mock data as fallback
        const mockDeals = [
          {
            id: 'deal-1',
            dealId: 'DEAL001',
            dealName: 'Premium Display Network',
            description: 'High-impact display advertising across premium publisher network',
            mediaType: 'Display',
            environment: 'Web',
            bidGuidance: '$2.50 - $5.00 CPM',
            targeting: 'Demographic, Behavioral',
            sampleData: true
          },
          {
            id: 'deal-2',
            dealId: 'DEAL002',
            dealName: 'Video Pre-roll Package',
            description: 'Premium video pre-roll advertising on top streaming platforms',
            mediaType: 'Video',
            environment: 'CTV',
            bidGuidance: '$15.00 - $25.00 CPM',
            targeting: 'Interest-based, Lookalike',
            sampleData: true
          }
        ];
        setDeals(mockDeals);
        setFilteredDeals(mockDeals);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  // Filter deals based on selected categories, channels, formats, and search query
  useEffect(() => {
    let filtered = [...deals];

    // Filter by categories (business verticals)
    if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
      // For now, we'll use a simple keyword matching approach
      // In a real implementation, deals would have category metadata
      const categoryKeywords = {
        'pets': ['pet', 'animal', 'dog', 'cat', 'veterinary'],
        'entertainment': ['entertainment', 'gaming', 'movie', 'music', 'streaming'],
        'food': ['food', 'restaurant', 'beverage', 'cooking', 'dining'],
        'fashion': ['fashion', 'beauty', 'clothing', 'style', 'cosmetics'],
        'family': ['family', 'parenting', 'children', 'baby', 'kids'],
        'sports': ['sports', 'fitness', 'athletic', 'gym', 'exercise'],
        'home': ['home', 'garden', 'furniture', 'decor', 'improvement'],
        'tech': ['technology', 'digital', 'software', 'gadget', 'electronics'],
        'automotive': ['automotive', 'car', 'vehicle', 'auto', 'transportation'],
        'health': ['health', 'wellness', 'medical', 'fitness', 'pharmacy'],
        'travel': ['travel', 'tourism', 'vacation', 'hotel', 'flight'],
        'business': ['business', 'finance', 'professional', 'corporate', 'investment']
      };

      filtered = filtered.filter(deal => {
        const dealText = `${deal.dealName} ${deal.description}`.toLowerCase();
        return selectedCategories.some(categoryId => {
          const keywords = categoryKeywords[categoryId as keyof typeof categoryKeywords] || [];
          return keywords.some(keyword => dealText.includes(keyword));
        });
      });
    }

    // Filter by channels (environment)
    if (selectedChannels.length > 0 && !selectedChannels.includes('all')) {
      filtered = filtered.filter(deal => {
        if (selectedChannels.includes('Multi')) {
          return deal.environment?.toLowerCase().includes('multi') || 
                 deal.environment?.toLowerCase().includes('cross');
        }
        return selectedChannels.some(channel => 
          deal.environment?.toLowerCase() === channel.toLowerCase()
        );
      });
    }

    // Filter by formats (media type)
    if (selectedFormats.length > 0 && !selectedFormats.includes('all')) {
      filtered = filtered.filter(deal => {
        if (selectedFormats.includes('Multi-format')) {
          return deal.mediaType?.toLowerCase().includes('multi') || 
                 deal.mediaType?.toLowerCase().includes('cross');
        }
        return selectedFormats.some(format => 
          deal.mediaType?.toLowerCase().includes(format.toLowerCase())
        );
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.dealName?.toLowerCase().includes(query) ||
        deal.description?.toLowerCase().includes(query) ||
        deal.mediaType?.toLowerCase().includes(query)
      );
    }

    setFilteredDeals(filtered);
  }, [deals, selectedCategories, selectedChannels, selectedFormats, searchQuery]);

  const handleDealClick = (deal: Deal) => {
    onDealClick(deal);
  };

  // Helper functions for filter management
  const toggleCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev => 
        prev.includes(categoryId) 
          ? prev.filter(id => id !== categoryId)
          : [...prev, categoryId]
      );
    }
  };

  const toggleChannel = (channelId: string) => {
    if (channelId === 'all') {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(prev => 
        prev.includes(channelId) 
          ? prev.filter(id => id !== channelId)
          : [...prev, channelId]
      );
    }
  };

  const toggleFormat = (formatId: string) => {
    if (formatId === 'all') {
      setSelectedFormats([]);
    } else {
      setSelectedFormats(prev => 
        prev.includes(formatId) 
          ? prev.filter(id => id !== formatId)
          : [...prev, formatId]
      );
    }
  };

  const toggleSection = (section: 'categories' | 'channels' | 'formats') => {
    setExpandedSections(prev => {
      // If clicking on the currently expanded section, collapse it
      if (prev[section]) {
        return {
          categories: false,
          channels: false,
          formats: false
        };
      }
      // Otherwise, expand only the clicked section and collapse others
      return {
        categories: section === 'categories',
        channels: section === 'channels',
        formats: section === 'formats'
      };
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedChannels([]);
    setSelectedFormats([]);
  };

  const getActiveFiltersCount = () => {
    return selectedCategories.length + selectedChannels.length + selectedFormats.length;
  };

  const getActiveFilters = () => {
    const activeFilters = [];
    
    selectedCategories.forEach(categoryId => {
      if (categoryId !== 'all') {
        const category = categories.find(c => c.id === categoryId);
        if (category) activeFilters.push({ type: 'category', id: categoryId, name: category.name });
      }
    });
    
    selectedChannels.forEach(channelId => {
      if (channelId !== 'all') {
        const channel = channels.find(c => c.id === channelId);
        if (channel) activeFilters.push({ type: 'channel', id: channelId, name: channel.name });
      }
    });
    
    selectedFormats.forEach(formatId => {
      if (formatId !== 'all') {
        const format = formats.find(f => f.id === formatId);
        if (format) activeFilters.push({ type: 'format', id: formatId, name: format.name });
      }
    });
    
    return activeFilters;
  };

  const removeFilter = (type: string, id: string) => {
    if (type === 'category') {
      setSelectedCategories(prev => prev.filter(catId => catId !== id));
    } else if (type === 'channel') {
      setSelectedChannels(prev => prev.filter(channelId => channelId !== id));
    } else if (type === 'format') {
      setSelectedFormats(prev => prev.filter(formatId => formatId !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Error Loading Deals</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }


  // Debug logging
  console.log('🔍 DealBrowser Debug: Component rendering');
  console.log('🔍 DealBrowser Debug: filteredDeals.length:', filteredDeals.length);
  console.log('🔍 DealBrowser Debug: expandedSections:', expandedSections);

  return (
    <div 
      className="h-screen flex flex-col"
      onScroll={(e) => {
        console.log('🚨 MAIN CONTAINER SCROLLING DETECTED:', e.target);
        console.log('🚨 Main scroll position:', e.currentTarget.scrollTop);
      }}
    >
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-brand-orange" />
              Deal Library
            </h1>
            <p className="text-neutral-600 mt-1">
              Browse and discover advertising deals from the Sovrn Exchange
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCart}
              className="btn-secondary flex items-center gap-2 px-6 py-3 relative"
            >
              <ShoppingCart className="w-4 h-4" />
              My Selections
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-brand-orange text-white rounded-full text-xs font-semibold">
                  {cart.length}
                </span>
              )}
            </button>
            <button
              onClick={onRequestCustomDeal}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Plus className="w-4 h-4" />
              Request Custom Deal
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Three-Section Filters */}
        <div 
          className="w-80 bg-white border-r border-neutral-200 flex flex-col h-full overflow-hidden"
          onWheel={(e) => {
            // Prevent scroll event from bubbling up to the main page
            e.stopPropagation();
            console.log('🚨 SIDEBAR WHEEL EVENT DETECTED - PREVENTING BUBBLE:', e.target);
          }}
        >
          {/* Search */}
          <div className="p-4 border-b border-neutral-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange"
              />
            </div>
          </div>

          {/* Filter Sections */}
          <div 
            className="flex-1"
            onWheel={(e) => {
              // Prevent scroll event from bubbling up to the main page
              e.stopPropagation();
              console.log('🚨 FILTER SECTIONS WHEEL EVENT DETECTED - PREVENTING BUBBLE:', e.target);
            }}
          >
            {/* Categories Section */}
            <div className="border-b border-neutral-200">
              <button
                onClick={() => toggleSection('categories')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">Categories</span>
                  {selectedCategories.length > 0 && (
                    <span className="px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full">
                      {selectedCategories.length}
                    </span>
                  )}
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections.categories && (
                <div className="px-4 pb-4 space-y-1">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="text-brand-orange focus:ring-brand-orange rounded"
                      />
                      <span className="text-sm text-neutral-600">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Channels Section */}
            <div className="border-b border-neutral-200">
              <button
                onClick={() => toggleSection('channels')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">Channels</span>
                  {selectedChannels.length > 0 && (
                    <span className="px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full">
                      {selectedChannels.length}
                    </span>
                  )}
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${expandedSections.channels ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections.channels && (
                <div className="px-4 pb-4 space-y-1">
                  {channels.map((channel) => (
                    <label key={channel.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes(channel.id)}
                        onChange={() => toggleChannel(channel.id)}
                        className="text-brand-orange focus:ring-brand-orange rounded"
                      />
                      <span className="text-sm text-neutral-600">{channel.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Formats Section */}
            <div className="border-b border-neutral-200">
              <button
                onClick={() => toggleSection('formats')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-900">Formats</span>
                  {selectedFormats.length > 0 && (
                    <span className="px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full">
                      {selectedFormats.length}
                    </span>
                  )}
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${expandedSections.formats ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections.formats && (
                <div className="px-4 pb-4 space-y-1">
                  {formats.map((format) => (
                    <label key={format.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(format.id)}
                        onChange={() => toggleFormat(format.id)}
                        className="text-brand-orange focus:ring-brand-orange rounded"
                      />
                      <span className="text-sm text-neutral-600">{format.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Deal Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-neutral-700">Active Filters</h3>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-brand-orange hover:text-brand-orange/80 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getActiveFilters().map((filter) => (
                    <div
                      key={`${filter.type}-${filter.id}`}
                      className="flex items-center gap-2 px-3 py-1 bg-brand-orange/10 text-brand-orange rounded-full text-sm"
                    >
                      <span>{filter.name}</span>
                      <button
                        onClick={() => removeFilter(filter.type, filter.id)}
                        className="hover:bg-brand-orange/20 rounded-full p-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">
                  {getActiveFiltersCount() > 0 ? 'Filtered Deals' : 'All Deals'}
                </h2>
                <p className="text-sm text-neutral-600">
                  {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              {getActiveFiltersCount() > 0 && (
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Filter className="w-4 h-4" />
                  <span>{getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied</span>
                </div>
              )}
            </div>

            {/* Deal Grid */}
            {filteredDeals.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-500 mb-2">No deals found</h3>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 max-w-4xl">
                {filteredDeals.map((deal, index) => (
                  <div 
                    key={`deal-${deal.id}-${index}-${deal.dealName?.replace(/\s+/g, '-').toLowerCase() || 'unknown'}-${deal.environment || 'unknown'}-${deal.mediaType || 'unknown'}-${deal.bidGuidance || 'unknown'}-${deal.publisher || 'unknown'}-${deal.dealType || 'unknown'}-${deal.startDate || 'unknown'}-${deal.endDate || 'unknown'}`}
                    className="card p-4 cursor-pointer hover:shadow-sovrn-lg transition-all duration-200 group"
                    onClick={() => handleDealClick(deal)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                        {deal.dealName}
                      </h4>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                      {deal.description}
                    </p>

                    {/* Environment and Media Type */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                        {deal.environment}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-800 text-xs font-medium rounded-full">
                        {deal.mediaType}
                      </span>
                    </div>

                    {/* Bid Guidance */}
                    {deal.bidGuidance && (
                      <div className="mb-3">
                        <span className="text-xs text-neutral-500 font-medium">Bid Guidance:</span>
                        <span className="text-xs text-neutral-600 ml-1">{deal.bidGuidance}</span>
                      </div>
                    )}

                    {/* Add to Selections Button */}
                    <div className="pt-3 border-t border-neutral-200">
                      {isInCart(deal.id) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromCart(deal.id);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove from Selections
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(deal);
                          }}
                          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                            isInCart(deal.id)
                              ? 'bg-gradient-to-r from-brand-gold to-brand-orange text-white hover:from-brand-gold/90 hover:to-brand-orange/90' 
                              : 'bg-brand-gold/10 text-brand-charcoal hover:bg-brand-gold/20'
                          }`}
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Add to Selections
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
