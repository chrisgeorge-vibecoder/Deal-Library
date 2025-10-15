import React, { useState } from 'react';

interface InfographicData {
  segmentName: string;
  emoji: string;
  audienceSize: string;
  topOverlap: {
    name: string;
    emoji: string;
    percentage: number;
  };
  insight: string[];
  colorScheme?: 'gold-orange' | 'gold-purple' | 'coral-purple' | 'purple-navy' | 'navy-gold';
}

interface AudienceInfographicGeneratorProps {
  data?: InfographicData;
}

export const AudienceInfographicGenerator: React.FC<AudienceInfographicGeneratorProps> = ({ 
  data: initialData 
}) => {
  const [data, setData] = useState<InfographicData>(initialData || {
    segmentName: 'Camping & Hiking',
    emoji: '🏕️',
    audienceSize: '9.9M',
    topOverlap: {
      name: 'Speakers',
      emoji: '🔊',
      percentage: 55
    },
    insight: [
      'Adventure seekers want their soundtrack everywhere they go.',
      'Perfect for wireless, weather-resistant, or rugged audio solutions.'
    ],
    colorScheme: 'gold-orange'
  });

  const colorSchemes = {
    'gold-orange': { primary: '#FFD42B', secondary: '#FF9A00' },
    'gold-purple': { primary: '#FFD42B', secondary: '#D45087' },
    'coral-purple': { primary: '#FF7B43', secondary: '#D45087' },
    'purple-navy': { primary: '#D45087', secondary: '#2F4A7C' },
    'navy-gold': { primary: '#2F4A7C', secondary: '#FFD42B' },
  };

  const colors = colorSchemes[data.colorScheme || 'gold-orange'];
  const otherPercent = 100 - data.topOverlap.percentage;
  const leftPercent = Math.round(otherPercent / 2);
  const rightPercent = otherPercent - leftPercent;

  const downloadSVG = () => {
    const svg = document.getElementById('audience-infographic');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 600, 500);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${data.segmentName.replace(/\s+/g, '-')}-infographic.png`;
            link.click();
          }
        });
      }
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="px-6 py-4"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
          }}
        >
          <h2 className="text-xl font-bold text-charcoal mb-1">
            {data.emoji} {data.segmentName} Audience Overlap
          </h2>
          <p className="text-sm text-charcoal opacity-80">
            {data.audienceSize} Commerce Buyers
          </p>
        </div>

        {/* SVG Infographic */}
        <div className="p-6">
          <svg 
            id="audience-infographic"
            width="600" 
            height="500" 
            viewBox="0 0 600 500" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <defs>
              <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#f9f9f9', stopOpacity: 1 }} />
              </linearGradient>
              <filter id="shadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.2"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <rect width="600" height="500" fill="url(#bgGradient)"/>
            
            {/* Title */}
            <text 
              x="300" 
              y="40" 
              fontFamily="system-ui, sans-serif" 
              fontSize="24" 
              fontWeight="bold" 
              fill="#282828" 
              textAnchor="middle"
            >
              {data.segmentName} × {data.topOverlap.name}
            </text>
            
            {/* Venn Diagram */}
            <circle 
              cx="220" 
              cy="210" 
              r="90" 
              fill={colors.primary}
              fillOpacity="0.7" 
              stroke={colors.primary}
              strokeWidth="3" 
              filter="url(#shadow)"
            />
            
            <circle 
              cx="380" 
              cy="210" 
              r="90" 
              fill={colors.secondary}
              fillOpacity="0.7" 
              stroke={colors.secondary}
              strokeWidth="3" 
              filter="url(#shadow)"
            />
            
            {/* Labels */}
            <text 
              x="165" 
              y="140" 
              fontFamily="system-ui, sans-serif" 
              fontSize="18" 
              fontWeight="bold" 
              fill="#282828"
            >
              {data.emoji} {data.segmentName}
            </text>
            
            <text 
              x="390" 
              y="140" 
              fontFamily="system-ui, sans-serif" 
              fontSize="18" 
              fontWeight="bold" 
              fill="#282828"
            >
              {data.topOverlap.emoji} {data.topOverlap.name}
            </text>
            
            {/* Values */}
            <text 
              x="165" 
              y="210" 
              fontFamily="system-ui, sans-serif" 
              fontSize="32" 
              fontWeight="bold" 
              fill="#282828" 
              textAnchor="middle"
            >
              {leftPercent}%
            </text>
            
            <text 
              x="300" 
              y="205" 
              fontFamily="system-ui, sans-serif" 
              fontSize="40" 
              fontWeight="bold" 
              fill="#282828" 
              textAnchor="middle"
            >
              {data.topOverlap.percentage}%
            </text>
            <text 
              x="300" 
              y="230" 
              fontFamily="system-ui, sans-serif" 
              fontSize="13" 
              fill="#282828" 
              textAnchor="middle"
            >
              OVERLAP
            </text>
            
            <text 
              x="435" 
              y="210" 
              fontFamily="system-ui, sans-serif" 
              fontSize="32" 
              fontWeight="bold" 
              fill="#282828" 
              textAnchor="middle"
            >
              {rightPercent}%
            </text>
            
            {/* Insight Box */}
            <rect 
              x="50" 
              y="320" 
              width="500" 
              height={140} 
              fill="#fff" 
              stroke={colors.primary}
              strokeWidth="2" 
              rx="8"
            />
            
            <text 
              x="300" 
              y="350" 
              fontFamily="system-ui, sans-serif" 
              fontSize="16" 
              fontWeight="bold" 
              fill="#282828" 
              textAnchor="middle"
            >
              💡 The Insight
            </text>
            
            {data.insight.map((line, idx) => (
              <text 
                key={idx}
                x="300" 
                y={375 + (idx * 20)} 
                fontFamily="system-ui, sans-serif" 
                fontSize="14" 
                fill="#282828" 
                textAnchor="middle"
              >
                {line}
              </text>
            ))}
            
            {/* Footer */}
            <text 
              x="300" 
              y="485" 
              fontFamily="system-ui, sans-serif" 
              fontSize="11" 
              fill="#666" 
              textAnchor="middle"
            >
              Powered by the Sovrn Data Collective · sovrn.com
            </text>
          </svg>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={downloadSVG}
            className="flex-1 bg-gold hover:bg-orange text-charcoal font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            📥 Download PNG
          </button>
          <button
            onClick={() => {
              const svg = document.getElementById('audience-infographic');
              if (svg) {
                const svgData = new XMLSerializer().serializeToString(svg);
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${data.segmentName.replace(/\s+/g, '-')}-infographic.svg`;
                link.click();
                URL.revokeObjectURL(url);
              }
            }}
            className="flex-1 bg-purple hover:bg-navy text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            📥 Download SVG
          </button>
        </div>

        {/* Editor Section (Optional) */}
        <div className="px-6 pb-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-charcoal mb-4">Customize Your Infographic</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segment Name
              </label>
              <input
                type="text"
                value={data.segmentName}
                onChange={(e) => setData({ ...data, segmentName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audience Size
              </label>
              <input
                type="text"
                value={data.audienceSize}
                onChange={(e) => setData({ ...data, audienceSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overlap Product
              </label>
              <input
                type="text"
                value={data.topOverlap.name}
                onChange={(e) => setData({ 
                  ...data, 
                  topOverlap: { ...data.topOverlap, name: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overlap Percentage
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={data.topOverlap.percentage}
                onChange={(e) => setData({ 
                  ...data, 
                  topOverlap: { ...data.topOverlap, percentage: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Scheme
              </label>
              <select
                value={data.colorScheme}
                onChange={(e) => setData({ ...data, colorScheme: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="gold-orange">Gold → Orange</option>
                <option value="gold-purple">Gold → Purple</option>
                <option value="coral-purple">Coral → Purple</option>
                <option value="purple-navy">Purple → Navy</option>
                <option value="navy-gold">Navy → Gold</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insight Line 1
              </label>
              <input
                type="text"
                value={data.insight[0] || ''}
                onChange={(e) => {
                  const newInsight = [...data.insight];
                  newInsight[0] = e.target.value;
                  setData({ ...data, insight: newInsight });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insight Line 2
              </label>
              <input
                type="text"
                value={data.insight[1] || ''}
                onChange={(e) => {
                  const newInsight = [...data.insight];
                  newInsight[1] = e.target.value;
                  setData({ ...data, insight: newInsight });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceInfographicGenerator;

