'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import CampaignPlannerForm from '@/components/CampaignPlannerForm';
import CampaignPlannerResults from '@/components/CampaignPlannerResults';
import AgentProgressTracker from '@/components/AgentProgressTracker';
import { ProgressUpdate, ComprehensiveReport } from '@/types/agentMode';
import { useCart, useSaveCard } from '@/components/AppLayout';
import { Deal } from '@/types/deal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function CampaignPlannerPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
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
    setProgress(null);
    setReport(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-mode/generate-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let lastEventTime = Date.now();
      const TIMEOUT_MS = 180000; // 3 minute timeout

      while (true) {
        // Check for timeout (no events received for 3 minutes)
        if (Date.now() - lastEventTime > TIMEOUT_MS) {
          console.warn('⚠️ SSE timeout - no events for 3 minutes');
          throw new Error('Connection timeout - no response from server');
        }

        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ SSE stream ended (done=true)');
          break;
        }

        if (!value || value.length === 0) {
          console.log('⚠️ Empty chunk received, continuing...');
          continue;
        }

        lastEventTime = Date.now(); // Reset timeout on each chunk received
        const chunk = decoder.decode(value, { stream: true });
        console.log(`📦 Received chunk (${chunk.length} bytes)`);
        
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue; // Skip empty lines
          
          // Handle SSE comments (heartbeat keepalives)
          if (line.startsWith(':')) {
            console.log('💓 Heartbeat received');
            continue;
          }
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const update = JSON.parse(data);
              console.log('📨 SSE Event:', update.type, update.step || '', update.status || '');
              
              if (update.type === 'progress') {
                setProgress(update);
              } else if (update.type === 'complete') {
                console.log('🎉 Complete event received!', update.report);
                setReport(update.report);
                setProgress(null);
              } else if (update.type === 'error') {
                throw new Error(update.message || 'Generation failed');
              }
            } catch (parseError) {
              console.error('❌ Error parsing SSE data:', parseError, 'Data:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Campaign generation error:', error);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to generate campaign';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('ERR_CONNECTION_REFUSED') || error.message.includes('NetworkError')) {
          errorMessage = 'Unable to connect to the backend server. Please ensure the backend is running on port 3002.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. The server may be taking longer than expected. Please try again.';
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = String(error);
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartNew = () => {
    setReport(null);
    setProgress(null);
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
          <CampaignPlannerForm
            onSubmit={handleFormSubmit}
            disabled={isGenerating}
          />
        )}

        {isGenerating && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {progress ? (
              <AgentProgressTracker progress={progress} />
            ) : (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Initializing Campaign Generation</h3>
                <p className="text-gray-600">Setting up AI analysis and preparing your comprehensive marketing recommendation...</p>
              </div>
            )}
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

