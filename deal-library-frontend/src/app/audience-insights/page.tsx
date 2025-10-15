'use client';

import { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, Users, MapPin, BarChart3, Download, Sparkles, Bookmark, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dynamic from 'next/dynamic';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';

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
  // NEW: Recommended deals
  const [geoTab, setGeoTab] = useState<'populous' | 'indexing'>('populous');  // NEW: Geographic hotspots tab
  const reportRef = useRef<HTMLDivElement>(null);  // Ref for PDF export

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

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);


  const [isPersonaSaved, setIsPersonaSaved] = useState(false);
  
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

  // Helper functions for formatting
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
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
        const response = await fetch('http://localhost:3002/api/audience-geo-analysis/segments');
        const data = await response.json();
        
        if (data.success) {
          // Only show segments that exist in BOTH our mapping AND the backend data
          const availableSegments = exactSegments.filter(seg => 
            data.segments.includes(seg)
          );
          
          // Sort alphabetically
          const sortedSegments = availableSegments.sort((a: string, b: string) => a.localeCompare(b));
          setSegments(sortedSegments);
          
          console.log(`📊 Mapped ${sortedSegments.length} exact segments for category: ${category}`);
          console.log(`   Segments: ${sortedSegments.join(', ')}`);
        }
      } else {
        console.warn(`⚠️ No segment mapping found for category: ${category}`);
        setSegments([]);
      }
    } catch (error) {
      console.error('Error loading segments:', error);
      setError('Failed to load segments');
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

    try {
      console.log('🔍 [DEBUG] Generating report for:', { selectedCategory, selectedSegment });
      
      const response = await fetch('http://localhost:3002/api/audience-insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segment: selectedSegment,
          category: selectedCategory,
          includeCommercialZips  // NEW: Pass filter preference to backend
        }),
      });

      console.log('📡 [DEBUG] API Response status:', response.status);
      const data = await response.json();
      console.log('📦 [DEBUG] Full API Response:', JSON.stringify(data, null, 2));

      if (data.success) {
        console.log('✅ [DEBUG] Report received successfully');
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
        
        setReport(data.report);
        console.log(`✅ [DEBUG] Report generated successfully`);
      } else {
        console.error('❌ [DEBUG] Report generation failed:', data);
        setError(data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="pt-6 pb-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-brand-orange" />
                Commerce Audience Insights
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
                    description: report.strategicInsights.targetPersona,
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
                title={isPersonaSaved ? "Saved to Intelligence Cards" : "Save to Intelligence Cards"}
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
                    {report.strategicInsights.targetPersona}
                  </p>
                  
                  
                  {/* Creative Hooks */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">💡 Creative Hooks:</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.strategicInsights.messagingRecommendations.slice(0, 3).map((msg: any, index: number) => {
                        const cleanMsg = typeof msg === 'string' ? msg.replace(/\*\*/g, '').split(':')[0].substring(0, 80) : String(msg).substring(0, 80);
                        return (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-white border border-purple-300 text-purple-800 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
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

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-700 font-medium mb-1">Median Household Income</div>
                  <div className="text-2xl font-bold text-blue-900">{formatCurrency(report.keyMetrics.medianHHI)}</div>
                  <div className="flex flex-col gap-0.5 mt-2 text-xs">
                    <div className={`${report.keyMetrics.medianHHIvsCommerce >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                      {formatPercentage(report.keyMetrics.medianHHIvsCommerce)} vs Online Shoppers ⭐
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      ({formatPercentage(report.keyMetrics.medianHHIvsNational)} vs US National)
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-700 font-medium mb-1">Top Age Bracket</div>
                  <div className="text-2xl font-bold text-purple-900">{report.keyMetrics.topAgeBracket}</div>
                  <div className="text-sm text-purple-600 mt-1">Most concentrated</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-700 font-medium mb-1">Education Level</div>
                  <div className="text-2xl font-bold text-green-900">{report.keyMetrics.educationLevel.toFixed(1)}%</div>
                  <div className="flex flex-col gap-0.5 mt-2 text-xs">
                    <div className={`${report.keyMetrics.educationVsCommerce >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                      {formatPercentage(report.keyMetrics.educationVsCommerce)} vs Online Shoppers ⭐
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      ({formatPercentage(report.keyMetrics.educationVsNational)} vs US National)
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-700 font-medium mb-1">Commerce Segment</div>
                  <div className="text-lg font-bold text-orange-900">{report.segment}</div>
                  <div className="text-sm text-orange-600 mt-1">{report.category}</div>
                </div>
              </div>

              {/* Additional Census Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Home Value */}
                {report.demographics.medianHomeValue && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                    <div className="text-sm text-indigo-700 font-medium mb-1">Median Home Value</div>
                    <div className="text-xl font-bold text-indigo-900">${Math.round(report.demographics.medianHomeValue).toLocaleString()}</div>
                    <div className="text-xs text-indigo-600 mt-1">
                      {report.demographics.homeOwnership?.toFixed(0) || 0}% homeowners
                    </div>
                  </div>
                )}

                {/* Ethnicity */}
                {report.demographics.ethnicity && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border border-teal-200">
                    <div className="text-sm text-teal-700 font-medium mb-1">Primary Ethnicity</div>
                    <div className="text-lg font-bold text-teal-900">
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
                    <div className="text-xs text-teal-600 mt-1">
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
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="text-sm text-amber-700 font-medium mb-1">Location Type</div>
                    <div className="text-lg font-bold text-amber-900 capitalize">
                      {report.demographics.urbanRuralDistribution[0]?.type || 'Mixed'}
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      {report.demographics.urbanRuralDistribution[0]?.percentage?.toFixed(0) || 0}% of population
                    </div>
                  </div>
                )}

                {/* Household Size */}
                {report.demographics.avgHouseholdSize && (
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
                    <div className="text-sm text-emerald-700 font-medium mb-1">Household Size</div>
                    <div className="text-lg font-bold text-emerald-900">{report.demographics.avgHouseholdSize.toFixed(1)}</div>
                    <div className="text-xs text-emerald-600 mt-1">people per household</div>
                  </div>
                )}

                {/* Lifestyle - Marriage */}
                {report.demographics.lifestyle && (
                  <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 rounded-lg border border-violet-200">
                    <div className="text-sm text-violet-700 font-medium mb-1">Marriage Rate</div>
                    <div className="text-lg font-bold text-violet-900">{report.demographics.lifestyle.married.toFixed(0)}%</div>
                    <div className="text-xs text-violet-600 mt-1">
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
                        console.log(`📋 [DEBUG] Table row ${index + 1}:`, hotspot);
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
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Entrepreneurship</h3>
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
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
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Marriage Rate</h3>
                      <span className="text-2xl">💍</span>
                    </div>
                    <div className="text-2xl font-bold text-pink-600 mb-1">
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
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Dual Income</h3>
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
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
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Avg Commute</h3>
                      <span className="text-2xl">🚗</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
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
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Charitable Giving</h3>
                      <span className="text-2xl">❤️</span>
                    </div>
                    <div className="text-2xl font-bold text-teal-600 mb-1">
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
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">STEM Education</h3>
                      <span className="text-2xl">🔬</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600 mb-1">
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
                  <div key={index} className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">{overlap.segment}</h4>
                      <span className="text-brand-orange font-bold text-xl">{Math.round(overlap.overlapPercentage)}%</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{overlap.insight}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* F. Strategic Marketing Insights */}
            <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-sm border border-purple-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-orange" />
                Strategic Marketing Insights
                <span className="text-sm font-normal text-purple-600 ml-2">Powered by Gemini 2.5 Flash</span>
              </h2>
              
              {/* Messaging Recommendations */}
              <div className="bg-white rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Messaging Recommendations</h3>
                <div className="space-y-3">
                  {report.strategicInsights.messagingRecommendations.map((msg, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
                    >
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {typeof msg === 'string' ? renderMarkdown(msg) : JSON.stringify(msg)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Recommendations */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Channel/Media Recommendations</h3>
                <div className="space-y-4">
                  {report.strategicInsights.channelRecommendations.map((channel, index) => {
                    // Handle both string and object formats
                    if (typeof channel === 'string') {
                      return (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-brand-orange mt-1">●</span>
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {renderMarkdown(channel)}
                          </div>
                        </div>
                      );
                    }
                    
                    // Format object with proper structure
                    const channelObj = channel as any;
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-brand-orange transition-colors">
                        <h4 className="font-semibold text-gray-900 mb-3 text-base flex items-center gap-2">
                          <span className="text-brand-orange">▸</span>
                          {channelObj.channel}
                        </h4>
                        <div className="space-y-2 ml-5">
                          {channelObj.where && (
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-gray-700 text-sm min-w-[60px]">Where:</span>
                              <span className="text-sm text-gray-600">{channelObj.where}</span>
                            </div>
                          )}
                          {channelObj.when && (
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-gray-700 text-sm min-w-[60px]">When:</span>
                              <span className="text-sm text-gray-600">{channelObj.when}</span>
                            </div>
                          )}
                          {channelObj.who && (
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-gray-700 text-sm min-w-[60px]">Who:</span>
                              <span className="text-sm text-gray-600">{channelObj.who}</span>
                            </div>
                          )}
                          {channelObj.why && (
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-gray-700 text-sm min-w-[60px]">Why:</span>
                              <span className="text-sm text-gray-600">{channelObj.why}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

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
${report.strategicInsights.targetPersona}

KEY METRICS:
• Income: ${formatCurrency(report.keyMetrics.medianHHI)} (${formatPercentage(report.keyMetrics.medianHHIvsCommerce)} vs online shoppers)
• Age: ${report.keyMetrics.topAgeBracket}
• Education: ${report.keyMetrics.educationLevel.toFixed(1)}% Bachelor's+ (${formatPercentage(report.keyMetrics.educationVsCommerce)} vs online shoppers)
• Top Market: ${report.geographicHotspots[0]?.city}, ${report.geographicHotspots[0]?.state}

CREATIVE HOOKS:
${report.strategicInsights.messagingRecommendations.slice(0, 3).map((m: any, i: number) => `${i + 1}. ${typeof m === 'string' ? m.replace(/\*\*/g, '') : String(m)}`).join('\n')}

MEDIA TARGETING:
${report.strategicInsights.channelRecommendations.slice(0, 3).map((c: any, i: number) => `${i + 1}. ${typeof c === 'string' ? c.replace(/\*\*/g, '') : String(c)}`).join('\n')}

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

        {/* Empty State */}
        {!report && !loading && (
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
    </div>
  );
}

