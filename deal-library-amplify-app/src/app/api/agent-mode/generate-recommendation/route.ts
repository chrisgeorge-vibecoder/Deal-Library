import { NextRequest } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';
import { ProgressUpdate } from '@/types/agentMode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawBrief, formData } = body;

    // Validate input
    if (!rawBrief && !formData) {
      return new Response(
        JSON.stringify({ error: 'Brief or form data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (rawBrief && (typeof rawBrief !== 'string' || rawBrief.trim().length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Invalid brief format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (formData && !formData.targetAudiences) {
      return new Response(
        JSON.stringify({ error: 'Target audiences are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let controller: ReturnType<typeof getDealsController>;
    try {
      controller = getDealsController();
    } catch (error) {
      console.error('❌ Failed to get DealsController:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to initialize controller',
          message: errorMessage
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if agent mode service is available
    try {
      if (!controller.hasAgentModeService()) {
        return new Response(
          JSON.stringify({ error: 'Agent Mode not available - AI service not configured' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error('❌ Error checking agent mode service:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check agent mode service availability',
          message: errorMessage
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify controller has agent mode service before creating stream
    // This prevents stream creation if service is unavailable
    // Note: We already checked this above, but double-check here for safety
    if (!controller.hasAgentModeService()) {
      console.error('❌ Agent Mode service not available (double-check failed)');
      return new Response(
        JSON.stringify({ 
          error: 'Agent Mode not available',
          message: 'AI service is not configured. Please ensure GEMINI_API_KEY is set.'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a ReadableStream for SSE with comprehensive error handling
    const stream = new ReadableStream({
      async start(streamController) {
        const encoder = new TextEncoder();
        let heartbeatInterval: NodeJS.Timeout | null = null;
        
        // Helper to send SSE data with error handling
        const sendSSE = (data: any) => {
          try {
            const json = JSON.stringify(data);
            streamController.enqueue(encoder.encode(`data: ${json}\n\n`));
          } catch (err) {
            console.error('❌ Error sending SSE data:', err);
            // Try to send error via SSE
            try {
              const errorJson = JSON.stringify({
                type: 'error',
                message: 'Failed to send progress update',
                details: err instanceof Error ? err.message : String(err)
              });
              streamController.enqueue(encoder.encode(`data: ${errorJson}\n\n`));
            } catch {
              // If we can't even send error, just log it
            }
          }
        };

        // Helper to send SSE comment (heartbeat)
        const sendHeartbeat = () => {
          try {
            streamController.enqueue(encoder.encode(':keepalive\n\n'));
          } catch (err) {
            // Silently fail for heartbeat - not critical
            console.warn('⚠️ Heartbeat send failed:', err);
          }
        };

        try {
          // Send initial progress
          sendSSE({
            type: 'progress',
            step: 1,
            totalSteps: 10,
            stepName: 'Initializing',
            status: 'in_progress',
            message: 'Starting campaign analysis...',
            timestamp: new Date(),
            percentComplete: 0
          } as ProgressUpdate);

          // Start heartbeat interval
          heartbeatInterval = setInterval(() => {
            sendHeartbeat();
          }, 10000);

          // Generate the recommendation with progress callback
          console.log('🚀 Starting agent mode recommendation generation...');
          const report = await controller.generateAgentModeRecommendationWithProgress(
            { rawBrief, formData },
            (update: ProgressUpdate) => {
              sendSSE(update);
            }
          );

          // Clear heartbeat
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }

          // Send final complete event
          sendSSE({
            type: 'complete',
            report: report
          });

          streamController.close();
        } catch (error) {
          // Clear heartbeat if it exists
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }
          
          console.error('❌ Error in stream start function:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate recommendation';
          const errorStack = error instanceof Error ? error.stack : undefined;
          console.error('❌ Error details:', { 
            errorMessage, 
            errorStack: errorStack?.substring(0, 1000), // Limit stack trace length
            errorName: error instanceof Error ? error.name : typeof error
          });
          
          try {
            sendSSE({
              type: 'error',
              message: errorMessage,
              details: process.env.NODE_ENV === 'development' ? errorStack?.substring(0, 1000) : undefined
            });
          } catch (sseError) {
            console.error('❌ Failed to send error via SSE:', sseError);
            // Try one more time with a simpler error message
            try {
              const simpleError = JSON.stringify({
                type: 'error',
                message: errorMessage
              });
              streamController.enqueue(encoder.encode(`data: ${simpleError}\n\n`));
            } catch {
              console.error('❌ Completely failed to send error to client');
            }
          }
          
          try {
            streamController.close();
          } catch (closeError) {
            console.error('❌ Error closing stream:', closeError);
          }
        }
      },
      cancel() {
        console.log('⚠️ Stream was cancelled by client');
      }
    });

    // Return streaming response with SSE headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Error in API route:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate agent recommendation',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
