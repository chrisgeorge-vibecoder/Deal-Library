// Strategy Card Styles and Constants
// Category-specific colors using Sovrn Brand Palette

export type StrategyCardCategory = 
  | 'Audience Personas'
  | 'Audience Insights'
  | 'Brand Strategy'
  | 'Company Profiles'
  | 'Competitive Intelligence'
  | 'Content Strategy'
  | 'Market Intelligence'
  | 'Marketing News'
  | 'Marketing SWOT'
  | 'Sovrn Insights';

export type DataSource = 'sovrn' | 'gemini';

export interface CategoryStyle {
  bg: string;
  bgSolid: string;
  text: string;
  border: string;
  headerBg: string;
  headerText: string;
  icon: string;
  dataSource: DataSource;
}

// Sovrn Brand Color Palette:
// #FFD42B - Gold (Primary) - Used for Sovrn data cards
// #FF9A00 - Orange
// #FF7B43 - Coral
// #F95D6A - Pink
// #D45087 - Purple
// #A05195 - Violet
// #675291 - Indigo
// #2F4A7C - Navy - Used for Gemini AI cards
// #00405B - Teal
// #282828 - Charcoal

// Header colors based on data source
const SOVRN_HEADER_BG = 'bg-[#FFD42B]'; // Gold for Sovrn data
const GEMINI_HEADER_BG = 'bg-[#2F4A7C]'; // Navy for Gemini AI

export const STRATEGY_CARD_COLORS: Record<StrategyCardCategory, CategoryStyle> = {
  // ===== SOVRN DATA CARDS (Gold Header) =====
  'Audience Personas': {
    bg: 'bg-[#FFD42B]/10',
    bgSolid: 'bg-[#FFD42B]',
    text: 'text-[#282828]',
    border: 'border-[#FFD42B]/30',
    headerBg: 'bg-white/80',
    headerText: 'text-[#282828]',
    icon: '👤',
    dataSource: 'sovrn',
  },
  'Audience Insights': {
    bg: 'bg-[#FFD42B]/10',
    bgSolid: 'bg-[#FFD42B]',
    text: 'text-[#282828]',
    border: 'border-[#FFD42B]/30',
    headerBg: SOVRN_HEADER_BG,
    headerText: 'text-[#282828]',
    icon: '💡',
    dataSource: 'sovrn',
  },
  'Sovrn Insights': {
    bg: 'bg-[#FFD42B]/10',
    bgSolid: 'bg-[#FFD42B]',
    text: 'text-[#282828]',
    border: 'border-[#FFD42B]/30',
    headerBg: SOVRN_HEADER_BG,
    headerText: 'text-[#282828]',
    icon: '⚡',
    dataSource: 'sovrn',
  },

  // ===== GEMINI AI CARDS (Navy Header) =====
  'Brand Strategy': {
    bg: 'bg-[#2F4A7C]/10',
    bgSolid: 'bg-[#2F4A7C]',
    text: 'text-[#2F4A7C]',
    border: 'border-[#2F4A7C]/30',
    headerBg: GEMINI_HEADER_BG,
    headerText: 'text-white',
    icon: '🏆',
    dataSource: 'gemini',
  },
  'Company Profiles': {
    bg: 'bg-[#2F4A7C]/10',
    bgSolid: 'bg-[#2F4A7C]',
    text: 'text-[#2F4A7C]',
    border: 'border-[#2F4A7C]/30',
    headerBg: GEMINI_HEADER_BG,
    headerText: 'text-white',
    icon: '🏢',
    dataSource: 'gemini',
  },
  'Competitive Intelligence': {
    bg: 'bg-[#2F4A7C]/10',
    bgSolid: 'bg-[#2F4A7C]',
    text: 'text-[#2F4A7C]',
    border: 'border-[#2F4A7C]/30',
    headerBg: GEMINI_HEADER_BG,
    headerText: 'text-white',
    icon: '⚔️',
    dataSource: 'gemini',
  },
  'Content Strategy': {
    bg: 'bg-[#2F4A7C]/10',
    bgSolid: 'bg-[#2F4A7C]',
    text: 'text-[#2F4A7C]',
    border: 'border-[#2F4A7C]/30',
    headerBg: GEMINI_HEADER_BG,
    headerText: 'text-white',
    icon: '📝',
    dataSource: 'gemini',
  },
  'Market Intelligence': {
    bg: 'bg-[#2F4A7C]/10',
    bgSolid: 'bg-[#2F4A7C]',
    text: 'text-[#2F4A7C]',
    border: 'border-[#2F4A7C]/30',
    headerBg: GEMINI_HEADER_BG,
    headerText: 'text-white',
    icon: '📊',
    dataSource: 'gemini',
  },
  'Marketing News': {
    bg: 'bg-[#2F4A7C]/10',
    bgSolid: 'bg-[#2F4A7C]',
    text: 'text-[#2F4A7C]',
    border: 'border-[#2F4A7C]/30',
    headerBg: GEMINI_HEADER_BG,
    headerText: 'text-white',
    icon: '📰',
    dataSource: 'gemini',
  },
  'Marketing SWOT': {
    bg: 'bg-[#2F4A7C]/10',
    bgSolid: 'bg-[#2F4A7C]',
    text: 'text-[#2F4A7C]',
    border: 'border-[#2F4A7C]/30',
    headerBg: GEMINI_HEADER_BG,
    headerText: 'text-white',
    icon: '📈',
    dataSource: 'gemini',
  },
};

// Helper function to get style by category
export const getStrategyCardStyle = (category: StrategyCardCategory): CategoryStyle => {
  return STRATEGY_CARD_COLORS[category] || STRATEGY_CARD_COLORS['Audience Insights'];
};

// Helper to check if a category uses Sovrn data
export const usesSovrnData = (category: StrategyCardCategory): boolean => {
  const style = STRATEGY_CARD_COLORS[category];
  return style?.dataSource === 'sovrn';
};

// Helper function to round decimal numbers to 1 digit after the decimal point
const roundToOneDecimal = (numStr: string): string => {
  // Match the numeric part (before any suffix like %, M, B, K, x)
  const match = numStr.match(/^([\$]?)([\d,]+)(?:\.(\d+))?(.*)$/);
  if (!match) return numStr;
  
  const [, prefix, intPart, decPart, suffix] = match;
  
  // If no decimal part, return as-is
  if (!decPart) return numStr;
  
  // If decimal part is already 1 digit or less, return as-is
  if (decPart.length <= 1) return numStr;
  
  // Round to 1 decimal place
  const fullNum = parseFloat(`${intPart.replace(/,/g, '')}.${decPart}`);
  const rounded = Math.round(fullNum * 10) / 10;
  
  // Format with commas if the original had commas
  let formattedInt: string;
  const roundedStr = rounded.toFixed(1);
  const [newIntPart, newDecPart] = roundedStr.split('.');
  
  if (intPart.includes(',')) {
    formattedInt = parseInt(newIntPart).toLocaleString('en-US');
  } else {
    formattedInt = newIntPart;
  }
  
  return `${prefix}${formattedInt}.${newDecPart}${suffix}`;
};

// Helper function to format text with highlighted numbers and percentages
export const formatWithHighlights = (text: string): string => {
  if (!text) return '';
  
  // Highlight numbers, percentages, dollar amounts, and multipliers
  // Pattern breakdown:
  // 1. Dollar amounts with optional decimals and M/B/K suffix: $11.9M, $5,000, $100.50K
  // 2. Percentages (including comma-separated numbers): 10%, 5.5%, 115,932.136%
  // 3. Multipliers: 168x, 1.5x, 1,000x
  // 4. Plain numbers with optional decimals: 27.7, 5,000, 3.12
  return text.replace(
    /(\$[\d,]+(?:\.\d+)?[BMK]?|\d+(?:,\d+)*(?:\.\d+)?%|\d+(?:,\d+)*(?:\.\d+)?x|\d+(?:,\d+)*(?:\.\d+)?[BMK]|\d+(?:,\d+)*(?:\.\d+)?)/g,
    (match) => {
      const rounded = roundToOneDecimal(match);
      return `<span class="font-bold">${rounded}</span>`;
    }
  );
};

// Card type to category mapping
export const CARD_TYPE_TO_CATEGORY: Record<string, StrategyCardCategory> = {
  'personas': 'Audience Personas',
  'audience-insights': 'Audience Insights',
  'brand-strategy': 'Brand Strategy',
  'company-profile': 'Company Profiles',
  'competitive-intelligence': 'Competitive Intelligence',
  'content-strategy': 'Content Strategy',
  'market-sizing': 'Market Intelligence',
  'marketing-news': 'Marketing News',
  'marketing-swot': 'Marketing SWOT',
  'sovrn-insight': 'Sovrn Insights',
};

// Get category from card type
export const getCategoryFromType = (type: string): StrategyCardCategory => {
  return CARD_TYPE_TO_CATEGORY[type] || 'Audience Insights';
};
