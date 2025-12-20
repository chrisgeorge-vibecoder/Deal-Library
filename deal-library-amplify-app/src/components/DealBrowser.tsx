'use client';

import { useState, useEffect } from 'react';
import { Deal } from '@/types/deal';
import { Search, Filter, Plus } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';
import DealCard from './DealCard';

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categories = [
    { id: 'automotive', name: 'Automotive' },
    { id: 'business', name: 'Business & Finance' },
    { id: 'entertainment', name: 'Entertainment & Gaming' },
    { id: 'family', name: 'Family & Parenting' },
    { id: 'fashion', name: 'Fashion & Beauty' },
    { id: 'food', name: 'Food & Beverage' },
    { id: 'health', name: 'Health & Wellness' },
    { id: 'home', name: 'Home & Garden' },
    { id: 'pets', name: 'Pets & Animals' },
    { id: 'sports', name: 'Sports & Fitness' },
    { id: 'tech', name: 'Technology & Digital' },
    { id: 'travel', name: 'Travel' }
  ];

  const channels = [
    { id: 'App', name: 'Mobile App' },
    { id: 'CTV', name: 'CTV' },
    { id: 'Multi', name: 'Multi-Channel' },
    { id: 'Web', name: 'Web' }
  ];

  const formats = [
    { id: 'Display', name: 'Display' },
    { id: 'Multi-format', name: 'Multi-Format' },
    { id: 'Native', name: 'Native' },
    { id: 'Video', name: 'Video' }
  ];

  // Load deals on component mount
  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/deals');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to load deals: ${response.statusText}`);
        }
        
        const dealsData = await response.json();
        const fetchedDeals = dealsData.deals || [];
        
        if (fetchedDeals.length === 0) {
          // No deals found - this could mean:
          // 1. GOOGLE_APPS_SCRIPT_URL is not configured
          // 2. Google Apps Script is not returning deals
          // 3. All deals are filtered out
          console.warn('⚠️ No deals returned from API. Check GOOGLE_APPS_SCRIPT_URL configuration.');
          setError('No deals found. Please check that GOOGLE_APPS_SCRIPT_URL is configured in your environment variables.');
        } else {
          console.log(`✅ Successfully loaded ${fetchedDeals.length} deals`);
        }
        
        setDeals(fetchedDeals);
        setFilteredDeals(fetchedDeals);
      } catch (err) {
        console.error('❌ Error loading deals:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load deals. Please check your configuration.';
        setError(errorMessage);
        setDeals([]);
        setFilteredDeals([]);
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
    if (selectedCategories.length > 0) {
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
          return keywords.some(keyword => {
            // Use word boundary regex to match whole words only
            // This prevents 'cat' from matching 'vacation' or 'style' from matching 'lifestyle'
            const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i');
            return wordBoundaryRegex.test(dealText);
          });
        });
      });
    }

    // Filter by channels (environment)
    if (selectedChannels.length > 0) {
      filtered = filtered.filter(deal => {
        const environmentLower = deal.environment?.toLowerCase() || '';
        
        // Check if deal matches any selected channel
        return selectedChannels.some(channel => {
          const channelLower = channel.toLowerCase();
          
          // Multi-Channel filter: match deals with "multi", "cross", "all", or multiple channels (contains "/")
          if (channelLower === 'multi') {
            return environmentLower.includes('multi') || 
                   environmentLower.includes('cross') ||
                   environmentLower === 'all' ||
                   environmentLower.includes('/');
          }
          
          // Web channel: match "web" or "desktop" (but not as part of other words)
          if (channelLower === 'web') {
            // Use word boundary checks to avoid false matches
            return /\bweb\b/.test(environmentLower) || 
                   environmentLower.includes('desktop');
          }
          
          // App channel: match "app" or "mobile app"
          if (channelLower === 'app') {
            return environmentLower.includes('app') || 
                   environmentLower.includes('mobile');
          }
          
          // CTV channel: match "ctv" or "connected tv"
          if (channelLower === 'ctv') {
            return environmentLower.includes('ctv') || 
                   environmentLower.includes('connected tv');
          }
          
          // Fallback: exact match (shouldn't reach here for standard channels)
          return environmentLower === channelLower;
        });
      });
    }

    // Filter by formats (media type)
    if (selectedFormats.length > 0) {
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
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
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
    const activeFilters: { type: string; id: string; name: string }[] = [];
    
    selectedCategories.forEach(categoryId => {
      const category = categories.find(c => c.id === categoryId);
      if (category) activeFilters.push({ type: 'category', id: categoryId, name: category.name });
    });
    
    selectedChannels.forEach(channelId => {
      const channel = channels.find(c => c.id === channelId);
      if (channel) activeFilters.push({ type: 'channel', id: channelId, name: channel.name });
    });
    
    selectedFormats.forEach(formatId => {
      const format = formats.find(f => f.id === formatId);
      if (format) activeFilters.push({ type: 'format', id: formatId, name: format.name });
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


  return (
    <>
      {/* Mobile filter backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity lg:hidden z-40 ${
          mobileFiltersOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileFiltersOpen(false)}
        aria-hidden="true"
      />
      
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 flex items-center gap-2 sm:gap-3">
                <ShoppingCart className="w-5 h-5 sm:w-7 sm:h-7 text-brand-orange" />
                Deal Library
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 mt-1 hidden sm:block">
                Browse and discover advertising deals from the Sovrn Exchange
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 min-h-[44px] bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors touch-manipulation active:scale-95"
                aria-label="Toggle filters"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="px-2 py-0.5 bg-brand-orange text-white text-xs rounded-full min-w-[20px] text-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
              <button
                onClick={onRequestCustomDeal}
                className="btn-primary flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 min-h-[44px] text-sm sm:text-base touch-manipulation active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Request Custom Deal</span>
                <span className="sm:hidden">Request</span>
              </button>
            </div>
          </div>
          
          {/* Mobile search bar */}
          <div className="mt-3 lg:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 min-h-[44px] border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-base touch-manipulation"
              />
            </div>
          </div>
        </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Three-Section Filters */}
        <div 
          className={`fixed lg:static left-0 top-0 w-72 h-screen lg:h-full bg-white border-r border-neutral-200 flex flex-col z-50 shadow-lg lg:shadow-none transform transition-transform duration-300 ${
            mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Mobile filter header */}
          <div className="lg:hidden p-4 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-2 rounded hover:bg-neutral-100 transition-colors touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close filters"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Desktop Search */}
          <div className="hidden lg:block p-4 border-b border-neutral-200 flex-shrink-0">
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

          {/* Filter Sections - scrollable container */}
          <div className="flex-1 overflow-y-auto">
            {/* Categories Section */}
            <div className="border-b border-neutral-200">
              <button
                onClick={() => toggleSection('categories')}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
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
                <div className="px-4 pb-3 space-y-0.5">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2.5 cursor-pointer py-1.5 hover:bg-neutral-50 rounded px-1 -mx-1">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="w-4 h-4 text-brand-orange focus:ring-brand-orange rounded border-neutral-300 cursor-pointer"
                      />
                      <span className="text-sm text-neutral-600 select-none">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Channels Section */}
            <div className="border-b border-neutral-200">
              <button
                onClick={() => toggleSection('channels')}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
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
                <div className="px-4 pb-3 space-y-0.5">
                  {channels.map((channel) => (
                    <label key={channel.id} className="flex items-center gap-2.5 cursor-pointer py-1.5 hover:bg-neutral-50 rounded px-1 -mx-1">
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes(channel.id)}
                        onChange={() => toggleChannel(channel.id)}
                        className="w-4 h-4 text-brand-orange focus:ring-brand-orange rounded border-neutral-300 cursor-pointer"
                      />
                      <span className="text-sm text-neutral-600 select-none">{channel.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Formats Section */}
            <div className="border-b border-neutral-200">
              <button
                onClick={() => toggleSection('formats')}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
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
                <div className="px-4 pb-3 space-y-0.5">
                  {formats.map((format) => (
                    <label key={format.id} className="flex items-center gap-2.5 cursor-pointer py-1.5 hover:bg-neutral-50 rounded px-1 -mx-1">
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(format.id)}
                        onChange={() => toggleFormat(format.id)}
                        className="w-4 h-4 text-brand-orange focus:ring-brand-orange rounded border-neutral-300 cursor-pointer"
                      />
                      <span className="text-sm text-neutral-600 select-none">{format.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Deal Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-neutral-700">Active Filters</h3>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-brand-orange hover:text-brand-orange/80 font-medium min-h-[44px] px-2 touch-manipulation active:scale-95"
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
                        className="hover:bg-brand-orange/20 rounded-full p-1 min-w-[24px] min-h-[24px] flex items-center justify-center touch-manipulation active:scale-95"
                        aria-label={`Remove ${filter.name} filter`}
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
                    className="btn-secondary min-h-[44px] px-4 touch-manipulation active:scale-95"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 max-w-4xl">
                {filteredDeals.map((deal, index) => (
                  <DealCard
                    key={`deal-${deal.id}-${index}`}
                    deal={deal}
                    onClick={() => handleDealClick(deal)}
                    onAddToCart={() => onAddToCart(deal)}
                    onRemoveFromCart={() => onRemoveFromCart(deal.id)}
                    isInCart={isInCart(deal.id)}
                    showBidGuidance={true}
                    showMediaType={true}
                    compact={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
