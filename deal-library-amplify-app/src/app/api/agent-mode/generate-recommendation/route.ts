import { NextRequest } from 'next/server';
import { getDealsController } from '@/lib/controllers/dealsControllerWrapper';
import { ProgressUpdate } from '@/types/agentMode';

export async function POST(request: NextRequest) {
  console.log('📥 Campaign Planner API route called');
  try {
    // Parse request body with error handling
    let body;
    try {
      console.log('📥 Parsing request body...');
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : 'Invalid request body';
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          message: 'The request body must be valid JSON.',
          details: errorMessage
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { rawBrief, formData } = body;
    console.log('✅ Request body parsed:', { 
      hasRawBrief: !!rawBrief, 
      hasFormData: !!formData,
      formDataKeys: formData ? Object.keys(formData) : []
    });

    // Validate input
    if (!rawBrief && !formData) {
      return new Response(
        JSON.stringify({ error: 'Brief or form data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (rawBrief && (typeof rawBrief !== 'string' || rawBrief.trim().length === 0)) {
      return new Response(
        JSON.stringify({ error: 'Invalid brief format', message: 'Brief must be a non-empty string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (formData) {
      if (typeof formData !== 'object' || formData === null || Array.isArray(formData)) {
        return new Response(
          JSON.stringify({ error: 'Invalid form data format', message: 'Form data must be an object' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (!formData.targetAudiences || !Array.isArray(formData.targetAudiences) || formData.targetAudiences.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Target audiences are required', message: 'Target audiences must be a non-empty array' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    let controller: ReturnType<typeof getDealsController>;
    try {
      console.log('🔧 Getting DealsController...');
      controller = getDealsController();
      console.log('✅ DealsController obtained');
    } catch (error) {
      console.error('❌ Failed to get DealsController:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('❌ DealsController error details:', { errorMessage, errorStack: errorStack?.substring(0, 500) });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to initialize controller',
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? errorStack?.substring(0, 1000) : undefined
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
    let streamCreationError: Error | null = null;
    let stream: ReadableStream<Uint8Array>;
    
    try {
      stream = new ReadableStream({
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
            // Verify the method exists before calling it
            if (typeof controller.generateAgentModeRecommendationWithProgress !== 'function') {
              throw new Error('generateAgentModeRecommendationWithProgress is not a function on the controller');
            }

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
            console.log('📋 Form data:', JSON.stringify(formData, null, 2));
            console.log('📋 Controller type:', controller.constructor.name);
            console.log('📋 Has generateAgentModeRecommendationWithProgress:', typeof controller.generateAgentModeRecommendationWithProgress);
            
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
    } catch (error) {
      console.error('❌ Error creating ReadableStream:', error);
      streamCreationError = error instanceof Error ? error : new Error(String(error));
    }

    // If stream creation failed, return error response immediately
    if (streamCreationError || !stream) {
      console.error('❌ Stream creation failed, returning error response');
      const errorMessage = streamCreationError?.message || 'Failed to create response stream';
      const errorStack = streamCreationError?.stack;
      console.error('❌ Stream creation error details:', { errorMessage, errorStack: errorStack?.substring(0, 1000) });
      
      const errorResponse = {
        error: 'Failed to initialize response stream',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack?.substring(0, 2000) : undefined
      };
      
      console.error('❌ Returning error response:', JSON.stringify(errorResponse, null, 2));
      
      return new Response(
        JSON.stringify(errorResponse),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(errorResponse).length.toString()
          } 
        }
      );
    }

    // Return streaming response with SSE headers
    console.log('✅ Stream created successfully, returning SSE response');
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('❌ ===== TOP-LEVEL ERROR in API route =====');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate agent recommendation',
        message: errorMessage,
        errorName: errorName,
        details: process.env.NODE_ENV === 'development' ? errorStack?.substring(0, 2000) : undefined,
        hint: errorMessage.includes('GEMINI_API_KEY') 
          ? 'The GEMINI_API_KEY environment variable may not be set. Please configure it in your environment variables.'
          : errorMessage.includes('not available') || errorMessage.includes('not configured')
          ? 'The AI service may not be properly configured. Please check your environment variables.'
          : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
