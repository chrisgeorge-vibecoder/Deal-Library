import { Plus, Sparkles, Users, ShoppingCart, TrendingUp, Bookmark, Lightbulb, Sprout, Zap } from 'lucide-react';
import Link from 'next/link';
import { SavedCard } from '@/types/deal';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  savedCards?: SavedCard[];
  onUnsaveCard?: (cardId: string) => void;
  onCardClick?: (card: SavedCard) => void;
  cart?: any[];
  onOpenCart?: () => void;
  onOpenSavedCards?: () => void;
}

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  savedCards = [],
  onUnsaveCard,
  onCardClick,
  cart = [],
  onOpenCart,
  onOpenSavedCards
}: SidebarProps) {

  if (!isOpen) {
    return (
      <div className="fixed left-0 top-0 w-16 h-screen bg-white border-r border-neutral-200 flex flex-col items-center py-4 z-50 shadow-lg hidden lg:flex">
        <button
          onClick={onToggle}
          className="p-3 rounded-lg hover:bg-neutral-100 transition-colors touch-manipulation active:scale-95"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={onNewChat}
          className="mt-4 p-3 rounded-lg bg-brand-gold text-brand-charcoal hover:bg-brand-orange transition-colors touch-manipulation active:scale-95"
          aria-label="New chat"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity lg:hidden z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onToggle}
        aria-hidden="true"
      />
      
      {/* Sidebar drawer */}
      <div className={`fixed left-0 top-0 w-80 h-screen bg-white border-r border-neutral-200 flex flex-col z-50 shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-end">
          <button
            onClick={onToggle}
            className="p-2 rounded hover:bg-neutral-100 transition-colors touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-neutral-200">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] bg-brand-gold text-brand-charcoal rounded-lg hover:bg-brand-orange hover:shadow-sovrn transition-all duration-200 font-semibold touch-manipulation active:scale-98"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
      </div>

      {/* Plan Section */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-neutral-700">Plan</h3>
          <button
            onClick={onOpenSavedCards}
            className={`relative p-2.5 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95 ${
              savedCards && savedCards.length > 0 
                ? 'bg-brand-gold text-white' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            title="Saved Cards"
            aria-label="Saved Cards"
          >
            <Bookmark className="w-5 h-5" />
            {savedCards && savedCards.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-brand-orange text-white rounded-full text-xs font-semibold min-w-[18px] text-center">
                {savedCards.length}
              </span>
            )}
          </button>
        </div>
        <div className="space-y-2">
          {/* Campaign Planner - Hidden from navigation but route still accessible for testing */}
          {/* <Link
            href="/campaign-planner"
            className="flex items-center gap-3 px-3 py-3 min-h-[44px] text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors touch-manipulation active:bg-neutral-200"
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span>Campaign Planner</span>
          </Link> */}
          <Link
            href="/audience-insights"
            className="flex items-center gap-3 px-3 py-3 min-h-[44px] text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors touch-manipulation active:bg-neutral-200"
          >
            <Lightbulb className="w-5 h-5 flex-shrink-0" />
            <span>Audience Insights</span>
          </Link>
          <Link
            href="/market-insights"
            className="flex items-center gap-3 px-3 py-3 min-h-[44px] text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors touch-manipulation active:bg-neutral-200"
          >
            <TrendingUp className="w-5 h-5 flex-shrink-0" />
            <span>U.S. Market Insights</span>
          </Link>
          <Link
            href="/strategy-cards"
            className="flex items-center gap-3 px-3 py-3 min-h-[44px] text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors touch-manipulation active:bg-neutral-200"
          >
            <Sprout className="w-5 h-5 flex-shrink-0" />
            <span>Strategy Cards</span>
          </Link>
          <Link
            href="/sovrn-insights"
            className="flex items-center gap-3 px-3 py-3 min-h-[44px] text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors touch-manipulation active:bg-neutral-200"
          >
            <Zap className="w-5 h-5 flex-shrink-0" />
            <span>Sovrn Insights</span>
          </Link>
        </div>
      </div>

      {/* Activate Section */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-neutral-700">Activate</h3>
          <button
            onClick={onOpenCart}
            className={`relative p-2.5 rounded-lg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95 ${
              cart && cart.length > 0 
                ? 'bg-brand-gold text-white' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            title="My Selections"
            aria-label="My Selections"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart && cart.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-brand-orange text-white rounded-full text-xs font-semibold min-w-[18px] text-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
        <div className="space-y-2">
          <Link
            href="/audiences"
            className="flex items-center gap-3 px-3 py-3 min-h-[44px] text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors touch-manipulation active:bg-neutral-200"
          >
            <Users className="w-5 h-5 flex-shrink-0" />
            <span>Audiences</span>
          </Link>
          <Link
            href="/deals"
            className="flex items-center gap-3 px-3 py-3 min-h-[44px] text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors touch-manipulation active:bg-neutral-200"
          >
            <ShoppingCart className="w-5 h-5 flex-shrink-0" />
            <span>Deal Library</span>
          </Link>
        </div>
      </div>

      {/* Spacer to push footer to bottom */}
      <div className="flex-1"></div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
          <Sparkles className="w-3 h-3" />
          <span>Powered by the Sovrn Data Collective</span>
        </div>
      </div>
    </div>
    </>
  );
}
