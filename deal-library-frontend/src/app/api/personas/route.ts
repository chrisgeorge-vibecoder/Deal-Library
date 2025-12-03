import { NextRequest, NextResponse } from 'next/server';

let dealsController: any = null;
let personaService: any = null;

async function getServices() {
  if (!dealsController) {
    const { DealsController } = await import('@/lib/controllers/dealsController');
    dealsController = new DealsController();
  }
  if (!personaService) {
    const { PersonaService } = await import('@/lib/services/personaService');
    personaService = new PersonaService();
  }
  return { dealsController, personaService };
}

export async function GET() {
  try {
    const { dealsController, personaService } = await getServices();
    const personas = personaService.getAllPersonas();
    const allDeals = await dealsController.getAllDeals();
    
    const personaCards = personas.map((persona: any) => {
      const matchingDeals = allDeals.filter((deal: any) => {
        const personaInsights = personaService.matchDealToPersona(deal.dealName);
        return personaInsights && personaInsights.segmentId === persona.segmentId;
      });
      
      return {
        id: persona.segmentId,
        name: persona.personaName,
        emoji: persona.emoji,
        segmentId: persona.segmentId,
        category: persona.category,
        coreInsight: persona.coreInsight,
        creativeHooks: persona.creativeHooks,
        mediaTargeting: persona.mediaTargeting,
        audienceMotivation: persona.audienceMotivation,
        actionableStrategy: persona.actionableStrategy,
        dealCount: matchingDeals.length
      };
    });
    
    return NextResponse.json(personaCards);
  } catch (error) {
    console.error('Error fetching personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}

