import * as path from 'path';
import * as dotenv from 'dotenv';
import { SupabaseService } from '../src/services/supabaseService';
import { PersonaService } from '../src/services/personaService';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  console.log('\n👤 === MIGRATING PERSONAS ONLY ===\n');
  
  const supabase = SupabaseService.getClient();
  const personaService = new PersonaService();
  const allPersonas = personaService.getAllPersonas();
  
  console.log(`📈 Processing ${allPersonas.length} personas...`);
  
  const personaRecords = allPersonas.map(persona => ({
    segment_id: persona.segmentId,
    segment_name: persona.personaName,
    persona_name: persona.personaName,
    emoji: persona.emoji,
    category: persona.category,
    core_insight: persona.coreInsight,
    creative_hooks: persona.creativeHooks,
    media_targeting: persona.mediaTargeting,
    audience_motivation: persona.audienceMotivation,
    actionable_strategy: persona.actionableStrategy,
    is_dynamic: false
  }));
  
  const { data, error } = await supabase
    .from('generated_personas')
    .insert(personaRecords);
  
  if (error) {
    console.error(`❌ Error inserting personas:`, error.message);
    console.log(`\n💡 If you see "duplicate key", run this SQL in Supabase first:`);
    console.log(`   TRUNCATE TABLE generated_personas CASCADE;\n`);
    process.exit(1);
  } else {
    console.log(`✅ Successfully inserted ${personaRecords.length} personas!\n`);
  }
}

main().catch(console.error);

