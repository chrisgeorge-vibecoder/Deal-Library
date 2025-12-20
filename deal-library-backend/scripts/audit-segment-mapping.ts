/**
 * Audit script to identify segments in the category mapping that don't have data
 * 
 * This script checks which segments from the hardcoded category mapping
 * actually have data in the commerce database, helping identify segments
 * that should be removed from the mapping.
 * 
 * Usage:
 *   npm run audit-segments
 *   OR
 *   npx ts-node scripts/audit-segment-mapping.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { SupabaseService } from '../src/services/supabaseService';

// Category-to-segments mapping (copied from frontend)
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

interface AuditResult {
  category: string;
  segmentsWithData: string[];
  segmentsWithoutData: string[];
  totalInMapping: number;
  totalWithData: number;
  totalWithoutData: number;
}

async function checkSegmentExists(segmentName: string): Promise<{ exists: boolean; count: number }> {
  const supabase = SupabaseService.getClient();
  
  try {
    // Query Supabase directly to check if segment exists and get count
    const { data, error, count } = await supabase
      .from('commerce_audience_segments')
      .select('audience_name', { count: 'exact', head: false })
      .eq('audience_name', segmentName.trim())
      .limit(1);
    
    if (error) {
      console.error(`   ⚠️  Error checking "${segmentName}": ${error.message}`);
      return { exists: false, count: 0 };
    }
    
    return { 
      exists: (count ?? 0) > 0, 
      count: count ?? 0 
    };
  } catch (error) {
    console.error(`   ⚠️  Exception checking "${segmentName}":`, error);
    return { exists: false, count: 0 };
  }
}

async function auditSegmentMapping(): Promise<void> {
  console.log('\n' + '═'.repeat(80));
  console.log('  🔍 AUDITING SEGMENT MAPPING FOR DATA AVAILABILITY');
  console.log('═'.repeat(80) + '\n');

  console.log('📊 Checking segments directly in Supabase database...');
  console.log('   This queries the database directly for each segment to verify existence.\n');

  // Audit each category
  const results: AuditResult[] = [];
  const totalSegments = Object.values(SEGMENT_MAPPING).flat().length;
  let segmentsChecked = 0;

  for (const [category, expectedSegments] of Object.entries(SEGMENT_MAPPING)) {
    console.log(`\n📁 Checking category: ${category} (${expectedSegments.length} segments)`);
    const segmentsWithData: string[] = [];
    const segmentsWithoutData: string[] = [];

    for (const expectedSegment of expectedSegments) {
      segmentsChecked++;
      process.stdout.write(`   [${segmentsChecked}/${totalSegments}] Checking "${expectedSegment}"... `);
      
      const result = await checkSegmentExists(expectedSegment);
      
      if (result.exists && result.count > 0) {
        segmentsWithData.push(expectedSegment);
        console.log(`✅ Found (${result.count.toLocaleString()} records)`);
      } else {
        segmentsWithoutData.push(expectedSegment);
        console.log(`❌ Not found (0 records)`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    results.push({
      category,
      segmentsWithData,
      segmentsWithoutData,
      totalInMapping: expectedSegments.length,
      totalWithData: segmentsWithData.length,
      totalWithoutData: segmentsWithoutData.length
    });
  }

  // Print summary
  console.log('\n' + '═'.repeat(80));
  console.log('  📊 AUDIT RESULTS SUMMARY');
  console.log('═'.repeat(80) + '\n');

  let totalSegmentsInMapping = 0;
  let totalSegmentsWithData = 0;
  let totalSegmentsWithoutData = 0;

  for (const result of results) {
    totalSegmentsInMapping += result.totalInMapping;
    totalSegmentsWithData += result.totalWithData;
    totalSegmentsWithoutData += result.totalWithoutData;

    if (result.totalWithoutData > 0) {
      console.log(`\n📁 ${result.category}`);
      console.log(`   ✅ With data: ${result.totalWithData}/${result.totalInMapping}`);
      console.log(`   ❌ Without data: ${result.totalWithoutData}/${result.totalInMapping}`);
      if (result.segmentsWithoutData.length > 0) {
        console.log(`   🚫 Segments to remove: ${result.segmentsWithoutData.join(', ')}`);
      }
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('  📈 OVERALL STATISTICS');
  console.log('═'.repeat(80));
  console.log(`
  Total segments in mapping:    ${totalSegmentsInMapping}
  ✅ Segments with data:        ${totalSegmentsWithData} (${((totalSegmentsWithData / totalSegmentsInMapping) * 100).toFixed(1)}%)
  ❌ Segments without data:     ${totalSegmentsWithoutData} (${((totalSegmentsWithoutData / totalSegmentsInMapping) * 100).toFixed(1)}%)
  `);

  // Generate removal recommendations
  if (totalSegmentsWithoutData > 0) {
    console.log('\n' + '═'.repeat(80));
    console.log('  🔧 RECOMMENDED ACTIONS');
    console.log('═'.repeat(80));
    console.log('\n  Segments to remove from mapping (no data available):\n');
    
    for (const result of results) {
      if (result.segmentsWithoutData.length > 0) {
        console.log(`  // ${result.category}`);
        for (const seg of result.segmentsWithoutData) {
          console.log(`  // Remove: '${seg}'`);
        }
      }
    }
  }

  console.log('\n' + '═'.repeat(80) + '\n');

  if (totalSegmentsWithoutData > 0) {
    process.exit(1); // Exit with error if segments without data found
  } else {
    console.log('✅ All segments in mapping have data!');
    process.exit(0);
  }
}

// Run the audit
auditSegmentMapping().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});

