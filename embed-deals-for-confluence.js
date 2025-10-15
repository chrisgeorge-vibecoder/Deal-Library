#!/usr/bin/env node

/**
 * Script to fetch real Commerce Audience deals from the API
 * and embed them directly in the HTML for Confluence
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function fetchAndEmbedDeals() {
    console.log('🔄 Fetching Commerce Audience deals from API...');
    
    try {
        // Fetch deals from API
        const response = await fetch('http://localhost:3002/api/deals?limit=500');
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        const allDeals = data.deals || [];
        
        // Filter for Commerce Audience deals
        const commerceDeals = allDeals.filter(deal => 
            deal.targeting && deal.targeting.includes('Commerce Audiences')
        );
        
        console.log(`✅ Found ${commerceDeals.length} Commerce Audience deals`);
        
        // Group deals by segment
        const dealsBySegment = {};
        
        commerceDeals.forEach(deal => {
            // Extract segment name: "Pet Supplies Purchase Intender (CTV)" -> "Pet Supplies"
            const match = deal.dealName.match(/^(.+?)\s+Purchase Intender/);
            if (!match) return;
            
            const segment = match[1].trim();
            
            if (!dealsBySegment[segment]) {
                dealsBySegment[segment] = [];
            }
            
            dealsBySegment[segment].push({
                dealId: deal.dealId,
                dealName: deal.dealName,
                targeting: segment,
                bidGuidance: deal.bidGuidance || 'Contact for pricing',
                mediaType: deal.mediaType || 'Multi-format',
                environment: deal.environment || ''
            });
        });
        
        // Generate JavaScript code
        const jsCode = `        // Embedded Commerce Audience Deals (${commerceDeals.length} deals across ${Object.keys(dealsBySegment).length} segments)
        // Last updated: ${new Date().toISOString()}
        // Source: Deal Library API
        const embeddedCommerceDeals = ${JSON.stringify(dealsBySegment, null, 12)};`;
        
        console.log(`\n📊 Deals organized by segment:`);
        console.log(`   Total segments: ${Object.keys(dealsBySegment).length}`);
        Object.keys(dealsBySegment).sort().slice(0, 10).forEach(segment => {
            console.log(`   - ${segment}: ${dealsBySegment[segment].length} deals`);
        });
        console.log(`   ... and ${Object.keys(dealsBySegment).length - 10} more`);
        
        return jsCode;
        
    } catch (error) {
        console.error('❌ Error fetching deals:', error.message);
        console.error('\n⚠️  Make sure:');
        console.error('   1. Backend is running: cd deal-library-backend && npm start');
        console.error('   2. Backend is on port 3002');
        process.exit(1);
    }
}

async function updateHTML() {
    const htmlPath = path.join(__dirname, 'sales-prospecting-tool-confluence.html');
    
    console.log(`\n📝 Reading ${htmlPath}...`);
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Fetch deals
    const dealsCode = await fetchAndEmbedDeals();
    
    // Replace the API fetch code with embedded data
    const searchPattern = /\/\/ Deals database - Fetched from Deal Library API[\s\S]*?\/\/ Initialize: Load deals when page loads\s+loadDealsFromAPI\(\);/;
    
    const replacementCode = `// Deals database - Embedded Commerce Audience Deals for Confluence
        // This data is embedded directly so the tool works standalone in Confluence
        ${dealsCode}
        
        // Convert embedded deals to API format for compatibility
        let apiDeals = [];
        Object.keys(embeddedCommerceDeals).forEach(segment => {
            embeddedCommerceDeals[segment].forEach(deal => {
                apiDeals.push({
                    ...deal,
                    targeting: 'Commerce Audiences'
                });
            });
        });
        
        console.log(\`✅ Loaded \${apiDeals.length} embedded Commerce Audience deals\`);
        console.log(\`📊 Available segments: \${Object.keys(embeddedCommerceDeals).length}\`);`;
    
    if (!html.match(searchPattern)) {
        console.error('❌ Could not find the code section to replace');
        console.error('   The HTML structure may have changed');
        process.exit(1);
    }
    
    html = html.replace(searchPattern, replacementCode);
    
    // Write updated HTML
    fs.writeFileSync(htmlPath, html, 'utf8');
    
    console.log(`\n✅ Updated ${htmlPath}`);
    console.log(`\n🎉 Confluence-ready version created!`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Open sales-prospecting-tool-confluence.html`);
    console.log(`   2. Copy all the HTML code`);
    console.log(`   3. Paste into Confluence HTML macro`);
    console.log(`   4. It will work standalone (no backend required)!`);
}

// Run the script
updateHTML().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});


