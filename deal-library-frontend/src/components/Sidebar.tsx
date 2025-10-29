import { Plus, Sparkles, Users, ShoppingCart, BookOpen, TrendingUp, Bookmark, Lightbulb } from 'lucide-react';
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
      <div className="fixed left-0 top-0 w-16 h-screen bg-white border-r border-neutral-200 flex flex-col items-center py-4 z-50 shadow-lg">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={onNewChat}
          className="mt-4 p-2 rounded-lg bg-brand-gold text-brand-charcoal hover:bg-brand-orange transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-0 w-80 h-screen bg-white border-r border-neutral-200 flex flex-col z-50 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-end">
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-neutral-200">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-gold to-brand-orange text-brand-charcoal rounded-lg hover:shadow-sovrn transition-all duration-200 font-semibold"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Plan Section */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-neutral-700">Plan</h3>
          <button
            onClick={onOpenSavedCards}
            className={`relative p-1.5 rounded-lg transition-all ${
              savedCards && savedCards.length > 0 
                ? 'bg-brand-gold text-white' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            title="Saved Cards"
          >
            <Bookmark className="w-4 h-4" />
            {savedCards && savedCards.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-brand-orange text-white rounded-full text-xs font-semibold min-w-[18px] text-center">
                {savedCards.length}
              </span>
            )}
          </button>
        </div>
        <div className="space-y-2">
          <Link
            href="/audience-insights"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Audience Insights
          </Link>
          <Link
            href="/market-insights"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            U.S. Market Insights
          </Link>
          <Link
            href="/research"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Research Library
          </Link>
          <Link
            href="/strategy-cards"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            Strategy Cards
          </Link>
        </div>
      </div>

      {/* Activate Section */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-neutral-700">Activate</h3>
          <button
            onClick={onOpenCart}
            className={`relative p-1.5 rounded-lg transition-all ${
              cart && cart.length > 0 
                ? 'bg-brand-gold text-white' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            title="My Selections"
          >
            <ShoppingCart className="w-4 h-4" />
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
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            Audiences
          </Link>
          <Link
            href="/deals"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Deal Library
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
  );
}
