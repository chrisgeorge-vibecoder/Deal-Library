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

    const controller = getDealsController();
    
    // Check if agent mode service is available
    if (!controller.hasAgentModeService()) {
      return new Response(
        JSON.stringify({ error: 'Agent Mode not available - AI service not configured' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        // Helper to send SSE data
        const sendSSE = (data: any) => {
          const json = JSON.stringify(data);
          controller.enqueue(encoder.encode(`data: ${json}\n\n`));
        };

        // Helper to send SSE comment (heartbeat)
        const sendHeartbeat = () => {
          controller.enqueue(encoder.encode(':keepalive\n\n'));
        };

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
        const heartbeatInterval = setInterval(() => {
          sendHeartbeat();
        }, 10000);

        try {
          // Generate the recommendation with progress callback
          const report = await controller.generateAgentModeRecommendationWithProgress(
            { rawBrief, formData },
            (update: ProgressUpdate) => {
              sendSSE(update);
            }
          );

          // Clear heartbeat
          clearInterval(heartbeatInterval);

          // Send final complete event
          sendSSE({
            type: 'complete',
            report: report
          });

          controller.close();
        } catch (error) {
          clearInterval(heartbeatInterval);
          console.error('Error generating recommendation:', error);
          sendSSE({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to generate recommendation'
          });
          controller.close();
        }
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
    return new Response(
      JSON.stringify({ error: 'Failed to generate agent recommendation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
