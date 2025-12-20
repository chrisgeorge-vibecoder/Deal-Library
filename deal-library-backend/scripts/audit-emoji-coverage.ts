/**
 * Audit script to check emoji coverage for all 199 segments
 * 
 * This script verifies that all segments have appropriate emojis assigned
 * either through segment-specific mapping or category fallback.
 */

import * as dotenv from 'dotenv';
dotenv.config();

// Segment mapping (copied from frontend)
const SEGMENT_MAPPING: Record<string, string[]> = {
  'Animals & Pet Supplies': [
    'Animals & Pet Supplies', 'Cat Supplies', 'Dog Supplies', 'Live Animals', 'Pet Supplies'
  ],
  'Apparel & Accessories': [
    'Activewear', 'Baby & Toddler Clothing', 'Clothing', 'Clothing Accessories',
    'Costumes & Accessories', 'Dresses', 'Outerwear', 'Shirts & Tops', 'Shoes', 'Shorts',
    'Skirts', 'Sunglasses'
  ],
  'Arts & Entertainment': [
    'Arts & Entertainment', 'Books', 'DVDs & Videos', 'Event Tickets', 'Film & Television',
    'Hobbies & Creative Arts', 'Magazines & Newspapers', 'Music & Sound Recordings',
    'Party & Celebration'
  ],
  'Baby & Toddler': [
    'Baby & Toddler', 'Baby & Toddler Furniture', 'Baby Bathing', 'Baby Gift Sets',
    'Baby Health', 'Baby Safety', 'Baby Toys & Activity Equipment', 'Baby Transport',
    'Baby Transport Accessories', 'Diapering', 'Nursing & Feeding', 'Potty Training',
    'Swaddling & Receiving Blankets'
  ],
  'Business & Industrial': [
    'Advertising & Marketing', 'Agriculture', 'Business & Industrial', 'Construction',
    'Finance & Insurance', 'Food Service', 'Forestry & Logging', 'Hotel & Hospitality',
    'Manufacturing', 'Retail', 'Science & Laboratory', 'Signage'
  ],
  'Cameras & Optics': [
    'Camera Lenses', 'Camera Parts & Accessories', 'Cameras', 'Cameras & Optics',
    'Optics', 'Photography'
  ],
  'Electronics': [
    '3D Printers', 'Audio', 'Business & Home Security', 'Circuit Boards & Components',
    'Communications', 'Components', 'Computers', 'Electronics', 'Electronics Accessories',
    'GPS Tracking Devices', 'Laptops', 'Marine Electronics', 'Microphones', 'Mobile Phones',
    'Networking', 'Radar Detectors', 'Speakers', 'Storage Devices', 'Tablet Computers',
    'Televisions', 'Video', 'Video Game Consoles'
  ],
  'Food, Beverages & Tobacco': [
    'Alcoholic Beverages', 'Beverages', 'Coffee', 'Condiments & Sauces',
    'Cooking & Baking Ingredients', 'Dairy Products', 'Dips & Spreads', 'Food Items',
    'Frozen Desserts & Novelties', 'Juice', 'Non-Dairy Milk', 'Nuts & Seeds',
    'Pasta & Noodles', 'Seasonings & Spices', 'Soups & Broths', 'Sports & Energy Drinks',
    'Tea & Infusions', 'Water'
  ],
  'Furniture': [
    'Beds & Accessories', 'Benches', 'Chairs', 'Entertainment Centers & TV Stands',
    'Furniture', 'Furniture Sets', 'Futons', 'Mattresses', 'Office Furniture',
    'Outdoor Furniture', 'Shelving', 'Sofas', 'Tables'
  ],
  'Hardware': [
    'Building Materials', 'Fencing & Barriers', 'Fireplace & Wood Stove Accessories',
    'Fireplaces', 'Hardware', 'Hardware Accessories', 'Locks & Keys', 'Plumbing',
    'Tools', 'Wood Stoves'
  ],
  'Health & Beauty': [
    'Condoms', 'Cosmetic & Toiletry Bags', 'Cosmetics', 'Feminine Sanitary Supplies',
    'Fitness & Nutrition', 'Foot Care', 'Hairdressing & Cosmetology', 'Health & Beauty',
    'Medical', 'Oral Care', 'Personal Care', 'Piercing & Tattooing', 'Shaving & Grooming',
    'Sleeping Aids', 'Vision Care'
  ],
  'Home & Garden': [
    'Bathroom Accessories', 'Cabinets & Storage', 'Cookware & Bakeware', 'Decor',
    'Emergency Preparedness', 'Food & Beverage Carriers', 'Food Storage',
    'Food Storage Accessories', 'Gardening', 'Home & Garden', 'Household Appliance Accessories',
    'Household Appliances', 'Household Cleaning Supplies', 'Household Paper Products',
    'Household Supplies', 'Kitchen & Dining', 'Kitchen Appliance Accessories',
    'Kitchen Appliances', 'Kitchen Tools & Utensils', 'Laundry Supplies', 'Lawn & Garden',
    'Lighting', 'Linens & Bedding', 'Outdoor Play Equipment', 'Plants', 'Pool & Spa'
  ],
  'Luggage & Bags': [
    'Backpacks', 'Briefcases', 'Duffel Bags', 'Luggage & Bags', 'Messenger Bags', 'Suitcases'
  ],
  'Media': [
    'Media'
  ],
  'Office Supplies': [
    'General Office Supplies', 'Office Equipment', 'Office Supplies'
  ],
  'Software': [
    'Antivirus & Security Software', 'Business & Productivity Software', 'Computer Software',
    'Educational Software', 'Network Software', 'Operating Systems', 'Software'
  ],
  'Sporting Goods': [
    'Athletics', 'Camping & Hiking', 'Cycling', 'Exercise & Fitness', 'Golf',
    'Outdoor Recreation', 'Sporting Goods', 'Sports Toys', 'Winter Sports & Activities',
    'Yoga & Pilates'
  ],
  'Toys & Games': [
    'Arcade Equipment', 'Educational Toys', 'Games', 'Gift Giving', 'Indoor Games',
    'Puzzles', 'Toys', 'Toys & Games'
  ],
  'Vehicles & Parts': [
    'Vehicle Parts & Accessories', 'Vehicles', 'Vehicles & Parts'
  ]
};

// Current segment-specific emojis (from the service)
const SEGMENT_EMOJIS: Record<string, string> = {
  'Golf': '⛳',
  'Tennis': '🎾',
  'Basketball': '🏀',
  'Baseball': '⚾',
  'Football': '🏈',
  'Soccer': '⚽',
  'Swimming': '🏊',
  'Cycling': '🚴',
  'Running': '🏃',
  'Fitness': '💪',
  'Yoga': '🧘',
  'Camping & Hiking': '🏕️',
  'Fishing': '🎣',
  'Hunting & Shooting': '🎯',
  'Winter Sports': '⛷️',
  'Water Sports': '🏄',
  'Audio': '🎧',
  'Video': '📹',
  'Cameras & Optics': '📷',
  'Computer Components': '🖥️',
  'Computers': '💻',
  'Tablet Computers': '📱',
  'Mobile Phones': '📱',
  'Gaming': '🎮',
  'Video Game Consoles': '🎮',
  'Televisions': '📺',
  'Speakers': '🔊',
  'Dog Supplies': '🐕',
  'Cat Supplies': '🐈',
  'Pet Supplies': '🐾',
  'Live Animals': '🐾',
  'Coffee': '☕',
  'Tea': '🍵',
  'Alcoholic Beverages': '🍷',
  'Beer': '🍺',
  'Wine': '🍷',
  'Shoes': '👟',
  'Dresses': '👗',
  'Activewear': '🏃',
  'Sunglasses': '🕶️',
  'Baby & Toddler': '👶',
  'Baby & Toddler Clothing': '👶',
  'Baby Safety': '👶',
  'Nursing & Feeding': '🍼',
  'Foot Care': '🦶',
  'Vision Care': '👓',
  'Skin Care': '🧴',
  'Hair Care': '💇',
  'Oral Care': '🦷',
  'Makeup': '💄',
  'Fragrances': '🌸',
  'Vitamins & Supplements': '💊',
  'Personal Care': '🧼',
  'Shaving & Grooming': '🪒',
  'Bath & Body': '🛁',
  'Gardening': '🌱',
  'Outdoor Living': '🏡',
  'Kitchen': '🍳',
  'Laundry Supplies': '🧺',
  'Cleaning Supplies': '🧹',
  'Motorcycles': '🏍️',
  'Marine Vehicles': '⛵',
  'Bicycles': '🚴',
  'Vehicle Parts & Accessories': '🚗'
};

// Category emojis (fallback)
const CATEGORY_EMOJIS: Record<string, string> = {
  'Animals & Pet Supplies': '🐾',
  'Apparel & Accessories': '👗',
  'Arts & Entertainment': '🎨',
  'Baby & Toddler': '👶',
  'Business & Industrial': '🏭',
  'Cameras & Optics': '📷',
  'Electronics': '💻',
  'Food, Beverages & Tobacco': '🍽️',
  'Furniture': '🛋️',
  'Hardware': '🔧',
  'Health & Beauty': '💄',
  'Home & Garden': '🏡',
  'Luggage & Bags': '🎒',
  'Media': '📺',
  'Office Supplies': '📎',
  'Software': '💿',
  'Sporting Goods': '⚽',
  'Toys & Games': '🎮',
  'Vehicles & Parts': '🚗',
  'General': '🎯'
};

function getEmojiForSegment(segment: string, category: string): string {
  // Check segment-specific first
  if (SEGMENT_EMOJIS[segment]) {
    return SEGMENT_EMOJIS[segment];
  }
  // Fallback to category
  return CATEGORY_EMOJIS[category] || '🎯';
}

async function auditEmojiCoverage(): Promise<void> {
  console.log('\n' + '═'.repeat(80));
  console.log('  🔍 AUDITING EMOJI COVERAGE FOR ALL 199 SEGMENTS');
  console.log('═'.repeat(80) + '\n');

  const allSegments: Array<{ segment: string; category: string; emoji: string; source: 'specific' | 'category' | 'default' }> = [];
  const segmentsWithoutSpecificEmoji: string[] = [];

  // Check all segments
  for (const [category, segments] of Object.entries(SEGMENT_MAPPING)) {
    for (const segment of segments) {
      const hasSpecific = SEGMENT_EMOJIS.hasOwnProperty(segment);
      const emoji = getEmojiForSegment(segment, category);
      const source = hasSpecific ? 'specific' : (CATEGORY_EMOJIS[category] ? 'category' : 'default');
      
      allSegments.push({ segment, category, emoji, source });
      
      if (!hasSpecific) {
        segmentsWithoutSpecificEmoji.push(segment);
      }
    }
  }

  // Report
  console.log(`📊 Total segments checked: ${allSegments.length}`);
  console.log(`✅ Segments with specific emoji: ${allSegments.filter(s => s.source === 'specific').length}`);
  console.log(`📋 Segments using category emoji: ${allSegments.filter(s => s.source === 'category').length}`);
  console.log(`⚠️  Segments using default emoji: ${allSegments.filter(s => s.source === 'default').length}\n`);

  // List segments without specific emojis
  if (segmentsWithoutSpecificEmoji.length > 0) {
    console.log('📝 Segments without specific emoji (using category fallback):\n');
    
    // Group by category
    const byCategory: Record<string, string[]> = {};
    for (const segment of segmentsWithoutSpecificEmoji) {
      for (const [category, segments] of Object.entries(SEGMENT_MAPPING)) {
        if (segments.includes(segment)) {
          if (!byCategory[category]) {
            byCategory[category] = [];
          }
          byCategory[category].push(segment);
          break;
        }
      }
    }

    for (const [category, segments] of Object.entries(byCategory)) {
      console.log(`\n📁 ${category} (${CATEGORY_EMOJIS[category]}):`);
      for (const segment of segments) {
        const emoji = getEmojiForSegment(segment, category);
        console.log(`   ${emoji} ${segment}`);
      }
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('  ✅ AUDIT COMPLETE');
  console.log('═'.repeat(80));
  console.log('\nAll segments have emojis (either specific or category fallback).\n');
}

auditEmojiCoverage().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

