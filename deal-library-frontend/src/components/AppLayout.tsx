'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Create context for sidebar state
const SidebarContext = createContext<{
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}>({
  sidebarOpen: true,
  setSidebarOpen: () => {}
});

export const useSidebar = () => useContext(SidebarContext);

// Create context for save/unsave functionality
const SaveCardContext = createContext<{
  onSaveCard: (card: { type: string, data: any }) => void;
  onUnsaveCard: (cardId: string) => void;
  isSaved: (cardId: string) => boolean;
}>({
  onSaveCard: () => {},
  onUnsaveCard: () => {},
  isSaved: () => false
});

export const useSaveCard = () => useContext(SaveCardContext);

// Create context for cart functionality
const CartContext = createContext<{
  onAddToCart: (deal: any) => void;
  onRemoveFromCart: (dealId: string) => void;
  isInCart: (dealId: string) => boolean;
  cart: any[];
}>({
  onAddToCart: () => {},
  onRemoveFromCart: () => {},
  isInCart: () => false,
  cart: []
});

export const useCart = () => useContext(CartContext);
import Sidebar from './Sidebar';
import PersonaDetailModal from './PersonaDetailModal';
import { AudienceInsightsDetailModal } from './AudienceInsightsDetailModal';
import { MarketSizingDetailModal } from './MarketSizingDetailModal';
import GeoDetailModal from './GeoDetailModal';
import DealDetailModal from './DealDetailModal';
import { MarketingSWOTDetailModal } from './MarketingSWOTDetailModal';
import { CompanyProfileDetailModal } from './CompanyProfileDetailModal';
import { MarketingNewsDetailModal } from './MarketingNewsDetailModal';
import { CompetitiveIntelligenceDetailModal } from './CompetitiveIntelligenceDetailModal';
import { ContentStrategyDetailModal } from './ContentStrategyDetailModal';
import { BrandStrategyDetailModal } from './BrandStrategyDetailModal';
import CampaignBriefModal from './CampaignBriefModal';
import CustomDealForm from './CustomDealForm';
import { Deal, Persona, AudienceInsights, GeoCard, MarketingSWOT, CompanyProfile, MarketingNews, CompetitiveIntelligence, ContentStrategy, BrandStrategy, CampaignBrief } from '@/types/deal';
import { MarketSizing } from '@/components/MarketSizingCard';
import { SavedCard } from '@/types/deal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  // Modal states
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [selectedAudienceInsights, setSelectedAudienceInsights] = useState<AudienceInsights | null>(null);
  const [isAudienceInsightsModalOpen, setIsAudienceInsightsModalOpen] = useState(false);
  const [selectedMarketSizing, setSelectedMarketSizing] = useState<MarketSizing | null>(null);
  const [isMarketSizingModalOpen, setIsMarketSizingModalOpen] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState<GeoCard | null>(null);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedMarketingSWOT, setSelectedMarketingSWOT] = useState<MarketingSWOT | null>(null);
  const [isMarketingSWOTModalOpen, setIsMarketingSWOTModalOpen] = useState(false);
  const [selectedCompanyProfile, setSelectedCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isCompanyProfileModalOpen, setIsCompanyProfileModalOpen] = useState(false);
  const [selectedMarketingNews, setSelectedMarketingNews] = useState<MarketingNews | null>(null);
  const [isMarketingNewsModalOpen, setIsMarketingNewsModalOpen] = useState(false);
  const [selectedCompetitiveIntel, setSelectedCompetitiveIntel] = useState<CompetitiveIntelligence | null>(null);
  const [isCompetitiveIntelModalOpen, setIsCompetitiveIntelModalOpen] = useState(false);
  const [selectedContentStrategy, setSelectedContentStrategy] = useState<ContentStrategy | null>(null);
  const [isContentStrategyModalOpen, setIsContentStrategyModalOpen] = useState(false);
  const [selectedBrandStrategy, setSelectedBrandStrategy] = useState<BrandStrategy | null>(null);
  const [isBrandStrategyModalOpen, setIsBrandStrategyModalOpen] = useState(false);
  const [selectedCampaignBrief, setSelectedCampaignBrief] = useState<any | null>(null);
  const [isCampaignBriefModalOpen, setIsCampaignBriefModalOpen] = useState(false);
  
  // Cart and Custom Deal Form states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomDealFormOpen, setIsCustomDealFormOpen] = useState(false);
  const [cart, setCart] = useState<Deal[]>([]);

  // Load saved cards from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedCards');
    if (saved) {
      try {
        setSavedCards(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved cards:', error);
      }
    }
  }, []);

  // Save cards to localStorage whenever savedCards changes
  useEffect(() => {
    localStorage.setItem('savedCards', JSON.stringify(savedCards));
  }, [savedCards]);

  const handleSaveCard = (card: { type: string, data: any }) => {
    const newCard: SavedCard = {
      type: card.type as SavedCard['type'],
      data: card.data,
      savedAt: new Date().toISOString()
    };
    setSavedCards(prev => [...prev, newCard]);
  };

  const handleUnsaveCard = (cardId: string) => {
    setSavedCards(prev => prev.filter(card => {
      const id = getCardId(card);
      return id !== cardId;
    }));
  };

  const isCardSaved = (cardId: string) => {
    return savedCards.some(card => getCardId(card) === cardId);
  };

  // Helper function to get card ID
  const getCardId = (card: SavedCard | { type: string, data: any }) => {
    switch (card.type) {
      case 'deal':
        return `deal-${(card.data as Deal).dealId}`;
      case 'persona':
        return `persona-${(card.data as Persona).id}`;
      case 'audience-insights':
        return `audience-insights-${(card.data as AudienceInsights).audienceName}`;
      case 'market-sizing':
        return `market-sizing-${(card.data as MarketSizing).marketName}`;
      case 'geo-cards':
        return `geo-cards-${(card.data as GeoCard).id}`;
      case 'marketing-swot':
        return `marketing-swot-${(card.data as MarketingSWOT).companyName}`;
      case 'company-profile':
        return `company-profile-${(card.data as CompanyProfile).stockSymbol}`;
      case 'marketing-news':
        return `marketing-news-${(card.data as MarketingNews).id}`;
      case 'competitive-intelligence':
        return `competitive-intelligence-${(card.data as any).competitorOrIndustry}`;
      case 'content-strategy':
        return `content-strategy-${(card.data as any).industryOrTopic}`;
      case 'brand-strategy':
        return `brand-strategy-${(card.data as any).brandOrCategory}`;
      case 'research':
        return `research-${(card.data as any).id}`;
      case 'market-profile':
        return `market-profile-${(card.data as any).geoLevel}-${(card.data as any).name}`;
      case 'campaign-brief':
        return `campaign-brief-${(card.data as any).marketGeoLevel}-${(card.data as any).marketName}`;
      default:
        return '';
    }
  };

  const handleCardClick = (card: SavedCard) => {
    console.log('📋 Saved card clicked:', card.type, card.data);
    
    // Open the appropriate modal based on card type
    switch (card.type) {
      case 'persona':
        setSelectedPersona(card.data as Persona);
        setIsPersonaModalOpen(true);
        break;
      case 'audience-insights':
        setSelectedAudienceInsights(card.data as AudienceInsights);
        setIsAudienceInsightsModalOpen(true);
        break;
      case 'market-sizing':
        setSelectedMarketSizing(card.data as any);
        setIsMarketSizingModalOpen(true);
        break;
      case 'geo-cards':
        setSelectedGeo(card.data as GeoCard);
        setIsGeoModalOpen(true);
        break;
      case 'deal':
        setSelectedDeal(card.data as Deal);
        setIsDealModalOpen(true);
        break;
      case 'marketing-swot':
        setSelectedMarketingSWOT(card.data as MarketingSWOT);
        setIsMarketingSWOTModalOpen(true);
        break;
      case 'company-profile':
        setSelectedCompanyProfile(card.data as CompanyProfile);
        setIsCompanyProfileModalOpen(true);
        break;
      case 'marketing-news':
        setSelectedMarketingNews(card.data as MarketingNews);
        setIsMarketingNewsModalOpen(true);
        break;
      case 'competitive-intelligence':
        setSelectedCompetitiveIntel(card.data as CompetitiveIntelligence);
        setIsCompetitiveIntelModalOpen(true);
        break;
      case 'content-strategy':
        // Validate the content strategy data before opening modal
        const contentStrategyData = card.data as ContentStrategy;
        if (contentStrategyData && 
            contentStrategyData.industryOrTopic &&
            contentStrategyData.trendingTopics &&
            Array.isArray(contentStrategyData.trendingTopics) &&
            contentStrategyData.contentRecommendations &&
            contentStrategyData.seoOpportunities &&
            contentStrategyData.editorialCalendar &&
            Array.isArray(contentStrategyData.editorialCalendar)) {
          setSelectedContentStrategy(contentStrategyData);
          setIsContentStrategyModalOpen(true);
        } else {
          console.error('Invalid content strategy data in saved card:', contentStrategyData);
          // Don't show error for saved cards, just skip opening the modal
        }
        break;
      case 'brand-strategy':
        // Validate the brand strategy data before opening modal
        const brandStrategyData = card.data as BrandStrategy;
        if (brandStrategyData && 
            brandStrategyData.brandOrCategory &&
            brandStrategyData.positioning &&
            brandStrategyData.messagingFramework &&
            brandStrategyData.brandVoice &&
            brandStrategyData.strategicRecommendations &&
            Array.isArray(brandStrategyData.strategicRecommendations)) {
          setSelectedBrandStrategy(brandStrategyData);
          setIsBrandStrategyModalOpen(true);
        } else {
          console.error('Invalid brand strategy data in saved card:', brandStrategyData);
          // Don't show error for saved cards, just skip opening the modal
        }
        break;
      case 'research':
        // Navigate to research library page and open the specific study modal
        router.push(`/research?openStudy=${card.data.id}`);
        break;
      case 'market-profile':
        // Navigate to market insights page with the market pre-selected
        const profileData = card.data as any;
        router.push(`/market-insights?geoLevel=${profileData.geoLevel}&market=${encodeURIComponent(profileData.name)}`);
        break;
      case 'campaign-brief':
        // Open campaign brief modal
        setSelectedCampaignBrief(card.data);
        setIsCampaignBriefModalOpen(true);
        break;
      default:
        console.warn('Unknown card type:', card.type);
    }
  };

  const handleNewChat = () => {
    // Navigate to home page for new chat
    window.location.href = '/';
  };

  // Cart handlers
  const handleAddToCart = (deal: Deal) => {
    console.log('🛒 AppLayout: Adding to cart:', deal.dealName, 'ID:', deal.id);
    setCart(prev => {
      const newCart = [...prev, deal];
      console.log('🛒 AppLayout: Cart updated, now has', newCart.length, 'items');
      return newCart;
    });
  };

  const handleRemoveFromCart = (dealId: string) => {
    console.log('🛒 AppLayout: Removing from cart:', dealId);
    setCart(prev => prev.filter(deal => deal.id !== dealId));
  };

  const isInCart = (dealId: string) => {
    const inCart = cart.some(deal => deal.id === dealId);
    // Removed excessive logging - only log in development mode for debugging
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.01) {
      console.log('🛒 AppLayout: Sample cart check:', dealId, '→', inCart);
    }
    return inCart;
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleExportCart = () => {
    const exportData = cart.map(deal => ({
      'Deal Name': deal.dealName,
      // Category removed from Deal; include mediaType instead
      'Category': '',
      'Deal ID': deal.dealId,
      'Media Type': deal.mediaType,
      'Description': deal.description
    }));

    const csv = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sovrn-deals-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Listen for custom events from the main page to open modals
  useEffect(() => {
    const handleOpenPersonaModal = (event: any) => {
      setSelectedPersona(event.detail.persona);
      setIsPersonaModalOpen(true);
    };

    const handleOpenAudienceInsightsModal = (event: any) => {
      setSelectedAudienceInsights(event.detail.audienceInsights);
      setIsAudienceInsightsModalOpen(true);
    };

    const handleOpenMarketSizingModal = (event: any) => {
      console.log('📊 AppLayout: Opening Market Sizing modal', event.detail.marketSizing);
      setSelectedMarketSizing(event.detail.marketSizing);
      setIsMarketSizingModalOpen(true);
      console.log('📊 Modal state set to open');
    };

    const handleOpenGeoModal = (event: any) => {
      setSelectedGeo(event.detail.geo);
      setIsGeoModalOpen(true);
    };

    const handleOpenDealModal = (event: any) => {
      console.log('🔍 AppLayout: Opening deal modal for:', event.detail.deal?.dealName);
      console.log('🔍 AppLayout: Current modal state before:', isDealModalOpen);
      setSelectedDeal(event.detail.deal);
      setIsDealModalOpen(true);
    };

    const handleOpenMarketingSWOTModal = (event: any) => {
      console.log('🎯 AppLayout: Opening Marketing SWOT modal', event.detail.swot);
      setSelectedMarketingSWOT(event.detail.swot);
      setIsMarketingSWOTModalOpen(true);
    };

    const handleOpenCompanyProfileModal = (event: any) => {
      console.log('📊 AppLayout: Opening Company Profile modal', event.detail.profile);
      setSelectedCompanyProfile(event.detail.profile);
      setIsCompanyProfileModalOpen(true);
    };

    const handleOpenMarketingNewsModal = (event: any) => {
      console.log('📰 AppLayout: Opening Marketing News modal', event.detail.news);
      setSelectedMarketingNews(event.detail.news);
      setIsMarketingNewsModalOpen(true);
    };

    const handleOpenCart = () => {
      setIsCartOpen(true);
    };

    const handleOpenCustomDealForm = () => {
      setIsCustomDealFormOpen(true);
    };
    
    const handleSaveCardEvent = (event: any) => {
      console.log('💾 AppLayout: Received saveCard event:', event.detail);
      const cardData = event.detail;
      
      // Handle different card formats
      if (cardData.type === 'persona') {
        // Persona card from Audience Insights page - has full structure
        const personaData: Persona = {
          id: cardData.segmentId || cardData.segment || cardData.title,
          name: cardData.title,
          emoji: cardData.emoji || '🧭',
          category: cardData.category || 'Audience',
          dealCount: 0,
          segmentId: cardData.segmentId || cardData.segment || cardData.title,
          coreInsight: cardData.coreInsight || cardData.description || '',
          creativeHooks: cardData.creativeHooks || [],
          mediaTargeting: cardData.mediaTargeting || [],
          audienceMotivation: cardData.audienceMotivation || '',
          actionableStrategy: {
            creativeHook: (cardData.creativeHooks && cardData.creativeHooks[0]) || '',
            mediaTargeting: (cardData.mediaTargeting && cardData.mediaTargeting[0]) || ''
          }
        };
        handleSaveCard({ type: 'persona', data: personaData });
      } else {
        // Other card types
        handleSaveCard(cardData);
      }
    };

    const handleAddToCartEvent = (event: any) => {
      console.log('🛒 AppLayout: Received addToCart event:', event.detail);
      if (event.detail?.deal) {
        handleAddToCart(event.detail.deal);
      }
    };

    const handleRemoveFromCartEvent = (event: any) => {
      console.log('🛒 AppLayout: Received removeFromCart event:', event.detail);
      if (event.detail?.dealId) {
        handleRemoveFromCart(event.detail.dealId);
      }
    };

    window.addEventListener('openPersonaModal', handleOpenPersonaModal);
    window.addEventListener('openAudienceInsightsModal', handleOpenAudienceInsightsModal);
    window.addEventListener('openMarketSizingModal', handleOpenMarketSizingModal);
    window.addEventListener('openGeoModal', handleOpenGeoModal);
    window.addEventListener('openDealModal', handleOpenDealModal);
    window.addEventListener('openMarketingSWOTModal', handleOpenMarketingSWOTModal);
    window.addEventListener('openCompanyProfileModal', handleOpenCompanyProfileModal);
    window.addEventListener('openMarketingNewsModal', handleOpenMarketingNewsModal);
    window.addEventListener('openCart', handleOpenCart);
    window.addEventListener('openCustomDealForm', handleOpenCustomDealForm);
    window.addEventListener('saveCard', handleSaveCardEvent);
    window.addEventListener('addToCart', handleAddToCartEvent);
    window.addEventListener('removeFromCart', handleRemoveFromCartEvent);

    return () => {
      window.removeEventListener('openPersonaModal', handleOpenPersonaModal);
      window.removeEventListener('openAudienceInsightsModal', handleOpenAudienceInsightsModal);
      window.removeEventListener('openMarketSizingModal', handleOpenMarketSizingModal);
      window.removeEventListener('openGeoModal', handleOpenGeoModal);
      window.removeEventListener('openDealModal', handleOpenDealModal);
      window.removeEventListener('openMarketingSWOTModal', handleOpenMarketingSWOTModal);
      window.removeEventListener('openCompanyProfileModal', handleOpenCompanyProfileModal);
      window.removeEventListener('openMarketingNewsModal', handleOpenMarketingNewsModal);
      window.removeEventListener('openCart', handleOpenCart);
      window.removeEventListener('openCustomDealForm', handleOpenCustomDealForm);
      window.removeEventListener('saveCard', handleSaveCardEvent);
      window.removeEventListener('addToCart', handleAddToCartEvent);
      window.removeEventListener('removeFromCart', handleRemoveFromCartEvent);
    };
  }, []);

  // Determine if we should show the header based on the current page
  const showHeader = pathname === '/' || pathname === '/strategy-cards' || pathname === '/audience-insights' || pathname === '/market-insights' || pathname === '/research' || pathname === '/deals';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        savedCards={savedCards}
        onUnsaveCard={handleUnsaveCard}
        onCardClick={handleCardClick}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-16'} pt-20`}>
        {/* Header (conditional) */}
        {showHeader && (
          <header className={`bg-white shadow-sovrn border-b border-neutral-200 fixed top-0 right-0 z-50 ${sidebarOpen ? 'left-80' : 'left-16'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                {/* Left-aligned section: Logo and Title */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-10 flex items-center justify-center">
                      <img
                        src="/Sovrn-logo.jpg"
                        alt="Sovrn Logo"
                        className="h-10 w-auto object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="hidden h-10 w-20 bg-gradient-to-r from-brand-gold to-brand-orange rounded-lg flex items-center justify-center">
                        <span className="text-brand-charcoal font-bold text-sm">SOVRN</span>
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-neutral-900">🚀 Launchpad</h1>
                    </div>
                  </div>
                </div>
                
                {/* Right-aligned section: Activate buttons */}
                <div className="flex items-center space-x-3">
                  {/* Only show Request Custom Deal button on non-deals pages */}
                  {pathname !== '/deals' && (
                    <>
                      <button 
                        onClick={() => {
                          // This will be handled by the main page component
                          const event = new CustomEvent('openCustomDealForm');
                          window.dispatchEvent(event);
                        }}
                        className="btn-secondary px-6 py-3"
                      >
                        Request Custom Deal
                      </button>
                      <button 
                        onClick={() => {
                          const event = new CustomEvent('openCart');
                          window.dispatchEvent(event);
                        }}
                        className="btn-primary relative px-6 py-3"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                          <circle cx="8" cy="21" r="1"></circle>
                          <circle cx="19" cy="21" r="1"></circle>
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                        </svg>
                        My Selections
                        {cart.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-white text-brand-orange rounded-full text-xs font-semibold">
                            {cart.length}
                          </span>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 flex flex-col">
          <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
            <SaveCardContext.Provider value={{ 
              onSaveCard: handleSaveCard, 
              onUnsaveCard: handleUnsaveCard, 
              isSaved: isCardSaved 
            }}>
              <CartContext.Provider value={{
                onAddToCart: handleAddToCart,
                onRemoveFromCart: handleRemoveFromCart,
                isInCart: isInCart,
                cart: cart
              }}>
                {children}
              </CartContext.Provider>
            </SaveCardContext.Provider>
          </SidebarContext.Provider>
        </main>
      </div>

      {/* Modal Components */}
      <PersonaDetailModal
        persona={selectedPersona}
        isOpen={isPersonaModalOpen}
        onClose={() => {
          setIsPersonaModalOpen(false);
          setSelectedPersona(null);
        }}
        onViewDeals={(persona) => {
          console.log('🎯 Finding deals for persona:', persona.name);
          setIsPersonaModalOpen(false);
          setSelectedPersona(null);
          // Navigate to main chat with pre-populated prompt
          const dealPrompt = `Find relevant deals for the ${persona.name} persona in ${persona.category}`;
          window.location.href = `/?prompt=${encodeURIComponent(dealPrompt)}`;
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      <AudienceInsightsDetailModal
        insights={selectedAudienceInsights}
        isOpen={isAudienceInsightsModalOpen}
        onClose={() => {
          setIsAudienceInsightsModalOpen(false);
          setSelectedAudienceInsights(null);
        }}
        onViewDeals={(insights) => {
          console.log('🎯 Finding deals for audience:', insights.audienceName);
          setIsAudienceInsightsModalOpen(false);
          setSelectedAudienceInsights(null);
          // Navigate to main chat with pre-populated prompt
          const dealPrompt = `Find relevant deals for the ${insights.audienceName} audience`;
          window.location.href = `/?prompt=${encodeURIComponent(dealPrompt)}`;
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      <MarketSizingDetailModal
        sizing={selectedMarketSizing}
        isOpen={isMarketSizingModalOpen}
        onClose={() => {
          setIsMarketSizingModalOpen(false);
          setSelectedMarketSizing(null);
        }}
        onViewDeals={(sizing) => {
          console.log('🎯 Finding deals for market:', sizing.marketName);
          setIsMarketSizingModalOpen(false);
          setSelectedMarketSizing(null);
          // Navigate to main chat with pre-populated prompt
          const dealPrompt = `Find relevant deals for the ${sizing.marketName} market`;
          window.location.href = `/?prompt=${encodeURIComponent(dealPrompt)}`;
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      <GeoDetailModal
        geo={selectedGeo}
        isOpen={isGeoModalOpen}
        onClose={() => {
          setIsGeoModalOpen(false);
          setSelectedGeo(null);
        }}
        onViewDeals={(geo) => {
          console.log('🎯 Finding deals for geo:', geo.audienceName);
          setIsGeoModalOpen(false);
          setSelectedGeo(null);
          // Navigate to main chat with pre-populated prompt
          const dealPrompt = `Find relevant deals for ${geo.audienceName}`;
          window.location.href = `/?prompt=${encodeURIComponent(dealPrompt)}`;
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      <DealDetailModal
        deal={selectedDeal}
        isOpen={isDealModalOpen}
        onClose={() => {
          setIsDealModalOpen(false);
          setSelectedDeal(null);
        }}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        isInCart={isInCart}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      {/* Cart Modal */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCartOpen(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-sovrn-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900">My Selections</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleClearCart}
                  className="btn-secondary text-sm"
                  disabled={cart.length === 0}
                >
                  Clear All
                </button>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-neutral-500 hover:text-neutral-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-neutral-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="8" cy="21" r="1"></circle>
                    <circle cx="19" cy="21" r="1"></circle>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                  </svg>
                  <h3 className="text-lg font-medium text-neutral-500 mb-2">Your selections are empty</h3>
                  <p className="text-neutral-400">Add deals to your selections to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((deal, index) => (
                    <div key={`${deal.id}-${index}`} className="card p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 mb-1">{deal.dealName}</h3>
                        <p className="text-sm text-neutral-600 mb-2">{deal.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-neutral-500">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                            {deal.mediaType}
                          </span>
                          <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full">
                            {deal.environment}
                          </span>
                          <span>{deal.bidGuidance}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(deal.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <div className="border-t border-neutral-200 pt-4 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-neutral-900">
                        {cart.length} deal{cart.length !== 1 ? 's' : ''} selected
                      </span>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="btn-secondary"
                        >
                          Continue Shopping
                        </button>
                        <button 
                          onClick={handleExportCart}
                          className="btn-primary"
                        >
                          Export My Selections
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MarketingSWOTDetailModal
        swot={selectedMarketingSWOT}
        isOpen={isMarketingSWOTModalOpen}
        onClose={() => {
          setIsMarketingSWOTModalOpen(false);
          setSelectedMarketingSWOT(null);
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      <CompanyProfileDetailModal
        profile={selectedCompanyProfile}
        isOpen={isCompanyProfileModalOpen}
        onClose={() => {
          setIsCompanyProfileModalOpen(false);
          setSelectedCompanyProfile(null);
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      <MarketingNewsDetailModal
        news={selectedMarketingNews}
        isOpen={isMarketingNewsModalOpen}
        onClose={() => {
          setIsMarketingNewsModalOpen(false);
          setSelectedMarketingNews(null);
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      <CompetitiveIntelligenceDetailModal
        competitiveIntel={selectedCompetitiveIntel}
        isOpen={isCompetitiveIntelModalOpen}
        onClose={() => {
          setIsCompetitiveIntelModalOpen(false);
          setSelectedCompetitiveIntel(null);
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      <ContentStrategyDetailModal
        contentStrategy={selectedContentStrategy}
        isOpen={isContentStrategyModalOpen}
        onClose={() => {
          setIsContentStrategyModalOpen(false);
          setSelectedContentStrategy(null);
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      <BrandStrategyDetailModal
        brandStrategy={selectedBrandStrategy}
        isOpen={isBrandStrategyModalOpen}
        onClose={() => {
          setIsBrandStrategyModalOpen(false);
          setSelectedBrandStrategy(null);
        }}
        onSaveCard={handleSaveCard}
        onUnsaveCard={handleUnsaveCard}
        isSaved={isCardSaved}
      />

      {/* Campaign Brief Modal */}
      {isCampaignBriefModalOpen && selectedCampaignBrief && (
        <CampaignBriefModal
          brief={selectedCampaignBrief}
          marketName={selectedCampaignBrief.marketName}
          marketGeoLevel={selectedCampaignBrief.marketGeoLevel}
          onClose={() => {
            setIsCampaignBriefModalOpen(false);
            setSelectedCampaignBrief(null);
          }}
          onSave={handleSaveCard as any}
          onUnsave={handleUnsaveCard}
          isSaved={isCardSaved(`campaign-brief-${selectedCampaignBrief.marketGeoLevel}-${selectedCampaignBrief.marketName}`)}
        />
      )}

      {/* Custom Deal Form Modal */}
      {isCustomDealFormOpen && (
        <CustomDealForm
          isOpen={isCustomDealFormOpen}
          onClose={() => setIsCustomDealFormOpen(false)}
        />
      )}

    </div>
  );
}
