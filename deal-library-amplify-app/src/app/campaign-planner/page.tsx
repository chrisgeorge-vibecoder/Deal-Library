'use client';

import { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import CampaignPlannerFormV2, { CampaignPlannerFormData } from '@/components/CampaignPlannerFormV2';
import CampaignPlannerResults from '@/components/CampaignPlannerResults';
import { ComprehensiveReport } from '@/types/agentMode';
import { useCart, useSaveCard } from '@/components/AppLayout';

export default function CampaignPlannerPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<ComprehensiveReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get cart context for adding deals
  const { onAddToCart, onRemoveFromCart, isInCart } = useCart();
  
  // Get save card context for saving SWOT and Competitive cards
  const { onSaveCard, onUnsaveCard, isSaved } = useSaveCard();

  const handleFormSubmit = async (formData: any) => {
    console.log('🚀 Campaign Planner: Starting generation with form data:', formData);
    
    // Prevent duplicate submissions
    if (isGenerating) {
      console.warn('⚠️ Generation already in progress, ignoring duplicate submission');
      return;
    }
    
    setIsGenerating(true);
    setReport(null);
    setError(null);

    try {
      // Extract data from either new or old form format
      const selectedAudiences = formData.selectedAudiences || formData.targetAudiences || [];
      const campaignObjective = formData.campaignObjective || formData.campaignObjectives?.[0] || 'full-funnel';
      
      const response = await fetch('/api/campaign-planner/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advertiserName: formData.advertiserName,
          selectedAudiences,
          campaignObjective,
          budgetRange: formData.budgetRange,
          geographicFocus: formData.geographicFocus
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status} error`);
      }

      const result = await response.json();
      
      if (result.success && result.report) {
        console.log('✅ Campaign proposal generated successfully');
        setReport(result.report);
      } else {
        throw new Error(result.error || 'Failed to generate proposal');
      }
    } catch (error) {
      console.error('❌ Campaign generation error:', error);
      
      let errorMessage = 'Failed to generate campaign proposal';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartNew = () => {
    setReport(null);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="border-b border-neutral-200 bg-white px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Campaign Planner
            </h1>
            <p className="text-neutral-600 mt-2">
              Generate comprehensive marketing recommendations with AI-powered insights
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-8">
        {!report && !isGenerating && (
          <CampaignPlannerFormV2
            onSubmit={handleFormSubmit}
            disabled={isGenerating}
          />
        )}

        {isGenerating && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Building Your Campaign Proposal</h3>
              <p className="text-gray-600">Assembling insights from pre-enriched audience data and matching deals...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-red-900 font-semibold mb-2">Error Generating Campaign</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={handleStartNew}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {report && (
          <>
            <CampaignPlannerResults 
              report={report} 
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              isInCart={isInCart}
              onSaveCard={onSaveCard}
              onUnsaveCard={onUnsaveCard}
              isSaved={isSaved}
            />
          </>
        )}
      </div>
    </div>
  );
}

