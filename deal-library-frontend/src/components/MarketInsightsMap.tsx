'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TopMarket } from '@/types/deal';

interface MarketInsightsMapProps {
  markets: TopMarket[];
  metricName: string;
  metricFormat: 'number' | 'percentage' | 'currency';
  onMarketClick: (market: TopMarket) => void;
}

export default function MarketInsightsMap({ 
  markets, 
  metricName, 
  metricFormat,
  onMarketClick 
}: MarketInsightsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const initializingRef = useRef(false);

  console.log('🗺️ MarketInsightsMap rendered with:', { 
    marketsCount: markets.length, 
    metricName, 
    metricFormat,
    mapReady,
    isLoading,
    initializing: initializingRef.current
  });

  // Reset states when markets or metric changes
  useEffect(() => {
    console.log('🗺️ Markets or metric changed, resetting states');
    setIsLoading(true);
    setMapError(false);
    setMapReady(false);
    initializingRef.current = false;
  }, [markets.length, metricName]);

  // Use callback ref to detect when DOM element is attached
  const mapRef = (node: HTMLDivElement | null) => {
    if (node) {
      console.log('🗺️ Map container ref attached via callback', { 
        alreadyReady: mapReady,
        hasNode: !!mapContainerRef.current 
      });
      mapContainerRef.current = node;
      if (!mapReady) {
        setMapReady(true);
      }
    }
  };

  // Get coordinates for different geographic entities
  const getCoordinatesForMarket = (marketName: string, geoLevel: string): [number, number] => {
    const coordinates: { [key: string]: [number, number] } = {
      // US Regions
      'Northeast': [42.0, -75.0],
      'Midwest': [41.5, -93.0],
      'South': [33.0, -84.0],
      'West': [40.0, -112.0],
      
      // Major CBSAs
      'New York-Newark-Jersey City, NY-NJ-PA': [40.7128, -74.0060],
      'Los Angeles-Long Beach-Anaheim, CA': [34.0522, -118.2437],
      'Chicago-Naperville-Elgin, IL-IN-WI': [41.8781, -87.6298],
      'Dallas-Fort Worth-Arlington, TX': [32.7767, -96.7970],
      'Houston-The Woodlands-Sugar Land, TX': [29.7604, -95.3698],
      'Washington-Arlington-Alexandria, DC-VA-MD-WV': [38.9072, -77.0369],
      'Miami-Fort Lauderdale-Pompano Beach, FL': [25.7617, -80.1918],
      'Philadelphia-Camden-Wilmington, PA-NJ-DE-MD': [39.9526, -75.1652],
      'Atlanta-Sandy Springs-Alpharetta, GA': [33.7490, -84.3880],
      'Phoenix-Mesa-Chandler, AZ': [33.4484, -112.0740],
      'Boston-Cambridge-Newton, MA-NH': [42.3601, -71.0589],
      'San Francisco-Oakland-Berkeley, CA': [37.7749, -122.4194],
      'Riverside-San Bernardino-Ontario, CA': [33.9806, -117.3755],
      'Detroit-Warren-Dearborn, MI': [42.3314, -83.0458],
      'Seattle-Tacoma-Bellevue, WA': [47.6062, -122.3321],
      'Minneapolis-St. Paul-Bloomington, MN-WI': [44.9778, -93.2650],
      'San Diego-Chula Vista-Carlsbad, CA': [32.7157, -117.1611],
      'Tampa-St. Petersburg-Clearwater, FL': [27.9506, -82.4572],
      'Denver-Aurora-Lakewood, CO': [39.7392, -104.9903],
      'St. Louis, MO-IL': [38.6270, -90.1994],
      
      // States
      'California': [36.7783, -119.4179],
      'Texas': [31.9686, -99.9018],
      'Florida': [27.7663, -82.6404],
      'New York': [42.1657, -74.9481],
      'Pennsylvania': [41.2033, -77.1945],
      'Illinois': [40.3363, -89.0022],
      'Ohio': [40.3888, -82.7649],
      'Georgia': [33.0406, -83.6431],
      'North Carolina': [35.6300, -79.8064],
      'Michigan': [43.3266, -84.5361],
      'New Jersey': [40.2989, -74.5210],
      'Virginia': [37.7693, -78.1699],
      'Washington': [47.4009, -121.4905],
      'Arizona': [33.7298, -111.4312],
      'Massachusetts': [42.2373, -71.5314],
      'Tennessee': [35.7478, -86.6923],
      'Indiana': [39.7909, -86.1477],
      'Missouri': [38.4561, -92.2884],
      'Maryland': [39.0639, -76.8021],
      'Wisconsin': [44.2685, -89.6165],
      'Colorado': [39.0598, -105.3111],
      'Minnesota': [46.7296, -94.6859],
      'South Carolina': [33.8569, -80.9450],
      'Alabama': [32.8067, -86.7911],
      'Louisiana': [31.1695, -91.8678],
      'Kentucky': [37.6681, -84.6701],
      'Oregon': [44.5721, -122.0709],
      'Oklahoma': [35.5653, -96.9289],
      'Connecticut': [41.5978, -72.7554],
      'Utah': [40.1500, -111.8624],
      'Iowa': [42.0115, -93.2105],
      'Nevada': [38.4199, -117.1219],
      'Arkansas': [34.9697, -92.3731],
      'Mississippi': [32.7673, -89.6812],
      'Kansas': [38.5266, -96.7265],
      'New Mexico': [34.8405, -106.2485],
      'Nebraska': [41.1254, -98.2681],
      'West Virginia': [38.4912, -80.9545],
      'Idaho': [44.2405, -114.4788],
      'Hawaii': [21.0943, -157.4983],
      'New Hampshire': [43.4525, -71.5639],
      'Maine': [44.3235, -69.7653],
      'Rhode Island': [41.6809, -71.5118],
      'Montana': [47.0526, -110.4544],
      'Delaware': [39.3185, -75.5071],
      'South Dakota': [44.2998, -99.4388],
      'North Dakota': [47.5289, -99.7840],
      'Alaska': [61.3707, -152.4044],
      'Vermont': [44.0459, -72.7107],
      'Wyoming': [42.7555, -107.3025],
      'Puerto Rico': [18.2208, -66.5901],
      'District of Columbia': [38.9072, -77.0369],
    };

    // Direct match
    if (coordinates[marketName]) {
      return coordinates[marketName];
    }

    // Partial match for CBSAs and cities
    for (const [key, coords] of Object.entries(coordinates)) {
      if (marketName.includes(key) || key.includes(marketName)) {
        return coords;
      }
    }

    // Default to center of US
    return [39.8283, -98.5795];
  };

  // Format value based on metric format
  const formatValue = (value: number): string => {
    switch (metricFormat) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  // Get color based on rank (heatmap effect)
  const getColorForRank = (rank: number): string => {
    if (rank <= 10) return '#dc2626'; // Red - Top 10
    if (rank <= 20) return '#ea580c'; // Orange
    if (rank <= 30) return '#d97706'; // Amber
    if (rank <= 40) return '#65a30d'; // Lime
    return '#059669'; // Green - 41-50
  };

  useEffect(() => {
    // Early return if no markets or ref not ready
    if (markets.length === 0 || !mapReady || typeof window === 'undefined' || !mapContainerRef.current) {
      console.log('🗺️ Map init skipped:', { 
        marketsCount: markets.length,
        mapReady,
        window: typeof window !== 'undefined',
        mapRef: !!mapContainerRef.current
      });
      setIsLoading(false);
      return;
    }

    // Prevent multiple initializations
    if (initializingRef.current) {
      console.log('🗺️ Map already initializing, skipping...');
      return;
    }

    initializingRef.current = true;
    console.log('🗺️ Starting map initialization with', markets.length, 'markets');

    // Load Leaflet CSS
    const loadLeafletCSS = () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
        console.log('🗺️ Leaflet CSS loaded');
      }
    };

    loadLeafletCSS();

    const initMap = async () => {
      try {
        console.log('🗺️ Init map - starting...');
        setIsLoading(true);
        const L = await import('leaflet');
        console.log('🗺️ Leaflet imported successfully');
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Clean up existing map
        if (mapInstanceRef.current) {
          console.log('🗺️ Cleaning up existing map');
          try {
            mapInstanceRef.current.off();
            mapInstanceRef.current.remove();
          } catch (e) {
            console.warn('🗺️ Error cleaning up map:', e);
          }
          mapInstanceRef.current = null;
        }

        if (!mapContainerRef.current) {
          console.error('🗺️ Map ref is null');
          return;
        }
        
        // Don't manipulate innerHTML - Leaflet's remove() already cleaned up
        console.log('🗺️ Container ready, creating new map...');

        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('🗺️ Creating Leaflet map instance...');
        // Initialize map
        const map = L.map(mapContainerRef.current!, {
          zoomControl: true,
          attributionControl: true
        }).setView([39.8283, -98.5795], 4);
        
        console.log('🗺️ Map instance created');
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add markers with heatmap colors
        const markerGroup = L.layerGroup();
        const bounds: [number, number][] = [];

        markets.forEach((market) => {
          const position = getCoordinatesForMarket(market.name, market.geoLevel);
          bounds.push(position);
          
          const color = getColorForRank(market.rank);
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${color};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 13px;
                cursor: pointer;
                transition: transform 0.2s;
              " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
                ${market.rank}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const leafletMarker = L.marker(position, { icon: customIcon })
            .bindPopup(`
              <div style="padding: 10px; min-width: 200px;">
                <h3 style="font-weight: 600; color: #111827; margin: 0 0 8px 0; font-size: 15px;">${market.name}</h3>
                <div style="border-bottom: 1px solid #e5e7eb; margin-bottom: 8px;"></div>
                <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">
                  <strong>Rank:</strong> #${market.rank}
                </p>
                <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">
                  <strong>${metricName}:</strong> ${formatValue(market.value)}
                </p>
                ${market.opportunityScore ? `
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px 0;">
                    <strong>Opportunity Score:</strong> ${market.opportunityScore.toFixed(0)} (${market.tier})
                  </p>
                ` : ''}
                <p style="font-size: 12px; color: #9ca3af; margin: 8px 0 0 0;">
                  Click marker to view full profile
                </p>
              </div>
            `)
            .on('click', () => {
              onMarketClick(market);
            });
          
          markerGroup.addLayer(leafletMarker);
        });

        markerGroup.addTo(map);

        // Fit bounds to show all markers
        if (bounds.length > 0) {
          try {
            const group = L.featureGroup(bounds.map(pos => L.marker(pos)));
            map.fitBounds(group.getBounds().pad(0.1));
          } catch (e) {
            console.warn('Error fitting bounds:', e);
          }
        }
        
        console.log('🗺️ Map initialization complete');
        setIsLoading(false);
        initializingRef.current = false;
      } catch (error) {
        console.error('❌ Error initializing map:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        setMapError(true);
        setIsLoading(false);
        initializingRef.current = false;
      }
    };

    initMap();

    // Cleanup - only remove the Leaflet map instance, don't manipulate DOM directly
    return () => {
      console.log('🗺️ Cleanup: Removing map instance');
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
          console.log('🗺️ Cleanup: Map instance removed successfully');
        } catch (error) {
          console.warn('🗺️ Cleanup: Error removing map:', error);
        }
        mapInstanceRef.current = null;
      }
      // Don't manipulate innerHTML - let React handle DOM cleanup
    };
  }, [markets, metricName, metricFormat, mapReady]);

  if (markets.length === 0) {
    return (
      <div className="w-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">No markets to display</p>
          <p className="text-sm mt-1">Select a metric to view top markets on the map</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center text-red-600">
          <p className="text-lg font-medium">Unable to load map</p>
          <p className="text-sm mt-1">Please try switching to list view</p>
        </div>
      </div>
    );
  }

  console.log('🗺️ Rendering map container', { isLoading, mapError, mapReady, marketsCount: markets.length });

  return (
    <div 
      key={`map-${metricName}-${markets.length}`}
      className="w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm" 
      style={{ height: '400px', position: 'relative' }}
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      {isLoading && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <div className="text-gray-600">Loading interactive map...</div>
          </div>
        </div>
      )}
    </div>
  );
}

