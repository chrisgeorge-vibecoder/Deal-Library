import { Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, onFilterToggle, placeholder = "Tell us who you are trying to reach and share your campaign objectives." }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="mb-8">

      {/* AI Chat Input */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full min-h-[120px] p-6 pr-16 text-lg border-2 border-neutral-200 rounded-2xl bg-white shadow-sovrn focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20 focus:outline-none transition-all duration-200 resize-none"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            />
            <button
              type="submit"
              className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-brand-gold to-brand-orange text-brand-charcoal rounded-xl shadow-sovrn hover:shadow-sovrn-lg transition-all duration-200 hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
        
        {/* Example Prompts */}
        <div className="mt-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-neutral-600">Example deal prompts:</span>
            <button
              onClick={() => {
                const query = "I want to reach tech-savvy millennials with a mobile app promotion";
                setQuery(query);
                onSearch(query);
              }}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-neutral-200 transition-colors"
            >
              Mobile App Promotion
            </button>
            <button
              onClick={() => {
                const query = "I need to target enterprise decision makers for B2B software";
                setQuery(query);
                onSearch(query);
              }}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-neutral-200 transition-colors"
            >
              B2B Enterprise
            </button>
            <button
              onClick={() => {
                const query = "I want to promote a luxury brand to high-income consumers";
                setQuery(query);
                onSearch(query);
              }}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-neutral-200 transition-colors"
            >
              Luxury Brand
            </button>
            <button
              onClick={() => {
                const query = "I want to reach grocery shoppers who buy food";
                setQuery(query);
                onSearch(query);
              }}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-neutral-200 transition-colors"
            >
              Grocery Shoppers
            </button>
            <button
              onClick={() => {
                setQuery('');
                onSearch('');
              }}
              className="px-4 py-2 bg-brand-gold/10 text-brand-charcoal rounded-full text-sm hover:bg-brand-gold/20 transition-colors border border-brand-gold/30"
            >
              New Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
