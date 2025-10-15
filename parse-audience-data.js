const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, 'deal-library-backend/data/199_Audience_Overlap_Data.csv');
const csvData = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvData.split('\n');
const segments = {};

let currentSegment = null;

for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const parts = line.split(',');
    const fieldName = parts[1];
    const dataInput = parts[2];
    
    if (fieldName === 'Segment Name') {
        currentSegment = dataInput;
        segments[currentSegment] = {
            overlaps: []
        };
    } else if (fieldName === 'Total Audience Size' && currentSegment) {
        // Remove quotes and format
        const cleanSize = dataInput.replace(/"/g, '').replace(/,/g, '').trim();
        const sizeNum = parseInt(cleanSize);
        let formatted;
        if (sizeNum >= 1000000) {
            formatted = (sizeNum / 1000000).toFixed(1).replace('.0', '') + 'M';
        } else if (sizeNum >= 1000) {
            formatted = (sizeNum / 1000).toFixed(0) + 'K';
        } else {
            formatted = sizeNum.toString();
        }
        segments[currentSegment].size = formatted;
    } else if (fieldName && fieldName.startsWith('Top Overlap') && currentSegment) {
        // Parse overlap: "Product Name (XX%)"
        const match = dataInput.match(/(.+?)\s*\((\d+)%\)/);
        if (match) {
            const name = match[1].trim();
            const percent = parseInt(match[2]);
            segments[currentSegment].overlaps.push({
                name: name,
                percent: percent
            });
        }
    }
}

// Generate JavaScript output with brand suggestions and insights
const output = {};
for (const [segment, data] of Object.entries(segments)) {
    if (data.overlaps && data.overlaps.length > 0) {
        output[segment] = {
            size: data.size,
            overlaps: data.overlaps.slice(0, 5), // Top 5
        };
    }
}

// Write to JSON file
fs.writeFileSync(
    path.join(__dirname, 'audience-data.json'),
    JSON.stringify(output, null, 2)
);

console.log(`✅ Parsed ${Object.keys(output).length} segments`);
console.log('📁 Saved to audience-data.json');

