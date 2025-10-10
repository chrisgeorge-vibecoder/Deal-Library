import { useState, useEffect } from 'react';
import { Deal, PersonaInsights } from '@/types/deal';
import { Search, Filter, ShoppingCart, Trash2, ArrowLeft, Users, Target, Lightbulb, TrendingUp } from 'lucide-react';
import DealCard from './DealCard';
import DealDetailModal from './DealDetailModal';

interface PersonaExplorerProps {
  onBack: () => void;
  onDealClick: (deal: Deal) => void;
  onAddToCart: (deal: Deal) => void;
  onRemoveFromCart: (dealId: string) => void;
  isInCart: (dealId: string) => boolean;
}

interface PersonaCard {
  id: string;
  name: string;
  emoji: string;
  segmentId: string;
  coreInsight: string;
  creativeHook: string;
  mediaTargeting: string;
  dealCount: number;
  category: string;
}

export default function PersonaExplorer({ 
  onBack, 
  onDealClick, 
  onAddToCart, 
  onRemoveFromCart, 
  isInCart 
}: PersonaExplorerProps) {
  const [personas, setPersonas] = useState<PersonaCard[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<PersonaCard[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<PersonaCard | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  // Fetch all personas from the backend
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        console.log('Fetching personas from backend...');
        const response = await fetch('http://localhost:3002/api/personas');
        console.log('Response status:', response.status);
        if (response.ok) {
          const personaData = await response.json();
          console.log('Received personas:', personaData.length);
          setPersonas(personaData);
        } else {
          console.error('Response not ok:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching personas:', error);
      }
    };

    fetchPersonas();
  }, []);

  // Fetch deals when a persona is selected
  useEffect(() => {
    if (selectedPersona) {
      fetchDealsForPersona(selectedPersona.id);
    }
  }, [selectedPersona]);

  // Filter personas based on search term and category
  useEffect(() => {
    let filtered = personas;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(persona => persona.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(persona => 
        persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.coreInsight.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPersonas(filtered);
  }, [personas, selectedCategory, searchTerm]);

  // Filter deals based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDeals(deals);
    } else {
      const filtered = deals.filter(deal => 
        deal.dealName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.environment.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDeals(filtered);
    }
  }, [searchTerm, deals]);

  const fetchDealsForPersona = async (personaId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3002/api/deals/persona/${personaId}`);
      if (response.ok) {
        const dealData = await response.json();
        setDeals(dealData);
        setFilteredDeals(dealData);
      }
    } catch (error) {
      console.error('Error fetching deals for persona:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaSelect = (persona: PersonaCard) => {
    setSelectedPersona(persona);
    setSearchTerm('');
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDealModalOpen(true);
    onDealClick(deal);
  };

  const handleCloseModal = () => {
    setSelectedDeal(null);
    setIsDealModalOpen(false);
  };

  if (selectedPersona) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedPersona(null)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Personas
            </button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedPersona.emoji}</span>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">{selectedPersona.name}</h1>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
              <Target className="w-4 h-4" />
              {deals.length} Deals
            </div>
          </div>
        </div>

        {/* Persona Insights */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="max-w-4xl">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Strategic Persona Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Core Insight</h3>
                <p className="text-sm text-blue-800 mb-4">{selectedPersona.coreInsight}</p>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Creative Hook</h3>
                <p className="text-sm text-blue-800 mb-4 font-medium">"{selectedPersona.creativeHook}"</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-blue-900 mb-2">Media Targeting</h3>
                <p className="text-sm text-blue-800">{selectedPersona.mediaTargeting}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-neutral-200 bg-white">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Filter className="w-4 h-4" />
              <span>{filteredDeals.length} of {deals.length} deals</span>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="dot-flashing mx-auto mb-4"></div>
                <p className="text-neutral-600">Loading deals...</p>
              </div>
            </div>
          ) : filteredDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.map((deal) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  onClick={() => handleDealClick(deal)}
                  onAddToCart={() => onAddToCart(deal)}
                  onRemoveFromCart={() => onRemoveFromCart(deal.id)}
                  isInCart={isInCart(deal.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">No deals found</h3>
              <p className="text-neutral-600">
                {searchTerm ? 'Try adjusting your search terms' : 'No deals available for this persona'}
              </p>
            </div>
          )}
        </div>

        {/* Deal Detail Modal */}
        {isDealModalOpen && selectedDeal && (
          <DealDetailModal
            deal={selectedDeal}
            isOpen={isDealModalOpen}
            onClose={handleCloseModal}
            onAddToCart={onAddToCart}
            onRemoveFromCart={onRemoveFromCart}
            isInCart={isInCart}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </button>
          <div>
            <h1 className="text-xl font-semibold text-neutral-800">Persona Explorer</h1>
            <p className="text-sm text-neutral-600">Proprietary audience insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
            <Users className="w-4 h-4" />
            {personas.length} Personas
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="p-6 border-b border-neutral-200 bg-white">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search personas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Beauty & Wellness">Beauty & Wellness</option>
              <option value="Pet Care">Pet Care</option>
              <option value="Fashion & Style">Fashion & Style</option>
              <option value="Fitness & Sports">Fitness & Sports</option>
              <option value="Home & Family">Home & Family</option>
              <option value="Travel & Lifestyle">Travel & Lifestyle</option>
              <option value="Entertainment">Entertainment</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>{filteredPersonas.length} of {personas.length} personas</span>
          </div>
        </div>
      </div>

      {/* Personas Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPersonas.map((persona, index) => (
            <div
              key={`${persona.id}-${index}`}
              onClick={() => handlePersonaSelect(persona)}
              className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-sovrn-lg hover:border-brand-gold transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{persona.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 group-hover:text-brand-gold transition-colors">
                    {persona.name}
                  </h3>
                </div>
              </div>
              
              <div className="mb-3">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-brand-gold/10 text-brand-gold rounded-full">
                  {persona.category}
                </span>
              </div>
              
              <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                {persona.coreInsight}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Target className="w-3 h-3" />
                  <span>{persona.dealCount} deals available</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-gold">
                  <TrendingUp className="w-3 h-3" />
                  <span>Strategic insights included</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
