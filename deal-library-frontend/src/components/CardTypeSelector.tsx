'use client';

import React from 'react';
import { ShoppingCart, Users, Lightbulb, BarChart3, MapPin, Target, Building2 } from 'lucide-react';

export interface CardType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const CARD_TYPES: CardType[] = [
  {
    id: 'deals',
    name: 'Deals',
    icon: ShoppingCart,
    description: 'Advertising deals and opportunities'
  },
  {
    id: 'personas',
    name: 'Personas',
    icon: Users,
    description: 'Audience personas and characteristics'
  },
  {
    id: 'audience-insights',
    name: 'Audience',
    icon: Lightbulb,
    description: 'Audience insights and demographics'
  },
  {
    id: 'market-sizing',
    name: 'Market',
    icon: BarChart3,
    description: 'Market sizing and analysis'
  },
  {
    id: 'geographic',
    name: 'Geographic',
    icon: MapPin,
    description: 'Geographic targeting insights'
  },
  {
    id: 'marketing-swot',
    name: 'Marketing SWOT',
    icon: Target,
    description: 'Marketing SWOT analysis for companies'
  },
  {
    id: 'company-profile',
    name: 'Company Profile',
    icon: Building2,
    description: 'Public company financial analysis'
  }
];

interface CardTypeSelectorProps {
  selectedTypes: string[];
  onSelectionChange: (selectedTypes: string[]) => void;
  className?: string;
}

export default function CardTypeSelector({ 
  selectedTypes, 
  onSelectionChange, 
  className = '' 
}: CardTypeSelectorProps) {
  const toggleCardType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      // Remove from selection
      onSelectionChange(selectedTypes.filter(id => id !== typeId));
    } else {
      // Add to selection
      onSelectionChange([...selectedTypes, typeId]);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-neutral-700 whitespace-nowrap">
          Attach Card:
        </span>
        
        <div className="flex flex-wrap gap-2">
          {CARD_TYPES.map((cardType) => {
            const Icon = cardType.icon;
            const isSelected = selectedTypes.includes(cardType.id);
            
            return (
              <button
                key={cardType.id}
                onClick={() => toggleCardType(cardType.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  border-2 hover:scale-105 active:scale-95
                  ${isSelected 
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' 
                    : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                  }
                `}
                title={cardType.description}
              >
                <Icon className="w-4 h-4" />
                {cardType.name}
              </button>
            );
          })}
        </div>
        
        {selectedTypes.length > 0 && (
          <span className="text-xs text-neutral-500 whitespace-nowrap">
            {selectedTypes.length === 1 
              ? '1 selected' 
              : `${selectedTypes.length} selected`
            }
          </span>
        )}
      </div>
    </div>
  );
}
