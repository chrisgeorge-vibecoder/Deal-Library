import { useState, useRef, useEffect } from 'react';
import { Deal, Persona, AudienceInsights, GeoCard } from '@/types/deal';
import { useSidebar } from './AppLayout';
import DealGrid from './DealGrid';
import AudienceInsightsCard from './AudienceInsightsCard';
import MarketSizingCard, { MarketSizing } from './MarketSizingCard';
import { GeoCard as GeoCardComponent } from './GeoCard';
import { Send, Bot, User, Filter, Sparkles, ShoppingCart, Trash2, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CardTypeSelector from './CardTypeSelector';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  deals?: Deal[];
  personas?: Persona[];
  audienceInsights?: AudienceInsights[];
  marketSizing?: MarketSizing[];
  geoCards?: GeoCard[];
}

interface ChatInterfaceProps {
  onSearch: (query: string, conversationHistory?: Array<{role: string, content: string}>, cardTypes?: string[]) => void;
  deals: Deal[];
  loading: boolean;
  onDealClick: (deal: Deal) => void;
  onFilterToggle: () => void;
  resetChat?: boolean;
  onAddToCart: (deal: Deal) => void;
  onRemoveFromCart: (dealId: string) => void;
  isInCart: (dealId: string) => boolean;
  aiResponse?: string;
  aiPersonas?: Persona[];
  aiAudienceInsights?: AudienceInsights[];
  aiMarketSizing?: MarketSizing[];
  aiGeoCards?: GeoCard[];
  onPersonaClick?: (persona: Persona) => void;
  inputValue?: string;
  onInputValueChange?: (value: string) => void;
  onSaveCard?: (card: { type: 'deal' | 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards', data: any }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
  sidebarOpen?: boolean;
}

export default function ChatInterface({ 
  onSearch, 
  deals, 
  loading, 
  onDealClick,
  onFilterToggle,
  resetChat = false,
  onAddToCart,
  onRemoveFromCart,
  isInCart,
  aiResponse,
  aiPersonas,
  aiAudienceInsights,
  aiMarketSizing,
  aiGeoCards,
  onPersonaClick,
  inputValue: externalInputValue,
  onInputValueChange,
  onSaveCard,
  onUnsaveCard,
  isSaved,
  sidebarOpen: propSidebarOpen = true
}: ChatInterfaceProps) {
  // Use sidebar context instead of props
  const { sidebarOpen } = useSidebar();
  
  // Client-side only flag to prevent hydration issues
  // Removed isClient state - no longer needed
  
  // All state declarations at the top
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQueryId, setCurrentQueryId] = useState<string>('');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedAudienceInsights, setSelectedAudienceInsights] = useState<AudienceInsights | null>(null);
  const [selectedMarketSizing, setSelectedMarketSizing] = useState<MarketSizing | null>(null);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isAudienceInsightsModalOpen, setIsAudienceInsightsModalOpen] = useState(false);
  const [isMarketSizingModalOpen, setIsMarketSizingModalOpen] = useState(false);
  const [internalInputValue, setInternalInputValue] = useState('');
  const [selectedCardTypes, setSelectedCardTypes] = useState<string[]>([]);
  const [hasUserManuallySelected, setHasUserManuallySelected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedGeo, setSelectedGeo] = useState<GeoCard | null>(null);
  const [isGeoModalOpen, setIsGeoModalOpen] = useState(false);
  
  const lastProcessedResponse = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: "Hi! I'm your Marketing Co-Pilot. Ask me anything about media or marketing and I can help you with strategy, audience insights, discovering deals, and more.",
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
  }, []);

  // Reset chat when resetChat prop changes
  useEffect(() => {
    if (resetChat) {
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: "Hi! I'm your Marketing Co-Pilot. Ask me anything about media or marketing and I can help you with strategy, audience insights, discovering deals, and more.",
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    }
  }, [resetChat]);

  // Use internal state for input management, sync with external value on changes
  const [inputValue, setInputValue] = useState('');
  
  // Sync with external input value when it changes
  useEffect(() => {
    if (externalInputValue !== undefined) {
      setInputValue(externalInputValue);
    }
  }, [externalInputValue]);
  

  // Context-aware auto-selection of card types based on query content
  useEffect(() => {
    if (hasUserManuallySelected || !inputValue.trim()) return;
    
    const query = inputValue.toLowerCase();
    const suggestedTypes: string[] = [];
    
    // Check for explicit card type keywords
    if (query.includes('deal') || query.includes('request deals') || query.includes('show deals')) {
      suggestedTypes.push('deals');
    }
    if (query.includes('persona') || query.includes('audience persona')) {
      suggestedTypes.push('personas');
    }
    if (query.includes('insight') || query.includes('demographic') || query.includes('audience insight')) {
      suggestedTypes.push('audience-insights');
    }
    if (query.includes('market') || query.includes('sizing') || query.includes('market analysis')) {
      suggestedTypes.push('market-sizing');
    }
    if (query.includes('geographic') || query.includes('location') || query.includes('geo')) {
      suggestedTypes.push('geographic');
    }
    
    // Only auto-select if we found suggestions and user hasn't manually selected anything
    if (suggestedTypes.length > 0 && selectedCardTypes.length === 0) {
      setSelectedCardTypes(suggestedTypes);
    }
  }, [inputValue, hasUserManuallySelected, selectedCardTypes.length]);

  const handleSetInputValue = (value: string) => {
    setInputValue(value);
    // Also notify parent component if callback is provided
    if (onInputValueChange) {
      onInputValueChange(value);
    }
  };

  // Handle card type selection changes
  const handleCardTypeChange = (newSelectedTypes: string[]) => {
    setSelectedCardTypes(newSelectedTypes);
    setHasUserManuallySelected(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle AI response when it comes in
  useEffect(() => {
    if (aiResponse && aiResponse.trim() !== '' && isTyping && aiResponse !== lastProcessedResponse.current) {
      lastProcessedResponse.current = aiResponse;
      const isConversationalResponse = !deals || deals.length === 0;
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString(),
        // Only show deals for deal recommendation responses, not conversational responses
        deals: isConversationalResponse ? undefined : (deals && deals.length > 0 ? deals.slice(0, 6) : undefined),
        // Include personas if available
        personas: aiPersonas && aiPersonas.length > 0 ? aiPersonas : undefined,
        // Include audience insights if available
        audienceInsights: aiAudienceInsights && aiAudienceInsights.length > 0 ? aiAudienceInsights : undefined,
        // Include market sizing if available
        marketSizing: aiMarketSizing && aiMarketSizing.length > 0 ? aiMarketSizing : undefined,
        // Include geo cards if available
        geoCards: aiGeoCards && aiGeoCards.length > 0 ? aiGeoCards : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }
  }, [aiResponse, isTyping, deals, aiPersonas, aiAudienceInsights, aiMarketSizing, aiGeoCards]);

  // Handle audience insights updates after the initial message is created
  useEffect(() => {
    if (aiAudienceInsights && aiAudienceInsights.length > 0) {
      console.log('🎯 Audience insights received:', aiAudienceInsights.length);
      console.log('🎯 Current messages length:', messages.length);
      
      // Check if we already have audience insights in the last message
      const lastMessage = messages[messages.length - 1];
      const hasExistingInsights = lastMessage?.audienceInsights && lastMessage.audienceInsights.length > 0;
      
      if (!hasExistingInsights) {
        console.log('🎯 Adding audience insights to messages');
        
        setMessages(prev => {
          const updatedMessages = [...prev];
          
          // Try to update the last assistant message
          if (updatedMessages.length > 0) {
            const lastMsg = updatedMessages[updatedMessages.length - 1];
            if (lastMsg && lastMsg.type === 'assistant') {
              console.log('🎯 Updating last assistant message with audience insights');
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMsg,
                audienceInsights: aiAudienceInsights
              };
            } else {
              console.log('🎯 Creating new message for audience insights');
              const newMessage: ChatMessage = {
                id: `assistant-insights-${Date.now()}`,
                type: 'assistant',
                content: 'Here are the audience insights you requested:',
                timestamp: new Date().toLocaleTimeString(),
                audienceInsights: aiAudienceInsights
              };
              updatedMessages.push(newMessage);
            }
          } else {
            console.log('🎯 No existing messages, creating new one');
            const newMessage: ChatMessage = {
              id: `assistant-insights-${Date.now()}`,
              type: 'assistant',
              content: 'Here are the audience insights you requested:',
              timestamp: new Date().toLocaleTimeString(),
              audienceInsights: aiAudienceInsights
            };
            updatedMessages.push(newMessage);
          }
          
          return updatedMessages;
        });
      } else {
        console.log('🎯 Audience insights already present in last message');
      }
    }
  }, [aiAudienceInsights]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    handleSetInputValue('');
    setIsTyping(true);

    // Convert messages to conversation history format with deal context
    const conversationHistory = messages.map(msg => {
      if (msg.type === 'user') {
        return {
          role: 'user',
          content: msg.content
        };
      } else {
        // For assistant messages, include deal information if available
        let content = msg.content;
        if (msg.deals && msg.deals.length > 0) {
          const dealNames = msg.deals.map(d => d.dealName).join(', ');
          content = `${msg.content}\n\nRecommended deals: ${dealNames}`;
        }
        return {
          role: 'assistant',
          content
        };
      }
    });

    // Trigger search with conversation history and selected card types
    onSearch(inputValue, conversationHistory, selectedCardTypes);

    // AI response will be handled by useEffect when aiResponse prop updates
  };

  const generateAIResponse = (query: string, deals: Deal[]): string => {
    const dealCount = deals.length;
    
    if (dealCount === 0) {
      return "I couldn't find any deals matching your criteria. Try adjusting your search terms or use the filters to explore different options.";
    }

    if (dealCount === 1) {
      return `I found 1 deal that matches your criteria. This looks like a great fit for your campaign objectives!`;
    }

    if (dealCount <= 5) {
      return `I found ${dealCount} deals that match your criteria. These options should give you some excellent choices for your campaign.`;
    }

    return `I found ${dealCount} deals that match your criteria. I've highlighted the most relevant ones above, and you can see all results below. Would you like me to help you narrow down the options or explore specific aspects of these deals?`;
  };


  const handleExampleClick = (example: string) => {
    handleSetInputValue(example);
  };

  const examplePrompts = [
    "I'm the CMO of Old Navy and I want to reach new parents.",
    "I'm a Media Director building a pet related media strategy."
  ];

  // Remove the loading state check - let the component render normally
  // The isClient state is only used for timestamp rendering

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-40">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-gold to-brand-orange flex items-center justify-center flex-shrink-0">
                    <img 
                      src="/Black Sovrn Slash.svg" 
                      alt="Sovrn Marketing Co-Pilot" 
                      className="w-4 h-4"
                    />
                  </div>
                )}
            
            <div className={`max-w-3xl ${message.type === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-2xl px-6 py-4 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-brand-gold to-brand-orange text-brand-charcoal' 
                  : 'bg-white border border-neutral-200 shadow-sovrn'
              }`}>
                {message.type === 'user' ? (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                ) : (
                  <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-strong:text-neutral-900 prose-ul:text-neutral-700 prose-ol:text-neutral-700 prose-li:text-neutral-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                
                {message.deals && message.deals.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-neutral-600 mb-3">Relevant deals:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {message.deals.map((deal) => {
                        const isCommerceAudience = (deal.dealName || '').toLowerCase().includes('purchase intender');
                        return (
                        <div 
                          key={deal.id}
                          className={`card p-4 cursor-pointer hover:shadow-sovrn-lg transition-all duration-200 group ${
                            isCommerceAudience 
                              ? 'border-l-4 border-brand-gold bg-gradient-to-r from-brand-gold/5 to-transparent' 
                              : ''
                          }`}
                          onClick={() => onDealClick(deal)}
                        >
                          {/* Deal Name */}
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                              {deal.dealName}
                            </h4>
                            {isCommerceAudience && (
                              <span className="text-lg">🛍️</span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                            {deal.description}
                          </p>

                          {/* Environment */}
                          <div className="mb-3">
                            <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                              {deal.environment}
                            </span>
                          </div>

                          {/* Add to Cart Button */}
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
                                Remove from Cart
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(deal);
                                }}
                                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-xs font-medium ${
                                  isCommerceAudience 
                                    ? 'bg-gradient-to-r from-brand-gold to-brand-orange text-white hover:from-brand-gold/90 hover:to-brand-orange/90' 
                                    : 'bg-brand-gold/10 text-brand-charcoal hover:bg-brand-gold/20'
                                }`}
                              >
                                <ShoppingCart className="w-3 h-3" />
                                Add to Cart
                              </button>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {message.personas && message.personas.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-neutral-600 mb-3">Relevant personas:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {message.personas.map((persona) => (
                        <div 
                          key={persona.id}
                          className="card p-4 cursor-pointer hover:shadow-sovrn-lg transition-all duration-200 group"
                          onClick={() => {
                            setSelectedPersona(persona);
                            setIsPersonaModalOpen(true);
                          }}
                        >
                          {/* Persona Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{persona.emoji}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                                {persona.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                                  {persona.category}
                                </span>
                                <span className="text-xs text-neutral-500">
                                  {persona.dealCount} deals
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Core Insight */}
                          <p className="text-sm text-neutral-600 mb-3 leading-relaxed line-clamp-2">
                            {persona.coreInsight}
                          </p>

                          {/* Action Button */}
                          <div className="pt-3 border-t border-neutral-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPersona(persona);
                                setIsPersonaModalOpen(true);
                              }}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-100 text-primary-800 rounded-lg hover:bg-primary-200 transition-colors text-xs font-medium"
                            >
                              <Users className="w-3 h-3" />
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {message.audienceInsights && message.audienceInsights.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-neutral-600 mb-3">Audience insights:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {message.audienceInsights.map((insights) => (
                        <AudienceInsightsCard
                          key={insights.id}
                          insights={insights}
                          onClick={() => {
                            // Handle audience insights click
                            console.log('Audience insights clicked:', insights);
                          }}
                          onViewDetails={() => {
                            const event = new CustomEvent('openAudienceInsightsModal', { detail: { audienceInsights: insights } });
                            window.dispatchEvent(event);
                          }}
                          onSaveCard={onSaveCard}
                          onUnsaveCard={onUnsaveCard}
                          isSaved={isSaved}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {message.marketSizing && message.marketSizing.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-neutral-600 mb-3">Market sizing:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {message.marketSizing.map((sizing) => (
                        <MarketSizingCard
                          key={sizing.id}
                          sizing={sizing}
                          onClick={() => {
                            // Handle market sizing card click (entire card)
                            console.log('Market sizing card clicked:', sizing);
                            const event = new CustomEvent('openMarketSizingModal', { detail: { marketSizing: sizing } });
                            window.dispatchEvent(event);
                          }}
                          onViewDetails={() => {
                            console.log('Market sizing View Details clicked:', sizing);
                            const event = new CustomEvent('openMarketSizingModal', { detail: { marketSizing: sizing } });
                            window.dispatchEvent(event);
                          }}
                          onSaveCard={onSaveCard}
                          onUnsaveCard={onUnsaveCard}
                          isSaved={isSaved}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {message.geoCards && message.geoCards.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-neutral-600 mb-3">Geographic distribution:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {message.geoCards.map((geo) => (
                        <GeoCardComponent
                          key={geo.id}
                          geo={geo}
                          onClick={() => {
                            const event = new CustomEvent('openGeoModal', { detail: { geo: geo } });
                            window.dispatchEvent(event);
                          }}
                          onSaveCard={onSaveCard}
                          onUnsaveCard={onUnsaveCard}
                          isSaved={isSaved}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`text-xs text-neutral-500 mt-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                {message.timestamp}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-neutral-600" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-gold to-brand-orange flex items-center justify-center flex-shrink-0">
              <img 
                src="/Black Sovrn Slash.svg" 
                alt="Sovrn Marketing Co-Pilot" 
                className="w-4 h-4"
              />
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl px-6 py-4 shadow-sovrn">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-neutral-500">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className={`border-t border-neutral-200 bg-white shadow-lg fixed bottom-0 right-0 z-50 transition-all duration-300 ${sidebarOpen ? 'left-80' : 'left-16'}`}>
        {/* Example Prompts */}
        {messages.length === 1 && (
          <div className="px-4 pt-4 pb-2">
            <div className="bg-neutral-50 rounded-xl p-4 shadow-lg">
              <p className="text-sm font-medium text-neutral-700 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="px-3 py-2 bg-white text-neutral-700 rounded-lg text-sm hover:bg-neutral-100 transition-colors border border-neutral-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="p-4 pt-0">
          <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <textarea
              value={inputValue || ''}
              onChange={(e) => handleSetInputValue(e.target.value)}
              placeholder="Ask me about deals, targeting, or campaign strategies..."
              className="w-full min-h-[60px] max-h-32 p-4 pr-12 text-sm border-2 border-neutral-200 rounded-xl bg-white focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20 focus:outline-none transition-all duration-200 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="absolute bottom-3 right-3 p-2 bg-gradient-to-r from-brand-gold to-brand-orange text-brand-charcoal rounded-lg shadow-sovrn hover:shadow-sovrn-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

          {/* Card Type Selector - moved below prompt for better UX */}
          <CardTypeSelector 
            selectedTypes={selectedCardTypes}
            onSelectionChange={handleCardTypeChange}
            className="mt-3"
          />

          {/* Action Buttons - removed to save space */}
        </div>
      </div>

      {/* Persona Detail Modal - handled by AppLayout */}

      {/* All other modals handled by AppLayout */}

    </div>
  );
}
