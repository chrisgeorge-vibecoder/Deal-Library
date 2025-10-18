-- Clear and allow persona migration
TRUNCATE TABLE generated_personas CASCADE;

SELECT 'Personas table cleared. Ready for migration.' as status;

