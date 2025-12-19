import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface AudienceSegment {
  segmentType: string;
  sovrnSegmentId: string;
  sovrnParentSegmentId: string;
  segmentName: string;
  segmentDescription: string;
  tierNumber: number;
  tier1?: string;
  tier2?: string;
  tier3?: string;
  tier4?: string;
  tier5?: string;
  tier6?: string;
  fullPath: string;
  cpm: number;
  mediaPercentCost: number;
  activelyGenerated: boolean;
  scale7DayUS?: number;
  scale1DayIP?: number;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function loadTaxonomyFromCSV(): AudienceSegment[] {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'data', 'Sovrn Taxonomy (AI Project).csv'),
      path.join(process.cwd(), 'data', 'Sovrn Taxonomy (AI Project).csv'),
    ];
    
    let csvPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }
    
    if (!csvPath) {
      console.error('Taxonomy CSV not found in any expected location');
      return [];
    }
    
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return [];
    }
    
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const segments: AudienceSegment[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      
      headers.forEach((header, idx) => {
        row[header] = values[idx] || '';
      });
      
      // Map CSV columns to segment interface
      const cpmValue = row['cpm'] || row['CPM'] || '';
      const mediaCostValue = row['media_cost_percent'] || row['mediacostpercent'] || row['media_%_cost'] || row['media_percent_cost'] || '';
      
      const segment: AudienceSegment = {
        segmentType: row['segment_type'] || row['segmenttype'] || '',
        sovrnSegmentId: row['sovrn_segment_id'] || row['sovrnsegmentid'] || '',
        sovrnParentSegmentId: row['sovrn_parent_segment_id'] || row['sovrnparentsegmentid'] || '',
        segmentName: row['segment_name'] || row['segmentname'] || '',
        segmentDescription: row['segment_description'] || row['segmentdescription'] || '',
        tierNumber: parseInt(row['tier_number'] || row['tiernumber'] || '0', 10),
        tier1: row['tier_1'] || row['tier1'] || undefined,
        tier2: row['tier_2'] || row['tier2'] || undefined,
        tier3: row['tier_3'] || row['tier3'] || undefined,
        tier4: row['tier_4'] || row['tier4'] || undefined,
        tier5: row['tier_5'] || row['tier5'] || undefined,
        tier6: row['tier_6'] || row['tier6'] || undefined,
        fullPath: row['full_path'] || row['fullpath'] || '',
        cpm: cpmValue ? parseFloat(cpmValue) : 0,
        mediaPercentCost: mediaCostValue ? parseFloat(mediaCostValue) : 0,
        activelyGenerated: row['actively_generated'] === 'true' || row['activelygenerated'] === 'true' || row['actively_generated'] === 'TRUE',
        scale7DayUS: row['scale_7day_us'] ? parseInt(row['scale_7day_us'], 10) : undefined,
        scale1DayIP: row['scale_1day_ip'] ? parseInt(row['scale_1day_ip'], 10) : undefined,
      };
      
      if (segment.segmentName) {
        segments.push(segment);
      }
    }
    
    console.log(`✅ Loaded ${segments.length} audience segments from CSV`);
    return segments;
  } catch (error) {
    console.error('Error loading taxonomy CSV:', error);
    return [];
  }
}

// Cache the loaded segments
let cachedSegments: AudienceSegment[] | null = null;

export async function GET() {
  try {
    if (!cachedSegments) {
      cachedSegments = loadTaxonomyFromCSV();
    }
    
    return NextResponse.json({
      success: true,
      segments: cachedSegments,
      count: cachedSegments.length
    });
  } catch (error) {
    console.error('Error in audiences/browse:', error);
    return NextResponse.json(
      { success: false, segments: [], error: 'Failed to load audiences' },
      { status: 500 }
    );
  }
}




