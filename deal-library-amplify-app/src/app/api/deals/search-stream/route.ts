import { NextRequest } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';
import { GeminiService } from '@/lib/services/geminiService';

// Streaming search endpoint using Server-Sent Events (SSE)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, conversationHistory, forceDeals } = body;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get deals controller and Gemini service
    const controller = getDealsController();
    const geminiService = new GeminiService();
    
    // Get all deals
    let allDeals: any[] = [];
    try {
      allDeals = await controller.getAllDeals();
    } catch (error) {
      console.error('Error getting deals:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to load deals' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Pre-filter deals (same logic as non-streaming)
    const MAX_DEALS_FOR_GEMINI = 50;
    let dealsForGemini = allDeals;
    
    if (allDeals.length > MAX_DEALS_FOR_GEMINI) {
      const queryLower = query.toLowerCase();
      const genericWords = new Set(['show', 'me', 'deals', 'for', 'the', 'and', 'with', 'find', 'get', 'looking', 'want', 'need']);
      const importantKeywords = queryLower
        .split(/\s+/)
        .filter(word => word.length > 2 && !genericWords.has(word));
      
      const scoredDeals = allDeals.map((deal: any) => {
        const dealText = `${deal.dealName} ${deal.description} ${deal.targeting}`.toLowerCase();
        let score = 0;
        
        for (const keyword of importantKeywords) {
          if (deal.dealName?.toLowerCase().includes(keyword)) score += 10;
          if (deal.description?.toLowerCase().includes(keyword)) score += 3;
          if (deal.targeting?.toLowerCase().includes(keyword)) score += 2;
        }
        
        return { deal, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_DEALS_FOR_GEMINI)
      .map(item => item.deal);
      
      dealsForGemini = scoredDeals;
    }

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Stream the AI response
          let fullText = '';
          const streamGenerator = geminiService.analyzeQueryStream(
            query.trim(),
            dealsForGemini,
            conversationHistory
          );
          
          // Stream text chunks
          for await (const chunk of streamGenerator) {
            if (typeof chunk === 'string') {
              fullText += chunk;
              // Send chunk as SSE event
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`)
              );
            } else {
              // Final result received (GeminiSearchResult object)
              const finalResult = chunk;
              
              // Send final result
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'complete', result: finalResult })}\n\n`)
              );
              
              controller.close();
              return;
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`)
          );
          controller.close();
        }
      }
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('Streaming route error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to start streaming' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

