'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';

interface GeographicHotspot {
  zipCode: string;
  city: string;
  state: string;
  density: number;
  population?: number;
  overIndex?: number;
}

interface AudienceInsightsMapProps {
  hotspots: GeographicHotspot[];
  segmentName: string;
}

export default function AudienceInsightsMap({ hotspots, segmentName }: AudienceInsightsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);

  // Memoize hotspots to prevent unnecessary re-renders
  const memoizedHotspots = useMemo(() => hotspots || [], [hotspots]);
  
  // Memoize props to prevent unnecessary re-renders
  const memoizedProps = useMemo(() => ({
    hotspotsCount: memoizedHotspots?.length || 0,
    segmentName,
    hotspots: memoizedHotspots
  }), [memoizedHotspots, segmentName]);

  // Reduced logging - only log when props actually change
  const prevPropsRef = useRef({ hotspotsCount: 0, segmentName: '', hotspotsHash: '' });
  
  // Create a simple hash of hotspots to detect changes
  const hotspotsHash = JSON.stringify(memoizedProps.hotspots.map(h => `${h.zipCode}-${h.density}`));
  
  if (prevPropsRef.current.hotspotsCount !== memoizedProps.hotspotsCount || 
      prevPropsRef.current.segmentName !== memoizedProps.segmentName ||
      prevPropsRef.current.hotspotsHash !== hotspotsHash) {
    console.log('🗺️ [DEBUG] AudienceInsightsMap props changed:', memoizedProps);
    prevPropsRef.current = { 
      hotspotsCount: memoizedProps.hotspotsCount, 
      segmentName: memoizedProps.segmentName,
      hotspotsHash: hotspotsHash
    };
  }

  // Simple geocoding based on city/state
  const getCityCoordinates = (city: string, state: string): [number, number] | null => {
    const coordinates: { [key: string]: [number, number] } = {
      // Major US Cities by State
      'Chicago, Illinois': [41.8781, -87.6298],
      'Dallas, Texas': [32.7767, -96.7970],
      'Atlanta, Georgia': [33.7490, -84.3880],
      'New York, New York': [40.7128, -74.0060],
      'Jersey City, New Jersey': [40.7178, -74.0431],
      'Brooklyn, New York': [40.6782, -73.9442],
      'Westminster, California': [33.7513, -117.9940],
      'Houston, Texas': [29.7604, -95.3698],
      'Washington, District of Columbia': [38.9072, -77.0369],
      'Stockbridge, Georgia': [33.5443, -84.2338],
      'Chesapeake, Virginia': [36.7682, -76.2875],
      'Las Vegas, Nevada': [36.1699, -115.1398],
      'Miami, Florida': [25.7617, -80.1918],
      'Fontana, California': [34.0922, -117.4350],
      'Philadelphia, Pennsylvania': [39.9526, -75.1652],
      'Detroit, Michigan': [42.3314, -83.0458],
      'Phoenix, Arizona': [33.4484, -112.0740],
      'Jacksonville, Florida': [30.3322, -81.6557],
      'Revere, Massachusetts': [42.4084, -71.0120],
      'Nashville, Tennessee': [36.1627, -86.7816],
      'Tacoma, Washington': [47.2529, -122.4443],
      'Hyattsville, Maryland': [38.9559, -76.9455],
      'Milwaukee, Wisconsin': [43.0389, -87.9065],
      'Fort Worth, Texas': [32.7555, -97.3308],
      'Caldwell, Idaho': [43.6629, -116.6874],
      'Stockton, California': [37.9577, -121.2908],
      'Los Angeles, California': [34.0522, -118.2437],
      'Pittsburgh, Pennsylvania': [40.4406, -79.9959],
      
      // State capitals for fallback
      'Sacramento, California': [38.5816, -121.4944],
      'Austin, Texas': [30.2672, -97.7431],
      'Boston, Massachusetts': [42.3601, -71.0589],
      'Denver, Colorado': [39.7392, -104.9903],
      'Seattle, Washington': [47.6062, -122.3321],
      'Portland, Oregon': [45.5152, -122.6784],
      'Minneapolis, Minnesota': [44.9778, -93.2650],
      'Columbus, Ohio': [39.9612, -82.9988],
      'Indianapolis, Indiana': [39.7684, -86.1581],
      'San Francisco, California': [37.7749, -122.4194],
      'San Diego, California': [32.7157, -117.1611],
      'San Jose, California': [37.3382, -121.8863],
      'Baltimore, Maryland': [39.2904, -76.6122],
      'Memphis, Tennessee': [35.1495, -90.0490],
      'Louisville, Kentucky': [38.2527, -85.7585],
      'Charlotte, North Carolina': [35.2271, -80.8431],
    };

    const key = `${city}, ${state}`;
    if (coordinates[key]) {
      return coordinates[key];
    }

    // Try partial matching
    for (const [location, coords] of Object.entries(coordinates)) {
      if (location.toLowerCase().includes(city.toLowerCase()) && 
          location.toLowerCase().includes(state.toLowerCase())) {
        return coords;
      }
    }

    // Fallback: use state centers
    const stateCenters: { [key: string]: [number, number] } = {
      'Alabama': [32.8067, -86.7911],
      'Alaska': [61.3707, -152.4044],
      'Arizona': [33.7298, -111.4312],
      'Arkansas': [34.9697, -92.3731],
      'California': [36.7783, -119.4179],
      'Colorado': [39.0598, -105.3111],
      'Connecticut': [41.5978, -72.7554],
      'Delaware': [39.3185, -75.5071],
      'District of Columbia': [38.9072, -77.0369],
      'Florida': [27.7663, -82.6404],
      'Georgia': [33.0406, -83.6431],
      'Hawaii': [21.0943, -157.4983],
      'Idaho': [44.2405, -114.4788],
      'Illinois': [40.3363, -89.0022],
      'Indiana': [39.7909, -86.1477],
      'Iowa': [42.0115, -93.2105],
      'Kansas': [38.5266, -96.7265],
      'Kentucky': [37.6681, -84.6701],
      'Louisiana': [31.1695, -91.8678],
      'Maine': [44.3235, -69.7653],
      'Maryland': [39.0639, -76.8021],
      'Massachusetts': [42.2373, -71.5314],
      'Michigan': [43.3266, -84.5361],
      'Minnesota': [46.7296, -94.6859],
      'Mississippi': [32.7673, -89.6812],
      'Missouri': [38.4561, -92.2884],
      'Montana': [47.0526, -110.4544],
      'Nebraska': [41.1254, -98.2681],
      'Nevada': [38.4199, -117.1219],
      'New Hampshire': [43.4525, -71.5639],
      'New Jersey': [40.2989, -74.5210],
      'New Mexico': [34.8405, -106.2485],
      'New York': [42.1657, -74.9481],
      'North Carolina': [35.6300, -79.8064],
      'North Dakota': [47.5289, -99.7840],
      'Ohio': [40.3888, -82.7649],
      'Oklahoma': [35.5653, -96.9289],
      'Oregon': [44.5721, -122.0709],
      'Pennsylvania': [41.2033, -77.1945],
      'Rhode Island': [41.6809, -71.5118],
      'South Carolina': [33.8569, -80.9450],
      'South Dakota': [44.2998, -99.4388],
      'Tennessee': [35.7478, -86.6923],
      'Texas': [31.9686, -99.9018],
      'Utah': [40.1500, -111.8624],
      'Vermont': [44.0459, -72.7107],
      'Virginia': [37.7693, -78.1699],
      'Washington': [47.4009, -121.4905],
      'West Virginia': [38.4912, -80.9545],
      'Wisconsin': [44.2685, -89.6165],
      'Wyoming': [42.7555, -107.3025],
    };

    if (stateCenters[state]) {
      return stateCenters[state];
    }

    return null;
  };

  // Create markers from hotspots using memoized props - memoize this expensive operation
  const markers = useMemo(() => {
    return memoizedProps.hotspots.map((hotspot, index) => {
      // Reduced logging - only log first few and errors
      if (index < 3) {
        console.log(`🗺️ [DEBUG] Processing hotspot ${index + 1}:`, hotspot);
      }
      const position = getCityCoordinates(hotspot.city, hotspot.state);
      
      if (!position) {
        console.warn(`⚠️ [DEBUG] No coordinates found for: ${hotspot.city}, ${hotspot.state}`);
        return null;
      }
      
      if (index < 3) {
        console.log(`✅ [DEBUG] Coordinates for ${hotspot.city}, ${hotspot.state}:`, position);
      }
      
      return {
        position,
        city: hotspot.city,
        state: hotspot.state,
        zipCode: hotspot.zipCode,
        density: hotspot.density,
        population: hotspot.population,
        overIndex: hotspot.overIndex,
        rank: index + 1
      };
    }).filter(Boolean) as Array<{
      position: [number, number];
      city: string;
      state: string;
      zipCode: string;
      density: number;
      population?: number;
      overIndex?: number;
      rank: number;
    }>;
  }, [memoizedProps.hotspots]);

  // Reduced logging - only log when marker count changes significantly
  if (markers.length > 0 && markers.length % 5 === 0) {
    console.log('🗺️ [DEBUG] Total markers created:', markers.length);
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) {
      console.log('🗺️ [DEBUG] Skipping map init - window or ref not ready');
      return;
    }

    // Load Leaflet CSS dynamically
    const loadLeafletCSS = () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
    };

    loadLeafletCSS();

    // Initialize map
    const initMap = async () => {
      try {
        // Double-check mapRef before proceeding
        if (!mapRef.current) {
          console.warn('🗺️ mapRef.current is null, aborting map init');
          return;
        }
        
        console.log('🗺️ Initializing Audience Insights map...');
        const L = await import('leaflet');
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Aggressive cleanup of existing map
        if (mapInstanceRef.current) {
          console.log('🗺️ [DEBUG] Cleaning up existing map instance');
          try {
            mapInstanceRef.current.off();
            mapInstanceRef.current.remove();
          } catch (e) {
            console.warn('🗺️ [DEBUG] Error cleaning up map:', e);
          }
          mapInstanceRef.current = null;
        }

        if (!mapRef.current) {
          console.log('🗺️ [DEBUG] Map ref lost, aborting');
          return;
        }
        
        // Clear container and remove any Leaflet data
        mapRef.current.innerHTML = '';
        mapRef.current.className = 'w-full h-full';
        (mapRef.current as any)._leaflet_id = undefined;

        await new Promise(resolve => setTimeout(resolve, 150));

        // Additional safety check before creating map
        if (!mapRef.current || mapRef.current.offsetWidth === 0) {
          console.warn('🗺️ Map container not properly sized, aborting');
          setMapError(true);
          return;
        }

        // Create map
        const map = L.map(mapRef.current!, {
          zoomControl: true,
          attributionControl: true,
          tap: false  // Disable tap handler to prevent some mobile errors
        }).setView([39.8283, -98.5795], 4);
        
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add markers
        const markerGroup = L.layerGroup();
        const maxDensity = Math.max(...markers.map(m => m.density));
        
        markers.forEach((marker) => {
          // Color scale from red (high) to green (low)
          const colors = ['#dc2626', '#ea580c', '#f59e0b', '#10b981', '#3b82f6'];
          const color = colors[Math.min(marker.rank - 1, colors.length - 1)];
          
          // Size based on density
          const sizeScale = Math.max(20, Math.min(50, 20 + (marker.density / maxDensity) * 30));
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${color};
                width: ${sizeScale}px;
                height: ${sizeScale}px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: ${Math.max(10, sizeScale / 3)}px;
              ">
                ${marker.rank}
              </div>
            `,
            iconSize: [sizeScale, sizeScale],
            iconAnchor: [sizeScale / 2, sizeScale / 2],
          });

          const leafletMarker = L.marker(marker.position, { icon: customIcon })
            .bindPopup(`
              <div style="padding: 8px; min-width: 200px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                  <div style="
                    background-color: ${color};
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                    font-size: 12px;
                  ">${marker.rank}</div>
                  <h3 style="font-weight: 600; color: #111827; margin: 0; flex: 1;">${marker.city}, ${marker.state}</h3>
                </div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
                  ZIP: ${marker.zipCode}
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #2563eb; margin-bottom: 4px;">
                  Volume: ${marker.density.toLocaleString()}
                </div>
                ${marker.population ? `
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">
                    Population: ${marker.population.toLocaleString()}
                  </div>
                ` : ''}
                ${marker.overIndex ? `
                  <div style="font-size: 12px; font-weight: 600; color: ${marker.overIndex > 300 ? '#16a34a' : marker.overIndex > 150 ? '#2563eb' : '#6b7280'};">
                    Over-Index: ${marker.overIndex.toFixed(0)}% ${marker.overIndex > 300 ? '⭐⭐⭐' : marker.overIndex > 150 ? '⭐⭐' : ''}
                  </div>
                ` : ''}
                <div style="font-size: 11px; color: #9ca3af; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  ${segmentName} concentration
                </div>
              </div>
            `);
          
          markerGroup.addLayer(leafletMarker);
        });

        markerGroup.addTo(map);

        // Fit bounds to show all markers
        if (markers.length > 0) {
          try {
            const bounds = L.latLngBounds(markers.map(m => m.position));
            map.fitBounds(bounds.pad(0.2));
          } catch (e) {
            console.warn('Error fitting bounds:', e);
          }
        }

        console.log('✅ Map initialized successfully with', markers.length, 'markers');
      } catch (error) {
        console.error('❌ Error initializing map:', error);
        setMapError(true);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        mapInstanceRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [hotspots, segmentName]);

  if (mapError) {
    return (
      <div className="bg-yellow-50 rounded-lg p-8 border border-yellow-200 text-center">
        <p className="text-yellow-800">Unable to load interactive map. Please check your internet connection.</p>
        <p className="text-sm text-yellow-600 mt-2">Map markers: {markers.length} locations</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}

