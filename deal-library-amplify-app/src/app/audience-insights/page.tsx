'use client';

import { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, Users, MapPin, BarChart3, Download, Sparkles, Bookmark, ArrowRight, ShoppingCart, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dynamic from 'next/dynamic';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import DealDetailModal from '@/components/DealDetailModal';
import { Deal } from '@/types/deal';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';

// Dynamically import map component - must be client-side only due to Leaflet
const AudienceInsightsMap = dynamic(
  () => import('@/components/AudienceInsightsMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border border-gray-200 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-brand-orange mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    )
  }
);

interface AudienceInsightsReport {
  segment: string;
  category: string;
  executiveSummary: string;
  personaName: string;  // NEW
  personaEmoji: string;  // NEW
  keyMetrics: {
    medianHHI: number;
    medianHHIvsNational: number;
    medianHHIvsCommerce: number;  // NEW
    topAgeBracket: string;
    educationLevel: number;
    educationVsNational: number;
    educationVsCommerce: number;  // NEW
  };
  geographicHotspots: Array<{
    zipCode: string;
    city: string;
    state: string;
    density: number;
    population?: number;
    overIndex?: number;
  }>;
  demographics: {
    incomeDistribution: Array<{ bracket: string; percentage: number; nationalAvg: number }>;
    educationLevels: Array<{ level: string; percentage: number }>;
    ageDistribution: Array<{ bracket: string; percentage: number }>;
    lifestyle?: {
      selfEmployed: number;
      married: number;
      dualIncome: number;
      avgCommuteTime: number;
      charitableGivers: number;
      stemDegree: number;
    };
    // Additional Census data
    ethnicity?: {
      white: number;
      black: number;
      hispanic: number;
      asian: number;
    };
    medianHomeValue?: number;
    homeOwnership?: number;
    avgHouseholdSize?: number;
    urbanRuralDistribution?: Array<{ type: string; percentage: number }>;
  };
  behavioralOverlap: Array<{
    segment: string;
    overlapPercentage: number;
    insight: string;
    overIndex?: number;
    topMarkets?: Array<{city: string; state: string; overIndex: number}>;
  }>;
  strategicInsights: {
    targetPersona: string;
    messagingRecommendations: string[];
    channelRecommendations: string[];
  };
}

export default function AudienceInsightsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [segments, setSegments] = useState<string[]>([]);
  const [selectedSegment, setSelectedSegment] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AudienceInsightsReport | null>(null);
  const [error, setError] = useState('');
  const [includeCommercialZips, setIncludeCommercialZips] = useState(false);  // NEW: Toggle for downtown ZIPs
  const [showMap, setShowMap] = useState(false);  // Delay map loading to avoid chunk errors
  const [recommendedDeals, setRecommendedDeals] = useState<any[]>([]);  // NEW: Recommended deals
  const [geoTab, setGeoTab] = useState<'populous' | 'indexing'>('populous');  // NEW: Geographic hotspots tab
  const [loadingStrategicContent, setLoadingStrategicContent] = useState(false);  // Loading state for strategic content
  const [strategicContentGenerated, setStrategicContentGenerated] = useState(false);  // Track if strategic content has been requested/generated
  const [strategicContentError, setStrategicContentError] = useState<string | null>(null);  // Track errors during generation
  const reportRef = useRef<HTMLDivElement>(null);  // Ref for PDF export
  
  // Deal Modal State
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Helper function to convert Markdown bold (**text**) to HTML <strong>text</strong>
  const renderMarkdown = (text: string) => {
    if (typeof text !== 'string') return String(text);
    
    // Convert **text** to <strong>text</strong>
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={i} className="font-bold">{boldText}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Load categories on mount and test backend connectivity
  useEffect(() => {
    loadCategories();
    
    // Test backend connectivity
    const testBackendConnection = async () => {
      try {
        const response = await fetch('/api/audience-geo-analysis/segments');
        if (response.ok) {
          console.log('✅ Backend connection successful');
        } else {
          console.warn(`⚠️ Backend responded with status: ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Backend connection failed:', error);
      }
    };
    
    testBackendConnection();
  }, []);


  const [isPersonaSaved, setIsPersonaSaved] = useState(false);
  const [savedDealIds, setSavedDealIds] = useState<Set<string>>(new Set());
  
  // Enable map after component mounts to avoid SSR/chunk issues
  useEffect(() => {
    setShowMap(true);
  }, []);
  
  // Check if this persona is already saved
  useEffect(() => {
    if (report) {
      // Check localStorage for saved cards
      const savedCardsJson = localStorage.getItem('savedCards');
      if (savedCardsJson) {
        try {
          const savedCards = JSON.parse(savedCardsJson);
          const isAlreadySaved = savedCards.some((card: any) => 
            card.type === 'persona' && card.segment === report.segment
          );
          setIsPersonaSaved(isAlreadySaved);
        } catch (e) {
          console.error('Error checking saved cards:', e);
        }
      }
    }
  }, [report]);

  // Load saved deal IDs from localStorage
  useEffect(() => {
    const savedCardsJson = localStorage.getItem('savedCards');
    if (savedCardsJson) {
      try {
        const savedCards = JSON.parse(savedCardsJson);
        const dealIds = savedCards
          .filter((card: any) => card.type === 'deal')
          .map((card: any) => `deal-${card.data.dealId || card.data.id}`);
        setSavedDealIds(new Set(dealIds));
      } catch (e) {
        console.error('Error loading saved deal IDs:', e);
      }
    }
  }, []);

  // Deal Modal Handlers
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDealModalOpen(true);
  };

  const handleCloseDealModal = () => {
    setIsDealModalOpen(false);
    setSelectedDeal(null);
  };

  // Cart handlers
  const handleAddToCart = (deal: Deal) => {
    console.log('Adding to cart:', deal.dealName);
    // Dispatch event to AppLayout to handle cart
    window.dispatchEvent(new CustomEvent('addToCart', { detail: { deal } }));
  };

  const handleRemoveFromCart = (dealId: string) => {
    console.log('Removing from cart:', dealId);
    // Dispatch event to AppLayout to handle cart
    window.dispatchEvent(new CustomEvent('removeFromCart', { detail: { dealId } }));
  };

  const isInCart = (dealId: string) => {
    // This would need to check AppLayout's cart state
    // For now, return false as a placeholder
    return false;
  };

  // Helper functions for formatting
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // PDF Export function - Captures the actual rendered HTML
  const exportToPDF = async () => {
    if (!report || !reportRef.current) {
      console.error('No report data or ref available');
      return;
    }

    console.log('Starting PDF generation from HTML...');

    try {
      // Show loading state
      const button = document.querySelector('[data-pdf-export]') as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.textContent = 'Generating PDF...';
      }

      console.log('Capturing HTML content with html2canvas...');
      
      // Capture the report content as canvas with optimized settings
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher quality for better text rendering
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY, // Capture from top of element
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight,
        logging: false,
        imageTimeout: 0,
        removeContainer: true,
        onclone: (clonedDoc) => {
          // Ensure all styles are preserved in the clone
          const clonedElement = clonedDoc.querySelector('[data-report-content]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'none';
          }
        }
      });

      console.log('Canvas created, generating PDF...');

      // Create PDF from canvas
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      console.log('✅ PDF created successfully');

      // Save the PDF
      const fileName = `Sovrn_Commerce_Audience_Insights_${report.segment.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      console.log('✅ PDF saved:', fileName);

      // Reset button state
      if (button) {
        button.disabled = false;
        button.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Export Report (PDF)';
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      alert(`Error generating PDF: ${error instanceof Error ? error.message : String(error)}`);
      
      // Reset button state
      const button = document.querySelector('[data-pdf-export]') as HTMLButtonElement;
      if (button) {
        button.disabled = false;
        button.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Export Report (PDF)';
      }
    }
  };

  // Load segments when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadSegments(selectedCategory);
    } else {
      setSegments([]);
      setSelectedSegment('');
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      // Official Google Product Taxonomy Level 1 categories (alphabetically sorted)
      // Source: https://www.google.com/basepages/producttype/taxonomy.en-US.txt
      const topCategories = [
        'Animals & Pet Supplies',
        'Apparel & Accessories',
        'Arts & Entertainment',
        'Baby & Toddler',
        'Business & Industrial',
        'Cameras & Optics',
        'Electronics',
        'Food, Beverages & Tobacco',
        'Furniture',
        'Hardware',
        'Health & Beauty',
        'Home & Garden',
        'Luggage & Bags',
        'Media',
        'Office Supplies',
        'Software',
        'Sporting Goods',
        'Toys & Games',
        'Vehicles & Parts'
      ]; // Excluded: Mature, Religious & Ceremonial (not applicable for most commerce)
      setCategories(topCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    }
  };

  const loadSegments = async (category: string) => {
    try {
      setLoading(true);
      setError('');
      
      // Get EXACT segments for this category (no keyword matching)
      const exactSegments = getSegmentsForCategory(category);
      
      if (exactSegments.length > 0) {
        // Get all available segments from backend
        console.log(`🔄 Loading segments for category: ${category}`);
        console.log(`   Expected segments in mapping: ${exactSegments.join(', ')}`);
        
        // First, ensure commerce data is loaded
        try {
          const statusResponse = await fetch('/api/commerce-audiences/status');
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('📊 Commerce data status:', statusData);
            
            if (!statusData.isLoaded || statusData.totalRecords === 0) {
              console.log('🔄 Commerce data not loaded, attempting to load...');
              const loadResponse = await fetch('/api/commerce-audiences/load', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (loadResponse.ok) {
                const loadData = await loadResponse.json();
                console.log('✅ Commerce data loaded:', loadData);
              } else {
                console.warn('⚠️ Failed to load commerce data, but continuing...');
              }
            }
          }
        } catch (statusError) {
          console.warn('⚠️ Could not check commerce data status, continuing...', statusError);
        }
        
        let data: any = null;
        
        // Try the primary endpoint first
        try {
          const response = await fetch('/api/audience-geo-analysis/segments');
          const responseData = await response.json();
          
          if (!response.ok) {
            console.error('❌ Primary endpoint error response:', responseData);
            throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
          }
          
          data = responseData;
          console.log('📡 Backend response (primary endpoint):', data);
        } catch (primaryError) {
          console.warn('⚠️ Primary endpoint failed, trying fallback:', primaryError);
          
          // Try fallback endpoint
          try {
            const fallbackResponse = await fetch('/api/commerce-audiences/segments');
            const fallbackData = await fallbackResponse.json();
            
            if (fallbackResponse.ok) {
              data = fallbackData;
              console.log('📡 Backend response (fallback endpoint):', data);
            } else {
              // Even if not ok, we got JSON - show the error
              console.error('❌ Fallback endpoint returned error:', fallbackData);
              throw new Error(fallbackData.error || `HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
            }
          } catch (fallbackError) {
          console.error('❌ Both endpoints failed');
          console.error('Primary error:', primaryError);
          console.error('Fallback error:', fallbackError);
          
          // Try to extract error details from fallback response
          if (fallbackError instanceof Error && fallbackError.message.includes('HTTP')) {
            // If we got an HTTP error, try to get the response body
            try {
              const fallbackResponse = await fetch('/api/commerce-audiences/segments');
              if (!fallbackResponse.ok) {
                const errorData = await fallbackResponse.json().catch(() => ({}));
                console.error('Fallback endpoint error response:', errorData);
                setError(`Failed to load segments: ${errorData.error || errorData.message || fallbackResponse.statusText}`);
                setSegments([]);
                return;
              }
            } catch (e) {
              // Ignore
            }
          }
          
          throw primaryError; // Re-throw the original error
        }
        }
        
        console.log('📦 Full API response:', JSON.stringify(data, null, 2));
        
        // Handle response with or without success field
        if (data && Array.isArray(data.segments) && data.segments.length > 0) {
          // Handle both response formats:
          // 1. /api/audience-geo-analysis/segments returns: { segments: string[] }
          // 2. /api/commerce-audiences/segments returns: { segments: AudienceSegment[] }
          
          let backendSegmentNames: string[] = [];
          if (data.segments.length > 0) {
            // Check if segments are strings or objects with name property
            if (typeof data.segments[0] === 'string') {
              backendSegmentNames = data.segments as string[];
            } else if (data.segments[0] && typeof data.segments[0] === 'object' && 'name' in data.segments[0]) {
              backendSegmentNames = (data.segments as any[]).map(seg => seg.name);
            } else {
              console.error('❌ Unknown segment format:', data.segments[0]);
              throw new Error('Unknown segment data format');
            }
          }
          
          console.log(`📋 Backend has ${backendSegmentNames.length} segments total`);
          console.log(`📋 First 20 segments:`, backendSegmentNames.slice(0, 20));
          
          // Normalize function for case-insensitive and whitespace-insensitive matching
          const normalize = (str: string): string => {
            return str.toLowerCase().trim().replace(/\s+/g, ' ');
          };
          
          // Create normalized sets for faster lookup
          const normalizedBackendSegments = new Set(backendSegmentNames.map(normalize));
          const normalizedExactSegments = new Map<string, string>(); // normalized -> original
          exactSegments.forEach(seg => {
            normalizedExactSegments.set(normalize(seg), seg);
          });
          
          // Find matches using normalized comparison
          const matchedSegments: string[] = [];
          
          // First, try exact normalized matches
          for (const [normalized, original] of normalizedExactSegments.entries()) {
            if (normalizedBackendSegments.has(normalized)) {
              matchedSegments.push(original);
            }
          }
          
          // If we found matches, use them
          if (matchedSegments.length > 0) {
            const sortedSegments = matchedSegments.sort((a: string, b: string) => a.localeCompare(b));
            setSegments(sortedSegments);
            console.log(`✅ Mapped ${sortedSegments.length} segments for category: ${category}`);
            console.log(`   Available segments: ${sortedSegments.join(', ')}`);
            return; // Success - exit early
          }
          
          // If no exact matches, try partial matching
          // STRICT: Only include segments that are similar to expected segments to prevent cross-category contamination
          // This prevents "Benches" from appearing in non-Furniture categories
          console.log(`⚠️ No exact matches found, trying partial matching...`);
          
          const partialMatches: string[] = [];
          for (const backendSeg of backendSegmentNames) {
            const normalizedBackend = normalize(backendSeg);
            
            // Only include if it's similar to an expected segment (substring match in either direction)
            // This ensures we only show segments that are actually related to the selected category
            const matchesExpectedSegment = Array.from(normalizedExactSegments.keys()).some(expectedNorm => 
              normalizedBackend.includes(expectedNorm) || expectedNorm.includes(normalizedBackend)
            );
            
            if (matchesExpectedSegment) {
              partialMatches.push(backendSeg);
            }
          }
          
          if (partialMatches.length > 0) {
            const sortedSegments = [...new Set(partialMatches)].sort((a: string, b: string) => a.localeCompare(b));
            setSegments(sortedSegments);
            console.log(`✅ Found ${sortedSegments.length} partial matches for category: ${category}`);
            console.log(`   Matched segments: ${sortedSegments.join(', ')}`);
            return; // Success with partial matches
          }
          
          // Last resort: show error with helpful debugging info
          console.warn(`⚠️ No segments found in backend data for category mapping`);
          console.log(`   Looking for: ${exactSegments.join(', ')}`);
          console.log(`   Backend has: ${backendSegmentNames.slice(0, 20).join(', ')}${backendSegmentNames.length > 20 ? '...' : ''}`);
          
          setSegments([]);
          setError(`No segments found for "${category}". Expected: ${exactSegments.slice(0, 5).join(', ')}${exactSegments.length > 5 ? '...' : ''}. Backend has ${backendSegmentNames.length} segments total.`);
        } else {
          console.error('❌ Backend response error:', data);
          console.error('❌ Response structure:', {
            hasData: !!data,
            hasSuccess: data?.success,
            hasSegments: Array.isArray(data?.segments),
            segmentsLength: data?.segments?.length,
            hasError: !!data?.error,
            errorDetails: data?.errorDetails,
            fullData: data
          });
          
          // Show detailed error message
          let errorMessage = 'Failed to load segments';
          if (data?.error) {
            errorMessage = `Error: ${data.error}`;
            if (data?.errorDetails) {
              errorMessage += `\n\nDetails: ${JSON.stringify(data.errorDetails, null, 2)}`;
            }
          } else if (data?.message) {
            errorMessage = data.message;
          }
          
          setError(errorMessage);
          setSegments([]);
        }
      } else {
        console.warn(`⚠️ No segment mapping found for category: ${category}`);
        console.log('🔄 Trying to load all segments from backend as fallback...');
        
        // Fallback: try to get all segments from backend
        try {
          const response = await fetch('/api/commerce-audiences/segments');
          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.segments)) {
              let allSegmentNames: string[] = [];
              if (data.segments.length > 0 && typeof data.segments[0] === 'object' && 'name' in data.segments[0]) {
                allSegmentNames = data.segments.map((seg: any) => seg.name);
              } else if (typeof data.segments[0] === 'string') {
                allSegmentNames = data.segments;
              }
              
              if (allSegmentNames.length > 0) {
                console.log(`📋 Found ${allSegmentNames.length} total segments, showing first 20 for debugging`);
                setSegments(allSegmentNames.slice(0, 20));
                setError(`No mapping found for category "${category}". Showing sample segments instead.`);
                return;
              }
            }
          }
        } catch (fallbackError) {
          console.error('❌ Fallback segment loading also failed:', fallbackError);
        }
        
        setSegments([]);
      }
    } catch (error) {
      console.error('Error loading segments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load segments: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // EXACT segment-to-category mapping (based on Google Product Taxonomy)
  // This prevents cross-contamination like "Laundry Supplies" showing in "Animals & Pet Supplies"
  const getSegmentsForCategory = (category: string): string[] => {
    const exactSegmentMap: Record<string, string[]> = {
      'Animals & Pet Supplies': [
        'Animals & Pet Supplies', 'Cat Supplies', 'Dog Supplies', 'Live Animals', 'Pet Supplies'
      ],
      'Apparel & Accessories': [
        'Activewear', 'Baby & Toddler Clothing', 'Clothing', 'Clothing Accessories',
        'Costumes & Accessories', 'Dresses', 'Outerwear', 'Shirts & Tops', 'Shoes', 'Shorts',
        'Skirts', 'Sunglasses'
      ],
      'Arts & Entertainment': [
        'Arts & Entertainment', 'Books', 'DVDs & Videos', 'Event Tickets', 'Film & Television',
        'Hobbies & Creative Arts', 'Magazines & Newspapers', 'Music & Sound Recordings',
        'Party & Celebration'
      ],
      'Baby & Toddler': [
        'Baby & Toddler', 'Baby & Toddler Furniture', 'Baby Bathing', 'Baby Gift Sets',
        'Baby Health', 'Baby Safety', 'Baby Toys & Activity Equipment', 'Baby Transport',
        'Baby Transport Accessories', 'Diapering', 'Nursing & Feeding', 'Potty Training',
        'Swaddling & Receiving Blankets'
      ],
      'Business & Industrial': [
        'Advertising & Marketing', 'Agriculture', 'Business & Industrial', 'Construction',
        'Finance & Insurance', 'Food Service', 'Forestry & Logging', 'Hotel & Hospitality',
        'Manufacturing', 'Retail', 'Science & Laboratory', 'Signage'
      ],
      'Cameras & Optics': [
        'Camera Lenses', 'Camera Parts & Accessories', 'Cameras', 'Cameras & Optics',
        'Optics', 'Photography'
      ],
      'Electronics': [
        '3D Printers', 'Audio', 'Business & Home Security', 'Circuit Boards & Components',
        'Communications', 'Components', 'Computers', 'Electronics', 'Electronics Accessories',
        'GPS Tracking Devices', 'Laptops', 'Marine Electronics', 'Microphones', 'Mobile Phones',
        'Networking', 'Radar Detectors', 'Speakers', 'Storage Devices', 'Tablet Computers',
        'Televisions', 'Video', 'Video Game Consoles'
      ],
      'Food, Beverages & Tobacco': [
        'Alcoholic Beverages', 'Beverages', 'Coffee', 'Condiments & Sauces',
        'Cooking & Baking Ingredients', 'Dairy Products', 'Dips & Spreads', 'Food Items',
        'Frozen Desserts & Novelties', 'Juice', 'Non-Dairy Milk', 'Nuts & Seeds',
        'Pasta & Noodles', 'Seasonings & Spices', 'Soups & Broths', 'Sports & Energy Drinks',
        'Tea & Infusions', 'Water'
      ],
      'Furniture': [
        'Beds & Accessories', 'Benches', 'Chairs', 'Entertainment Centers & TV Stands',
        'Furniture', 'Furniture Sets', 'Futons', 'Mattresses', 'Office Furniture',
        'Outdoor Furniture', 'Shelving', 'Sofas', 'Tables'
      ],
      'Hardware': [
        'Building Materials', 'Fencing & Barriers', 'Fireplace & Wood Stove Accessories',
        'Fireplaces', 'Hardware', 'Hardware Accessories', 'Locks & Keys', 'Plumbing',
        'Tools', 'Wood Stoves'
      ],
      'Health & Beauty': [
        'Condoms', 'Cosmetic & Toiletry Bags', 'Cosmetics', 'Feminine Sanitary Supplies',
        'Fitness & Nutrition', 'Foot Care', 'Hairdressing & Cosmetology', 'Health & Beauty',
        'Medical', 'Oral Care', 'Personal Care', 'Piercing & Tattooing', 'Shaving & Grooming',
        'Sleeping Aids', 'Vision Care'
      ],
      'Home & Garden': [
        'Bathroom Accessories', 'Cabinets & Storage', 'Cookware & Bakeware', 'Decor',
        'Emergency Preparedness', 'Food & Beverage Carriers', 'Food Service', 'Food Storage',
        'Food Storage Accessories', 'Gardening', 'Home & Garden', 'Household Appliance Accessories',
        'Household Appliances', 'Household Cleaning Supplies', 'Household Paper Products',
        'Household Supplies', 'Kitchen & Dining', 'Kitchen Appliance Accessories',
        'Kitchen Appliances', 'Kitchen Tools & Utensils', 'Laundry Supplies', 'Lawn & Garden',
        'Lighting', 'Linens & Bedding', 'Outdoor Play Equipment', 'Plants', 'Pool & Spa'
      ],
      'Luggage & Bags': [
        'Backpacks', 'Briefcases', 'Duffel Bags', 'Luggage & Bags', 'Messenger Bags', 'Suitcases'
      ],
      'Media': [
        'Media'
      ],
      'Office Supplies': [
        'General Office Supplies', 'Office Equipment', 'Office Supplies'
      ],
      'Software': [
        'Antivirus & Security Software', 'Business & Productivity Software', 'Computer Software',
        'Educational Software', 'Network Software', 'Operating Systems', 'Software'
      ],
      'Sporting Goods': [
        'Athletics', 'Camping & Hiking', 'Cycling', 'Exercise & Fitness', 'Golf',
        'Outdoor Recreation', 'Sporting Goods', 'Sports Toys', 'Winter Sports & Activities',
        'Yoga & Pilates'
      ],
      'Toys & Games': [
        'Arcade Equipment', 'Educational Toys', 'Games', 'Gift Giving', 'Indoor Games',
        'Puzzles', 'Toys', 'Toys & Games'
      ],
      'Vehicles & Parts': [
        'Vehicle Parts & Accessories', 'Vehicles', 'Vehicles & Parts'
      ]
    };
    
    return exactSegmentMap[category] || [];
  };

  const handleGenerateReport = async () => {
    if (!selectedSegment) {
      setError('Please select an audience segment');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);
    setRecommendedDeals([]);

    // Create an AbortController for timeout - report generation can take 60-90 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

    try {
      console.log('🔍 [DEBUG] Generating report for:', { selectedCategory, selectedSegment });
      
      // Generate report without strategic content (Gemini calls) for faster initial load
      const response = await fetch('/api/audience-insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: selectedSegment,
          category: selectedCategory,
          includeCommercialZips,
          skipStrategicContent: true  // Skip Gemini calls for faster response
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('📡 [DEBUG] API Response status:', response.status);
      
      // Check content-type header early
      const contentType = response.headers.get('content-type');
      
      // Handle 504 timeout specifically - infrastructure timeout may not have proper headers
      // Also handle cases where status is 504 OR (status >= 500 AND content-type is null)
      // This covers infrastructure-level timeouts that don't set proper headers
      if (response.status === 504 || (response.status >= 500 && !contentType)) {
        console.error('❌ API request timed out or server error (status:', response.status, ', content-type:', contentType, ')');
        setError('Request timed out. The report generation took too long. Please try again with a different segment or contact support if the issue persists.');
        return;
      }
      
      // If content-type exists but is not JSON, that's an error
      if (contentType && !contentType.includes('application/json')) {
        console.error('❌ API returned non-JSON response:', contentType);
        setError('Failed to generate report: Invalid response format. Please try again.');
        return;
      }
      
      // If content-type is null but status is OK (200-299), try to read the response
      if (!contentType) {
        console.warn('⚠️ Response has no content-type header but status is OK, attempting to read response body');
        // Continue to try reading the response text below
      }

      // Get response text first to check if it's empty
      let responseText: string;
      try {
        responseText = await response.text();
      } catch (textError) {
        console.error('❌ Failed to read response text:', textError);
        setError('Failed to read response from server. Please try again.');
        return;
      }
      
      if (!responseText || responseText.trim().length === 0) {
        console.error('❌ API returned empty response');
        // If we got here and status is not 504, we already handled 504 above
        // This is for other status codes with empty responses
        if (response.status >= 500) {
          setError('Server error. The report generation encountered an issue. Please try again or contact support if the issue persists.');
        } else {
          setError('Failed to generate report: Empty response. Please try again.');
        }
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse API response JSON:', parseError);
        console.error('Response text:', responseText.substring(0, 500));
        setError('Failed to generate report: Invalid response format. Please try again.');
        return;
      }
      
      console.log('📦 [DEBUG] Full API Response:', JSON.stringify(data, null, 2));

      if (data.success && data.report) {
        console.log('✅ [DEBUG] Report received successfully (without strategic content)');
        console.log('📊 [DEBUG] Geographic Hotspots:', {
          count: data.report.geographicHotspots?.length,
          sample: data.report.geographicHotspots?.[0],
          hasPopulation: data.report.geographicHotspots?.[0]?.population !== undefined,
          hasOverIndex: data.report.geographicHotspots?.[0]?.overIndex !== undefined
        });
        console.log('📊 [DEBUG] Demographics:', {
          incomeDistribution: data.report.demographics?.incomeDistribution,
          educationLevels: data.report.demographics?.educationLevels,
          ageDistribution: data.report.demographics?.ageDistribution
        });
        console.log('📊 [DEBUG] Key Metrics:', data.report.keyMetrics);
        
        // Set the initial report (without strategic content)
        console.log('📋 [DEBUG] Initial report persona values:', {
          personaName: data.report.personaName,
          personaEmoji: data.report.personaEmoji,
          personaDescription: data.report.personaDescription,
          hasStrategicInsights: !!data.report.strategicInsights,
          strategicInsightsKeys: data.report.strategicInsights ? Object.keys(data.report.strategicInsights) : []
        });
        setReport(data.report);
        setLoading(false); // Show the report immediately
        
        // Reset strategic content state when new report is generated
        setStrategicContentGenerated(false);
        setStrategicContentError(null);
        
        // Set recommended deals if available
        if (data.recommendedDeals && Array.isArray(data.recommendedDeals)) {
          setRecommendedDeals(data.recommendedDeals);
          console.log(`🎯 [DEBUG] Loaded ${data.recommendedDeals.length} recommended deals`);
        } else {
          setRecommendedDeals([]);
          console.log('⚠️ [DEBUG] No recommended deals in response');
        }
        
        // Strategic content will be loaded on-demand when user clicks the button
        
        console.log(`✅ [DEBUG] Report generated successfully`);
      } else {
        console.error('❌ [DEBUG] Report generation failed:', data);
        const errorMessage = data.message || data.error || 'Failed to generate report';
        setError(errorMessage);
        
        // Log additional details for debugging
        if (data.error) {
          console.error('   Error type:', data.error);
        }
        if (response.status !== 200) {
          console.error('   HTTP Status:', response.status);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ [DEBUG] Error generating report:', error);
      
      let errorMessage = 'Failed to generate report. Please try again.';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. The report generation took too long. Please try again with a different segment.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED')) {
          errorMessage = 'Unable to connect to the server. Please check your connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. The report generation took too long. Please try again.';
        } else {
          // Try to extract a meaningful error message
          errorMessage = error.message || errorMessage;
        }
      } else if (typeof error === 'object' && error !== null) {
        // Handle error objects
        const err = error as any;
        if (err.message) {
          errorMessage = err.message;
        } else if (err.error) {
          errorMessage = err.error;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handler for button click to generate strategic insights
  const handleGenerateStrategicInsights = async () => {
    if (!report) {
      console.warn('⚠️ Cannot generate strategic insights: no report available');
      return;
    }
    console.log('🔘 Button clicked: Generating strategic insights for', report.segment);
    console.log('🔘 Current state:', { 
      strategicContentGenerated, 
      loadingStrategicContent, 
      strategicContentError,
      hasMessagingRecs: !!report?.strategicInsights?.messagingRecommendations?.length
    });
    
    // Set states before making the API call
    setStrategicContentGenerated(true);
    setStrategicContentError(null);
    setLoadingStrategicContent(true);
    
    // Call the async function
    await loadStrategicContent(report);
  };

  // Load strategic content asynchronously when requested by user
  const loadStrategicContent = async (report: AudienceInsightsReport) => {
    // Don't set loading state here - it's already set in handleGenerateStrategicInsights
    setStrategicContentError(null);
    try {
      console.log('✨ Loading strategic content asynchronously for:', report.segment);
      
      // Calculate commerce baseline safely (avoid division by zero)
      const medianHHIvsCommerce = report.keyMetrics.medianHHIvsCommerce || 0;
      const educationVsCommerce = report.keyMetrics.educationVsCommerce || 0;
      const commerceBaselineMedianHHI = medianHHIvsCommerce === -100 
        ? report.keyMetrics.medianHHI 
        : report.keyMetrics.medianHHI / (1 + medianHHIvsCommerce / 100);
      const commerceBaselineEducation = educationVsCommerce === -100
        ? report.keyMetrics.educationLevel
        : report.keyMetrics.educationLevel / (1 + educationVsCommerce / 100);
      
      const response = await fetch('/api/audience-insights/strategic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: report.segment,
          category: report.category,
          demographics: report.demographics,
          overlaps: report.behavioralOverlap || [],
          geoIntelligence: {
            topCities: report.geographicHotspots?.slice(0, 10).map(h => ({ city: h.city, state: h.state })) || [],
            topStates: [],
            regionalInsights: []
          },
          commerceBaseline: {
            medianHHI: commerceBaselineMedianHHI,
            educationBachelorsPlus: commerceBaselineEducation,
            medianAge: 42
          }
        })
      });

      console.log('📡 Strategic content API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('❌ Strategic content API error:', response.status, errorText);
        const errorMessage = `Failed to generate strategic insights. ${response.status === 504 ? 'Request timed out. Please try again.' : 'Please try again later.'}`;
        setStrategicContentError(errorMessage);
        setLoadingStrategicContent(false);
        return;
      }

      // Get response text first to check if it's empty
      const responseText = await response.text();
      if (!responseText || responseText.trim().length === 0) {
        console.error('❌ Strategic content API returned empty response');
        setStrategicContentError('No content received from AI service. Please try again.');
        setLoadingStrategicContent(false);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse strategic content JSON:', parseError);
        console.error('Response text:', responseText.substring(0, 500));
        setStrategicContentError('Invalid response from AI service. Please try again.');
        setLoadingStrategicContent(false);
        return;
      }

      if (data.success) {
        console.log('✅ Strategic content loaded successfully:', {
          hasExecutiveSummary: !!data.executiveSummary,
          hasStrategicInsights: !!data.strategicInsights,
          personaName: data.personaName,
          personaEmoji: data.personaEmoji,
          messagingRecsCount: data.strategicInsights?.messagingRecommendations?.length || 0
        });
        
        // Update the report with strategic content
        setReport(prevReport => {
          if (!prevReport) return prevReport;
          
          // IMPORTANT: Only use AI-generated strategic insights, not fallback values
          // Replace the entire strategicInsights object with the AI-generated one
          const aiStrategicInsights = data.strategicInsights || {
            targetPersona: '',
            keyInsights: [],
            messagingRecommendations: [],
            channelRecommendations: [],
            creativeGuidance: ''
          };
          
          console.log('🔄 Updating report with AI strategic content:', {
            hasMessagingRecs: !!aiStrategicInsights.messagingRecommendations?.length,
            messagingRecsCount: aiStrategicInsights.messagingRecommendations?.length || 0
          });
          
          return {
            ...prevReport,
            executiveSummary: data.executiveSummary || prevReport.executiveSummary,
            strategicInsights: aiStrategicInsights, // Use AI-generated content, not fallback
            personaName: data.personaName || prevReport.personaName,
            personaEmoji: data.personaEmoji || prevReport.personaEmoji,
            personaDescription: data.personaDescription || prevReport.personaDescription
          };
        });
        
        // Ensure strategic content is marked as generated
        setStrategicContentGenerated(true);
        
        // Force a re-render by updating loading state
        setLoadingStrategicContent(false);
      } else {
        console.error('❌ Strategic content API returned success=false:', data.error || data.message);
        setStrategicContentError(data.error || data.message || 'Failed to generate strategic insights. Please try again.');
        setLoadingStrategicContent(false);
      }
    } catch (error) {
      console.error('❌ Error loading strategic content:', error);
      if (error instanceof Error) {
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack?.substring(0, 300));
        setStrategicContentError(error.message || 'An unexpected error occurred. Please try again.');
      } else {
        setStrategicContentError('An unexpected error occurred. Please try again.');
      }
      setLoadingStrategicContent(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="pt-6 pb-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-brand-orange" />
                Audience Insights
              </h1>
              <p className="text-neutral-600 mt-2">
                World-class audience intelligence powered by Sovrn Commerce Data + US Census + Gemini AI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Selection Panel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Audience Segment</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Product Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSegment('');
                  setSegments([]); // Clear segments immediately when category changes
                  setReport(null);
                }}
                className="input w-full"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Segment Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Commerce Audience Segment
              </label>
              <select
                value={selectedSegment}
                onChange={(e) => {
                  setSelectedSegment(e.target.value);
                  setReport(null);
                }}
                disabled={!selectedCategory || loading}
                className="input w-full"
              >
                <option value="">Select segment...</option>
                {segments.map((seg) => (
                  <option key={seg} value={seg}>
                    {seg}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerateReport}
                disabled={!selectedSegment || loading}
                className="btn-primary w-full px-6 py-2 disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="inline-block animate-spin mr-2">⏳</div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Options - Below Dropdowns */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
              <input
                type="checkbox"
                checked={includeCommercialZips}
                onChange={(e) => setIncludeCommercialZips(e.target.checked)}
                className="w-4 h-4 text-brand-gold border-neutral-300 rounded focus:ring-brand-gold"
              />
              <span className="font-medium">Include downtown commercial ZIPs</span>
              <span className="text-xs text-gray-400">(offices, low residential pop)</span>
            </label>
            <p className="text-xs text-gray-500 mt-2 ml-6">
              💡 Enable for B2B segments (Office Furniture, Business Supplies). Disable for consumer segments (Pet Supplies, Baby Products).
            </p>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Report Display */}
        {report && (
          <div ref={reportRef} className="space-y-8">
            
            {/* PERSONA MODULE - NEW */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 relative">
              {/* Bookmark Icon - Upper Right */}
              <button 
                onClick={() => {
                  const personaCard = {
                    type: 'persona',
                    title: report.personaName || `The ${report.segment} Consumer`,
                    segment: report.segment,
                    category: report.category,
                    emoji: report.personaEmoji,
                    description: report.strategicInsights?.targetPersona?.replace(/\*\*/g, '') || report.personaDescription || `The ${report.segment} audience`,
                    data: report
                  };
                  window.dispatchEvent(new CustomEvent('saveCard', { detail: personaCard }));
                  setIsPersonaSaved(true);
                }}
                className={`absolute top-4 right-4 p-2 rounded-lg transition-colors border ${
                  isPersonaSaved 
                    ? 'bg-brand-orange border-brand-orange' 
                    : 'bg-white border-gray-300 hover:bg-white/80'
                }`}
                title={isPersonaSaved ? "Saved to Strategy Cards" : "Save to Strategy Cards"}
              >
                <Bookmark className={`w-5 h-5 ${isPersonaSaved ? 'text-white fill-white' : 'text-gray-600 hover:text-brand-orange'}`} />
              </button>
              
              <div className="flex items-start gap-6">
                {/* Dynamic Emoji */}
                <div className="text-6xl">{report.personaEmoji || '🎯'}</div>
                
                {/* Persona Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-3xl font-bold text-gray-900">{report.personaName || `The ${report.segment} Consumer`}</h2>
                    <span className="px-3 py-1 bg-brand-orange text-white text-sm rounded-full font-medium">
                      {report.category}
                    </span>
                  </div>
                  
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">
                    {report.strategicInsights?.targetPersona ? renderMarkdown(report.strategicInsights.targetPersona) : (report.personaDescription || `The ${report.segment} audience represents a key market segment with distinct characteristics and preferences.`)}
                  </p>
                  
                  
                  {/* Creative Hooks */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">💡 Creative Hooks:</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.strategicInsights?.messagingRecommendations?.slice(0, 3).map((msg: any, index: number) => {
                        // Handle both object format (new) and string format (legacy)
                        let cleanMsg = '';
                        if (typeof msg === 'object' && msg !== null) {
                          // New format: extract valueProposition and clean markdown
                          cleanMsg = (msg.valueProposition || '').replace(/\*\*/g, '').substring(0, 80);
                        } else if (typeof msg === 'string') {
                          // Legacy format: clean markdown and truncate
                          cleanMsg = msg.replace(/\*\*/g, '').split(':')[0].substring(0, 80);
                        }
                        
                        return (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-white border border-purple-300 text-purple-800 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
                            title={typeof msg === 'object' && msg.emotionalBenefit ? msg.emotionalBenefit : cleanMsg}
                          >
                            {cleanMsg}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                </div>
              </div>
            </section>

            {/* A. The Who & The Why (Renamed from Executive Summary) */}
            <section className="card p-6">
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-brand-gold" />
                The Who & The Why
              </h2>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {report.executiveSummary}
              </p>

              {/* KPI Cards - Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <div className="text-sm text-gray-700 font-medium mb-1">Median Household Income</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(report.keyMetrics.medianHHI)}</div>
                  <div className="mt-2 text-xs">
                    <div className={`${(report.keyMetrics.medianHHIvsNational ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                      {formatPercentage(report.keyMetrics.medianHHIvsNational)} vs US National ⭐
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <div className="text-sm text-gray-700 font-medium mb-1">Top Age Bracket</div>
                  <div className="text-2xl font-bold text-gray-900">{report.keyMetrics.topAgeBracket}</div>
                  <div className="text-sm text-gray-600 mt-1">Most concentrated</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-300">
                  <div className="text-sm text-gray-700 font-medium mb-1">Education Level</div>
                  <div className="text-2xl font-bold text-gray-900">{(report.keyMetrics.educationLevel ?? 0).toFixed(1)}%</div>
                  <div className="mt-2 text-xs">
                    <div className={`${(report.keyMetrics.educationVsNational ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                      {formatPercentage(report.keyMetrics.educationVsNational)} vs US National ⭐
                    </div>
                  </div>
                </div>

                {/* Home Value */}
                {report.demographics.medianHomeValue && (
                  <div className="bg-white p-4 rounded-lg border border-gray-300">
                    <div className="text-sm text-gray-700 font-medium mb-1">Median Home Value</div>
                    <div className="text-2xl font-bold text-gray-900">${Math.round(report.demographics.medianHomeValue).toLocaleString()}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {report.demographics.homeOwnership?.toFixed(0) || 0}% homeowners
                    </div>
                  </div>
                )}
              </div>

              {/* KPI Cards - Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Ethnicity */}
                {report.demographics.ethnicity && (
                  <div className="bg-white p-4 rounded-lg border border-gray-300">
                    <div className="text-sm text-gray-700 font-medium mb-1">Primary Ethnicity</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {(() => {
                        const ethnicity = report.demographics.ethnicity;
                        const ethnicityMap = {
                          'White': ethnicity.white,
                          'Hispanic': ethnicity.hispanic,
                          'Black': ethnicity.black,
                          'Asian': ethnicity.asian
                        };
                        // Find the ethnicity with the highest percentage
                        const primary = Object.entries(ethnicityMap)
                          .sort(([,a], [,b]) => b - a)[0];
                        return primary ? primary[0] : 'Mixed';
                      })()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {(() => {
                        const ethnicity = report.demographics.ethnicity;
                        const max = Math.max(ethnicity.white, ethnicity.hispanic, ethnicity.black, ethnicity.asian);
                        return `${Math.round(max)}% of population`;
                      })()}
                    </div>
                  </div>
                )}

                {/* Urban/Rural Distribution */}
                {report.demographics.urbanRuralDistribution && report.demographics.urbanRuralDistribution.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-gray-300">
                    <div className="text-sm text-gray-700 font-medium mb-1">Location Type</div>
                    <div className="text-2xl font-bold text-gray-900 capitalize">
                      {report.demographics.urbanRuralDistribution[0]?.type || 'Mixed'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {report.demographics.urbanRuralDistribution[0]?.percentage?.toFixed(0) || 0}% of population
                    </div>
                  </div>
                )}

                {/* Household Size */}
                {report.demographics.avgHouseholdSize && (
                  <div className="bg-white p-4 rounded-lg border border-gray-300">
                    <div className="text-sm text-gray-700 font-medium mb-1">Household Size</div>
                    <div className="text-2xl font-bold text-gray-900">{report.demographics.avgHouseholdSize.toFixed(1)}</div>
                    <div className="text-xs text-gray-600 mt-1">people per household</div>
                  </div>
                )}

                {/* Lifestyle - Marriage */}
                {report.demographics.lifestyle && (
                  <div className="bg-white p-4 rounded-lg border border-gray-300">
                    <div className="text-sm text-gray-700 font-medium mb-1">Marriage Rate</div>
                    <div className="text-2xl font-bold text-gray-900">{report.demographics.lifestyle.married.toFixed(0)}%</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {report.demographics.lifestyle.dualIncome.toFixed(0)}% dual income
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* B. Geographic Hotspots */}
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-brand-charcoal flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-brand-gold" />
                  Geographic Hotspots
                </h2>
                
                {/* Tabs */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setGeoTab('populous')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      geoTab === 'populous' 
                        ? 'bg-white text-brand-charcoal shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Most Populous
                  </button>
                  <button
                    onClick={() => setGeoTab('indexing')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      geoTab === 'indexing' 
                        ? 'bg-white text-brand-charcoal shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Highest Indexing
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">Top markets by audience concentration</p>
                
                {/* Interactive Map */}
                {showMap && report.geographicHotspots && report.geographicHotspots.length > 0 ? (
                  <AudienceInsightsMap 
                    key={`map-${geoTab}`}
                    hotspots={(() => {
                      // Sort based on selected tab before passing to map
                      const sorted = [...report.geographicHotspots];
                      if (geoTab === 'indexing') {
                        sorted.sort((a, b) => (b.overIndex || 0) - (a.overIndex || 0));
                      } else {
                        sorted.sort((a, b) => (b.population || 0) - (a.population || 0));
                      }
                      return sorted.slice(0, 10);
                    })()} 
                    segmentName={report.segment}
                  />
                ) : !showMap ? (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border border-gray-200 flex items-center justify-center min-h-[300px]">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-brand-orange mx-auto mb-4 animate-pulse" />
                      <p className="text-gray-600">Loading map component...</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
                    <p className="text-gray-500">No geographic data available</p>
                  </div>
                )}
              </div>

              {/* Top ZIP Codes Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Rank</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">ZIP Code</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">City, State</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Population</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Volume</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Over-Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Sort based on selected tab
                      const sortedHotspots = [...report.geographicHotspots];
                      if (geoTab === 'indexing') {
                        // Sort by overIndex (highest first)
                        sortedHotspots.sort((a, b) => (b.overIndex || 0) - (a.overIndex || 0));
                      } else {
                        // Sort by population (highest first)
                        sortedHotspots.sort((a, b) => (b.population || 0) - (a.population || 0));
                      }
                      
                      return sortedHotspots.slice(0, 10).map((hotspot, index) => {
                        // Reduced logging - only log first few rows
                        if (index < 3) {
                          console.log(`📋 [DEBUG] Table row ${index + 1}:`, hotspot);
                        }
                        return (
                          <tr key={hotspot.zipCode} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{index + 1}</td>
                        <td className="py-3 px-2 font-mono text-sm">{hotspot.zipCode}</td>
                        <td className="py-3 px-2">{hotspot.city}, {hotspot.state}</td>
                        <td className="py-3 px-2 text-gray-600">
                          {hotspot.population ? hotspot.population.toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.min(100, (hotspot.density / Math.max(...report.geographicHotspots.map(h => h.density))) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-600 text-xs">{hotspot.density.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {hotspot.overIndex !== undefined ? (
                            <div className="flex items-center gap-1">
                              <span className={`font-semibold ${
                                hotspot.overIndex > 300 ? 'text-green-600' :
                                hotspot.overIndex > 150 ? 'text-blue-600' :
                                'text-gray-600'
                              }`}>
                                {hotspot.overIndex.toFixed(0)}%
                              </span>
                              {hotspot.overIndex > 300 && <span className="text-xs">⭐⭐⭐</span>}
                              {hotspot.overIndex > 150 && hotspot.overIndex <= 300 && <span className="text-xs">⭐⭐</span>}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">N/A</span>
                          )}
                        </td>
                      </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
                
                {/* Legend */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-700">
                  <strong>Over-Index Score:</strong> Measures audience concentration relative to population.
                  <span className="ml-2">⭐⭐⭐ = 300%+ (Passion Market)</span>
                  <span className="ml-2">⭐⭐ = 150-300% (High Affinity)</span>
                  <span className="ml-2">100-150% = Above Average</span>
                </div>
              </div>
            </section>

            {/* C. Demographic Deep Dive */}
            <section className="card p-6">
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-brand-gold" />
                Demographic Deep Dive
              </h2>
              
              {/* Income Distribution Chart */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Household Income Distribution</h3>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={report.demographics.incomeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="bracket" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                      />
                      <Legend />
                      <Bar dataKey="percentage" name="This Segment" fill="#f97316" />
                      <Bar dataKey="nationalAvg" name="US National Avg" fill="#94a3b8" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Comparison shows how this segment's income distribution differs from the US population
                  </p>
                </div>
              </div>

              {/* Education & Age Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Education Pie Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Education Levels</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={report.demographics.educationLevels}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ level, percentage }: any) => `${level}: ${Math.round(Number(percentage))}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                        >
                          {report.demographics.educationLevels.map((entry, index) => {
                            const colors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Age Distribution Bar Chart */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Age Distribution</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={report.demographics.ageDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="bracket" tick={{ fontSize: 12 }} />
                        <YAxis label={{ value: '%', angle: 0, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          formatter={(value: number) => `${value.toFixed(1)}%`}
                        />
                        <Bar dataKey="percentage" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>

            {/* D. Lifestyle & Work Patterns */}
            {report.demographics.lifestyle && (
              <section className="card p-6">
                <h2 className="text-2xl font-bold text-brand-charcoal mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-brand-gold" />
                  Lifestyle & Work Patterns
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Key lifestyle indicators that inform marketing strategy and messaging
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Self-Employed */}
                  <div className="bg-white rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Entrepreneurship</h3>
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {report.demographics.lifestyle.selfEmployed.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {report.demographics.lifestyle.selfEmployed > 12 
                        ? 'High entrepreneurship - B2B cross-sell opportunities, flexible schedules'
                        : 'Traditional employment patterns'
                      }
                    </p>
                  </div>

                  {/* Marriage Status */}
                  <div className="bg-white rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Marriage Rate</h3>
                      <span className="text-2xl">💍</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {report.demographics.lifestyle.married.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {report.demographics.lifestyle.married > 50 
                        ? 'Joint purchasing decisions, family-focused messaging'
                        : 'Singles-oriented products and messaging'
                      }
                    </p>
                  </div>

                  {/* Dual Income */}
                  <div className="bg-white rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Dual Income</h3>
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {report.demographics.lifestyle.dualIncome.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {report.demographics.lifestyle.dualIncome > 60 
                        ? 'Premium buyers, time-constrained, convenience-focused'
                        : 'Single-income households, value-conscious'
                      }
                    </p>
                  </div>

                  {/* Commute Time */}
                  <div className="bg-white rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Avg Commute</h3>
                      <span className="text-2xl">🚗</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {report.demographics.lifestyle.avgCommuteTime.toFixed(0)} min
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {report.demographics.lifestyle.avgCommuteTime > 30 
                        ? 'Long commutes - target drive times, car audio, podcasts'
                        : 'Moderate commute patterns'
                      }
                    </p>
                  </div>

                  {/* Charitable Giving */}
                  <div className="bg-white rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Charitable Giving</h3>
                      <span className="text-2xl">❤️</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {report.demographics.lifestyle.charitableGivers.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {report.demographics.lifestyle.charitableGivers > 40 
                        ? 'Values-driven, ethical brands, sustainability messaging'
                        : 'Standard charitable patterns'
                      }
                    </p>
                  </div>

                  {/* STEM Education */}
                  <div className="bg-white rounded-xl p-4 border border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">STEM Education</h3>
                      <span className="text-2xl">🔬</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {report.demographics.lifestyle.stemDegree.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {report.demographics.lifestyle.stemDegree > 15 
                        ? 'Tech-savvy, early adopters, technical details welcome'
                        : 'Avoid technical jargon, focus on benefits'
                      }
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* E. Cross Purchase Insights */}
            <section className="card p-6">
              <h2 className="text-2xl font-bold text-brand-charcoal mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-brand-gold" />
                Cross Purchase Insights
              </h2>
              
              <p className="text-gray-600 mb-6">
                Top overlapping Commerce Audience segments showing cross-purchase patterns
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {report.behavioralOverlap.map((overlap, index) => (
                  <div key={index} className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                      <h4 className="font-semibold text-gray-900 text-lg">{overlap.segment}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-orange font-bold text-xl">{Math.round(overlap.overlapPercentage)}%</span>
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm text-gray-700 leading-relaxed break-words hyphens-auto mb-3">{overlap.insight}</p>
                      {overlap.topMarkets && overlap.topMarkets.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-orange-200">
                          <p className="text-xs text-gray-600 font-medium mb-2">Top Markets:</p>
                          <div className="space-y-1">
                            {overlap.topMarkets.map((market, index) => (
                              <div key={index} className="flex items-center justify-between text-xs">
                                <div className="flex flex-col">
                                  <span className="text-gray-700 font-medium">
                                    {market.city}, {market.state}
                                  </span>
                                </div>
                                {market.overIndex && market.overIndex > 1 && (
                                  <span className="text-green-600 font-semibold">
                                    {market.overIndex.toFixed(1)}x
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* F. Strategic Marketing Insights */}
            <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm border border-purple-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-orange" />
                Strategic Marketing Insights
                {strategicContentGenerated && !loadingStrategicContent && !strategicContentError && report?.strategicInsights?.messagingRecommendations && report.strategicInsights.messagingRecommendations.length > 0 && (
                  <span className="text-sm font-normal text-purple-600 ml-2">Powered by Gemini 2.5 Flash</span>
                )}
              </h2>
              
              {/* Show states in priority order: Loading > Error > Content > Initial Button */}
              
              {/* Loading State - Highest Priority */}
              {loadingStrategicContent && (
                <LoadingState
                  message="Generating Strategic Marketing Insights"
                  subtitle="Creating AI-powered messaging recommendations and channel strategies..."
                  showElapsedTime={true}
                  estimatedTimeRemaining={45}
                  showProgressBar={false}
                  size="md"
                />
              )}
              
              {/* Error State - Show if error exists and not loading */}
              {!loadingStrategicContent && strategicContentError && strategicContentGenerated && (
                <ErrorDisplay
                  error={strategicContentError}
                  title="Failed to Generate Strategic Insights"
                  showRetry={true}
                  onRetry={handleGenerateStrategicInsights}
                  showDetails={process.env.NODE_ENV === 'development'}
                  type="error"
                  size="md"
                />
              )}
              
              {/* Content State: Show Strategic Insights - Only if generated successfully via button click */}
              {!loadingStrategicContent && !strategicContentError && strategicContentGenerated && report?.strategicInsights?.messagingRecommendations && Array.isArray(report.strategicInsights.messagingRecommendations) && report.strategicInsights.messagingRecommendations.length > 0 && (
                <>
              {/* Messaging Recommendations */}
              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Messaging Recommendations</h3>
                <div className="space-y-4">
                  {report.strategicInsights?.messagingRecommendations && report.strategicInsights.messagingRecommendations.length > 0 ? (
                    report.strategicInsights.messagingRecommendations.map((msg, index) => {
                    if (typeof msg === 'string') {
                      return (
                        <div
                          key={index}
                          className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                        >
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {renderMarkdown(msg)}
                          </p>
                        </div>
                      );
                    }

                    // Handle JSON object format
                    const msgObj = msg as any;
                    return (
                      <div
                        key={index}
                        className="bg-white border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                      >
                        {/* Value Proposition */}
                        {msgObj.valueProposition && (
                          <div className="mb-3">
                            <h4 className="font-semibold text-purple-900 text-base mb-1">Value Proposition</h4>
                            <p className="text-gray-800 leading-relaxed">{renderMarkdown(msgObj.valueProposition)}</p>
                          </div>
                        )}

                        {/* Data Backing */}
                        {msgObj.dataBacking && (
                          <div className="mb-3">
                            <h4 className="font-semibold text-blue-900 text-sm mb-1">📊 Data Insights</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{renderMarkdown(msgObj.dataBacking)}</p>
                          </div>
                        )}

                        {/* Emotional Benefits */}
                        {msgObj.emotionalBenefit && (
                          <div className="mb-2">
                            <h4 className="font-semibold text-green-900 text-sm mb-1">💡 Emotional Benefits</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{renderMarkdown(msgObj.emotionalBenefit)}</p>
                          </div>
                        )}

                        {/* Campaign Ready Indicator */}
                        {msgObj.campaignReady !== undefined && (
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              msgObj.campaignReady 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {msgObj.campaignReady ? '✅ Campaign Ready' : '⏳ In Development'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">No messaging recommendations are available for this segment.</p>
                    </div>
                  )}
                </div>
              </div>
              </>
              )}
              
              {/* Initial State: Show CTA Button - Only show if strategic content hasn't been generated yet */}
              {!loadingStrategicContent && !strategicContentGenerated && !strategicContentError && (
                <div className="bg-white rounded-lg p-12 text-center border-2 border-dashed border-purple-200">
                  <Sparkles className="w-16 h-16 text-brand-orange mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Strategic Insights</h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Get AI-generated messaging recommendations, channel strategies, and creative guidance tailored to your audience segment. 
                    These insights are powered by advanced AI analysis of your audience demographics, behavioral patterns, and market data.
                  </p>
                  <button
                    onClick={() => {
                      console.log('🔘 Button clicked - handleGenerateStrategicInsights');
                      handleGenerateStrategicInsights();
                    }}
                    disabled={!report || loadingStrategicContent}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Strategic Marketing Insights
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    Powered by Gemini 2.5 Flash • Takes 30-60 seconds
                  </p>
                </div>
              )}
            </section>

            {/* Recommended Deal Cards */}
            {report && (
              <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-brand-orange" />
                  Recommended Deals for {report.segment}
                </h2>
                
                {recommendedDeals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedDeals.map((deal, index) => {
                      const isCommerceAudience = (deal.dealName || '').toLowerCase().includes('purchase intender');
                      const dealId = deal.dealId || deal.id;
                      const inCart = isInCart(dealId);
                      
                      return (
                        <div
                          key={deal.id || index}
                          className={`card p-4 cursor-pointer hover:shadow-lg transition-all duration-200 group border relative ${
                            isCommerceAudience 
                              ? 'border-l-4 border-brand-gold bg-gradient-to-r from-brand-gold/5 to-transparent' 
                              : 'border-gray-200 hover:border-brand-orange'
                          }`}
                        >
                          {/* Cart Icon - Top Right */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (inCart) {
                                handleRemoveFromCart(dealId);
                              } else {
                                handleAddToCart(deal);
                              }
                            }}
                            className={`absolute top-3 right-3 p-2 rounded-lg transition-colors border z-10 ${
                              inCart
                                ? 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'
                                : 'text-brand-gold hover:text-brand-orange hover:bg-brand-gold/10 border-gray-200 bg-white'
                            }`}
                            title={inCart ? 'Remove from cart' : 'Add to cart'}
                          >
                            {inCart ? (
                              <Trash2 className="w-4 h-4" />
                            ) : (
                              <ShoppingCart className="w-4 h-4" />
                            )}
                          </button>

                          {/* Deal Card Content - Clickable */}
                          <div onClick={() => handleDealClick(deal)}>
                            {/* Deal Header */}
                            <div className="flex items-start justify-between mb-3 pr-10">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 group-hover:text-brand-orange transition-colors text-sm leading-tight mb-1">
                                  {deal.dealName}
                                </h4>
                                {isCommerceAudience && (
                                  <span className="text-sm text-brand-gold">🛍️ Commerce Audience</span>
                                )}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
                              {deal.description}
                            </p>

                            {/* Deal Details */}
                            <div className="space-y-2 text-xs text-gray-500">
                              {deal.environment && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Environment:</span>
                                  <span>{deal.environment}</span>
                                </div>
                              )}
                              {deal.mediaType && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Media:</span>
                                  <span>{deal.mediaType}</span>
                                </div>
                              )}
                              {deal.flightDate && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Flight:</span>
                                  <span>{deal.flightDate}</span>
                                </div>
                              )}
                            </div>

                            {/* Target Audience */}
                            {deal.targeting && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="text-xs">
                                  <span className="font-medium text-gray-700">Targeting:</span>
                                  <p className="text-gray-600 leading-relaxed">{deal.targeting}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No recommended deals found for this audience segment.</p>
                    <button
                      onClick={() => {
                        const dealPrompt = `Find relevant deals for the ${report.segment} audience segment in ${report.category}`;
                        router.push(`/?prompt=${encodeURIComponent(dealPrompt)}`);
                      }}
                      className="mt-3 text-brand-orange hover:text-brand-coral text-sm font-medium transition-colors"
                    >
                      Search for more deals →
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Export and Action Buttons */}
            <div className="flex justify-center gap-4">
              <button 
                data-pdf-export
                onClick={exportToPDF}
                className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Export Report (PDF)
              </button>
              
              <button
                onClick={() => {
                  // Navigate to main chat with pre-populated prompt
                  const dealPrompt = `Find relevant deals for the ${report.segment} audience segment in ${report.category}`;
                  router.push(`/?prompt=${encodeURIComponent(dealPrompt)}`);
                }}
                className="btn-secondary flex items-center gap-2 px-6 py-3 bg-brand-orange text-white hover:bg-brand-coral transition-colors"
              >
                <Target className="w-5 h-5" />
                Find Relevant Deals
              </button>
              
              <button 
                onClick={() => {
                  const content = `
${report.personaEmoji} ${report.personaName}
Category: ${report.category}
Segment: ${report.segment}

WHO THEY ARE:
${report.strategicInsights.targetPersona.replace(/\*\*/g, '')}

KEY METRICS:
• Income: ${formatCurrency(report.keyMetrics.medianHHI)} (${formatPercentage(report.keyMetrics.medianHHIvsNational)} vs US National)
• Age: ${report.keyMetrics.topAgeBracket}
• Education: ${(report.keyMetrics.educationLevel ?? 0).toFixed(1)}% Bachelor's+ (${formatPercentage(report.keyMetrics.educationVsNational)} vs US National)
• Top Market: ${report.geographicHotspots[0]?.city}, ${report.geographicHotspots[0]?.state}

CREATIVE HOOKS:
${report.strategicInsights.messagingRecommendations.slice(0, 3).map((m: any, i: number) => {
  if (typeof m === 'string') {
    return `${i + 1}. ${m.replace(/\*\*/g, '')}`;
  } else if (typeof m === 'object' && m !== null) {
    return `${i + 1}. ${(m.valueProposition || '').replace(/\*\*/g, '')}`;
  }
  return `${i + 1}. (No data)`;
}).join('\n')}

Generated: ${new Date().toLocaleString()}
                  `.trim();
                  
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${report.segment.replace(/[^a-zA-Z0-9]/g, '_')}_Persona.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="btn-secondary flex items-center gap-2 px-6 py-3"
              >
                <Download className="w-5 h-5" />
                Export Persona (TXT)
              </button>
            </div>

          </div>
        )}

        {/* Loading State */}
        {loading && !report && (
          <LoadingState
            message="Generating Audience Insights Report"
            subtitle="Analyzing demographics, geographic hotspots, and behavioral patterns..."
            showElapsedTime={true}
            estimatedTimeRemaining={90}
            showProgressBar={true}
            progress={undefined}
            size="lg"
          />
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorDisplay
            error={error}
            title="Failed to Generate Report"
            showRetry={true}
            onRetry={handleGenerateReport}
            showDetails={process.env.NODE_ENV === 'development'}
            type="error"
            size="md"
            fallbackLabel="Try Different Segment"
            onFallback={() => {
              setError('');
              setSelectedSegment('');
            }}
          />
        )}

        {/* Empty State */}
        {!report && !loading && !error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Sparkles className="w-16 h-16 text-brand-orange mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Select an audience segment to get started
            </h3>
            <p className="text-gray-600">
              Choose a product category and commerce audience segment above to generate comprehensive insights
            </p>
          </div>
        )}
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          isOpen={isDealModalOpen}
          onClose={handleCloseDealModal}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          isInCart={isInCart}
        />
      )}
    </div>
  );
}

