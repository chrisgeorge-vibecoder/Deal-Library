import { Plus, Sparkles, Users, ShoppingCart, BookOpen } from 'lucide-react';
import SavedCards from './SavedCards';
import Link from 'next/link';

interface SavedCard {
  type: 'deal' | 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards' | 'research';
  data: any;
  savedAt: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  savedCards?: SavedCard[];
  onUnsaveCard?: (cardId: string) => void;
  onCardClick?: (card: SavedCard) => void;
}

export default function Sidebar({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  savedCards = [],
  onUnsaveCard,
  onCardClick
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

      {/* Navigation */}
      <div className="p-4 border-b border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-700 mb-3">Resources</h3>
        <div className="space-y-2">
          <Link
            href="/audience-insights"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Commerce Audience Insights
          </Link>
          <Link
            href="/intelligence-cards"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4" />
            Intelligence Cards
          </Link>
          <Link
            href="/research"
            className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Research Library
          </Link>
        </div>
      </div>

      {/* Saved Cards */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-neutral-700 mb-3">Saved Cards</h3>
          <SavedCards
            savedCards={savedCards}
            onUnsaveCard={onUnsaveCard || (() => {})}
            onCardClick={onCardClick}
          />
        </div>
      </div>

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
