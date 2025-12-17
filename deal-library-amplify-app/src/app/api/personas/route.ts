import { NextResponse } from 'next/server';
import { PersonaService } from '@/lib/services/personaService';

// Singleton PersonaService instance
let personaServiceInstance: PersonaService | null = null;

function getPersonaService(): PersonaService {
  if (!personaServiceInstance) {
    personaServiceInstance = new PersonaService();
  }
  return personaServiceInstance;
}

export async function GET() {
  try {
    console.log('🎭 Fetching all personas...');
    const personaService = getPersonaService();
    const personas = personaService.getAllPersonas();
    
    // Transform PersonaInsights to match the expected Persona format for the frontend
    const transformedPersonas = personas.map((p, index) => ({
      id: p.segmentId || `persona-${index}`,
      name: p.personaName || 'Unknown Persona',
      emoji: p.emoji || '👤',
      category: p.category || 'General',
      coreInsight: p.coreInsight || '',
      description: p.audienceMotivation || p.coreInsight || '',
      creativeHooks: p.creativeHooks || [],
      mediaTargeting: p.mediaTargeting || [],
      audienceMotivation: p.audienceMotivation || '',
      actionableStrategy: p.actionableStrategy || {},
      // Additional fields for compatibility
      demographics: {},
      interests: [],
      painPoints: []
    }));
    
    console.log(`✅ Loaded ${transformedPersonas.length} personas from PersonaService`);
    return NextResponse.json(transformedPersonas);
  } catch (error) {
    console.error('❌ Error fetching personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}
