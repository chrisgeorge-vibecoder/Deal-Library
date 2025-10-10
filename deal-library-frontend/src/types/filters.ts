// Filter types for Geo Insights

export interface ZipCodeFilters {
  states: string[];
  counties: string[];
  dmas: string[];
  populationRange: {
    min: number;
    max: number;
  } | null;
  incomeRange: {
    min: number;
    max: number;
  } | null;
  penetrationRange: {
    min: number;
    max: number;
  } | null;
  opportunityRange: {
    min: number;
    max: number;
  } | null;
}

export interface MarketFilters {
  dmaRank: {
    min: number;
    max: number;
  } | null;
  saturationLevels: ('low' | 'medium' | 'high')[];
  growthPotential: {
    min: number;
    max: number;
  } | null;
  regions: string[];
  populationRange: {
    min: number;
    max: number;
  } | null;
}

export interface SegmentFilters {
  segmentTypes: string[];
  growthRateRange: {
    min: number;
    max: number;
  } | null;
  incomeRange: {
    min: number;
    max: number;
  } | null;
  penetrationRange: {
    min: number;
    max: number;
  } | null;
  coverage: {
    min: number;
    max: number;
  } | null;
}

export interface DataQualityFilters {
  dataFreshness: 'all' | 'recent' | 'stale';
  dataCompleteness: 'all' | 'complete' | 'partial';
  dataSource: 'all' | 'sample' | 'real';
}

export interface GeographicFilters {
  zipCode: ZipCodeFilters;
  market: MarketFilters;
  segment: SegmentFilters;
  dataQuality: DataQualityFilters;
}

export interface FilterState {
  activeFilters: GeographicFilters;
  activeTab: 'zip-codes' | 'markets' | 'segments';
  isOpen: boolean;
}

// Filter options for dropdowns
export interface FilterOptions {
  states: string[];
  counties: string[];
  dmas: string[];
  regions: string[];
  segmentTypes: string[];
  saturationLevels: ('low' | 'medium' | 'high')[];
}

// Filter presets for quick access
export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<GeographicFilters>;
  category: 'opportunity' | 'analysis' | 'competitive' | 'custom';
}

export const DEFAULT_FILTERS: GeographicFilters = {
  zipCode: {
    states: [],
    counties: [],
    dmas: [],
    populationRange: null,
    incomeRange: null,
    penetrationRange: null,
    opportunityRange: null,
  },
  market: {
    dmaRank: null,
    saturationLevels: [],
    growthPotential: null,
    regions: [],
    populationRange: null,
  },
  segment: {
    segmentTypes: [],
    growthRateRange: null,
    incomeRange: null,
    penetrationRange: null,
    coverage: null,
  },
  dataQuality: {
    dataFreshness: 'all',
    dataCompleteness: 'all',
    dataSource: 'all',
  },
};

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'high-opportunity',
    name: 'High Opportunity Markets',
    description: 'Markets with low saturation and high growth potential',
    category: 'opportunity',
    filters: {
      market: {
        dmaRank: null,
        saturationLevels: ['low'],
        growthPotential: { min: 0.4, max: 1.0 },
        regions: [],
        populationRange: null,
      },
    },
  },
  {
    id: 'high-income',
    name: 'High Income Areas',
    description: 'Zip codes with high median income',
    category: 'analysis',
    filters: {
      zipCode: {
        states: [],
        counties: [],
        dmas: [],
        populationRange: null,
        incomeRange: { min: 100000, max: 1000000 },
        penetrationRange: null,
        opportunityRange: null,
      },
    },
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    description: 'Saturated markets for competitive intelligence',
    category: 'competitive',
    filters: {
      market: {
        dmaRank: null,
        saturationLevels: ['high'],
        growthPotential: null,
        regions: [],
        populationRange: null,
      },
    },
  },
  {
    id: 'tech-hubs',
    name: 'Tech Hub Markets',
    description: 'Major technology markets and surrounding areas',
    category: 'custom',
    filters: {
      zipCode: {
        states: [],
        counties: [],
        dmas: ['San Francisco', 'New York', 'Seattle', 'Austin', 'Boston'],
        populationRange: null,
        incomeRange: null,
        penetrationRange: null,
        opportunityRange: null,
      },
    },
  },
  {
    id: 'emerging-markets',
    name: 'Emerging Markets',
    description: 'Growing markets with expansion potential',
    category: 'opportunity',
    filters: {
      market: {
        dmaRank: null,
        growthPotential: { min: 0.3, max: 1.0 },
        saturationLevels: ['low', 'medium'],
        regions: [],
        populationRange: null,
      },
    },
  },
];
