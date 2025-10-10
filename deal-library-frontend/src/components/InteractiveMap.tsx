'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GeoCard } from '@/types/deal';
import SimpleMapFallback from './SimpleMapFallback';
// Leaflet CSS will be loaded dynamically in useEffect

interface InteractiveMapProps {
  geo: GeoCard;
}

export default function InteractiveMap({ geo }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);

  // Define coordinates for major US regions based on the geo data
  const getCoordinatesForRegion = (region: string) => {
    const coordinates: { [key: string]: [number, number] } = {
      // Major US Cities
      'Los Angeles-Long Beach-Anaheim, CA MSA': [34.0522, -118.2437],
      'San Francisco-Oakland-Berkeley, CA MSA': [37.7749, -122.4194],
      'San Diego-Chula Vista-Carlsbad, CA MSA': [32.7157, -117.1611],
      'New York-Newark-Jersey City, NY-NJ-PA MSA': [40.7128, -74.0060],
      'Chicago-Naperville-Elgin, IL-IN-WI MSA': [41.8781, -87.6298],
      'Dallas-Fort Worth-Arlington, TX MSA': [32.7767, -96.7970],
      'Houston-The Woodlands-Sugar Land, TX MSA': [29.7604, -95.3698],
      'Phoenix-Mesa-Chandler, AZ MSA': [33.4484, -112.0740],
      'Philadelphia-Camden-Wilmington, PA-NJ-DE-MD MSA': [39.9526, -75.1652],
      'San Antonio-New Braunfels, TX MSA': [29.4241, -98.4936],
      'San Jose-Sunnyvale-Santa Clara, CA MSA': [37.3382, -121.8863],
      'Austin-Round Rock-Georgetown, TX MSA': [30.2672, -97.7431],
      'Jacksonville, FL MSA': [30.3322, -81.6557],
      'Fort Worth-Arlington, TX MSA': [32.7555, -97.3308],
      'Columbus, OH MSA': [39.9612, -82.9988],
      'Charlotte-Concord-Gastonia, NC-SC MSA': [35.2271, -80.8431],
      'Seattle-Tacoma-Bellevue, WA MSA': [47.6062, -122.3321],
      'Denver-Aurora-Lakewood, CO MSA': [39.7392, -104.9903],
      'Washington-Arlington-Alexandria, DC-VA-MD-WV MSA': [38.9072, -77.0369],
      'Boston-Cambridge-Newton, MA-NH MSA': [42.3601, -71.0589],
      'El Paso, TX MSA': [31.7619, -106.4850],
      'Nashville-Davidson-Murfreesboro-Franklin, TN MSA': [36.1627, -86.7816],
      'Detroit-Warren-Dearborn, MI MSA': [42.3314, -83.0458],
      'Oklahoma City, OK MSA': [35.4676, -97.5164],
      'Portland-Vancouver-Hillsboro, OR-WA MSA': [45.5152, -122.6784],
      'Las Vegas-Henderson-Paradise, NV MSA': [36.1699, -115.1398],
      'Memphis, TN-MS-AR MSA': [35.1495, -90.0490],
      'Louisville/Jefferson County, KY-IN MSA': [38.2527, -85.7585],
      'Baltimore-Columbia-Towson, MD MSA': [39.2904, -76.6122],
      'Milwaukee-Waukesha-West Allis, WI MSA': [43.0389, -87.9065],
      
      // States
      'California': [36.7783, -119.4179],
      'Texas': [31.9686, -99.9018],
      'Florida': [27.7663, -82.6404],
      'New York State': [42.1657, -74.9481],
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
      
      // International
      'Canada': [56.1304, -106.3468],
      'Mexico': [23.6345, -102.5528],
      'United Kingdom': [55.3781, -3.4360],
      'Germany': [51.1657, 10.4515],
      'France': [46.2276, 2.2137],
      'Italy': [41.8719, 12.5674],
      'Spain': [40.4637, -3.7492],
      'Japan': [36.2048, 138.2529],
      'China': [35.8617, 104.1954],
      'India': [20.5937, 78.9629],
      'Brazil': [14.2350, -51.9253],
      'Australia': [25.2744, 133.7751],
      
      // Pattern matching for partial names
      'Los Angeles': [34.0522, -118.2437],
      'San Francisco': [37.7749, -122.4194],
      'San Diego': [32.7157, -117.1611],
      'New York': [40.7128, -74.0060],
      'Chicago': [41.8781, -87.6298],
      'Dallas': [32.7767, -96.7970],
      'Houston': [29.7604, -95.3698],
      'Phoenix': [33.4484, -112.0740],
      'Philadelphia': [39.9526, -75.1652],
      'San Antonio': [29.4241, -98.4936],
      'San Jose': [37.3382, -121.8863],
      'Austin': [30.2672, -97.7431],
      'Seattle': [47.6062, -122.3321],
      'Denver': [39.7392, -104.9903],
      'Washington DC': [38.9072, -77.0369],
      'Boston': [42.3601, -71.0589],
      'Nashville': [36.1627, -86.7816],
      'Detroit': [42.3314, -83.0458],
      'Portland': [45.5152, -122.6784],
      'Las Vegas': [36.1699, -115.1398],
      'Memphis': [35.1495, -90.0490],
      'Baltimore': [39.2904, -76.6122],
      'Milwaukee': [43.0389, -87.9065],
    };

    // Direct match first
    if (coordinates[region]) {
      return coordinates[region];
    }

    // Pattern matching for partial names
    for (const [key, coords] of Object.entries(coordinates)) {
      if (region.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(region.toLowerCase())) {
        return coords;
      }
    }

    // Default to center of US
    return [39.8283, -98.5795];
  };

  // Create markers from geo data
  const markers = geo.topMarkets.map((market, index) => {
    const position = getCoordinatesForRegion(market.region);
    return {
      position,
      region: market.region,
      percentage: market.percentage,
      rank: index + 1
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Load Leaflet CSS dynamically to avoid bundling issues
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

    // Load CSS first
    loadLeafletCSS();

    // Dynamically import Leaflet only on client side
    const initMap = async () => {
      try {
        console.log('🗺️ Initializing map...');
        const L = await import('leaflet');
        console.log('🗺️ Leaflet imported successfully');
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Check if map is already initialized and clean it up properly
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.off();
            mapInstanceRef.current.remove();
          } catch (e) {
            console.warn('Error cleaning up map:', e);
          }
          mapInstanceRef.current = null;
        }

        // Ensure container is ready and clear
        if (!mapRef.current) {
          console.error('Map container not available');
          return;
        }
        
        mapRef.current.innerHTML = '';

        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize map with error handling
        console.log('🗺️ Creating map container:', mapRef.current);
        const map = L.map(mapRef.current!, {
          zoomControl: true,
          attributionControl: true
        }).setView([39.8283, -98.5795], 4);
        
        console.log('🗺️ Map created successfully');
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add markers
        const markerGroup = L.layerGroup();
        markers.forEach((marker) => {
          const colors = ['#dc2626', '#ea580c', '#d97706', '#65a30d', '#059669'];
          const color = colors[Math.min(marker.rank - 1, colors.length - 1)];
          
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 12px;
              ">
                ${marker.rank}
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          const leafletMarker = L.marker(marker.position as [number, number], { icon: customIcon })
            .bindPopup(`
              <div style="padding: 8px;">
                <h3 style="font-weight: 600; color: #111827; margin: 0 0 4px 0;">${marker.region}</h3>
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 4px 0;">Rank: #${marker.rank}</p>
                <p style="font-size: 14px; font-weight: 500; color: #2563eb; margin: 0 0 4px 0;">${marker.percentage}</p>
                <p style="font-size: 12px; color: #6b7280; margin: 0;">
                  ${geo.audienceName} concentration
                </p>
              </div>
            `);
          
          markerGroup.addLayer(leafletMarker);
        });

        markerGroup.addTo(map);

        // Fit bounds to show all markers
        if (markers.length > 0) {
          try {
            const group = L.featureGroup(markers.map(m => L.marker(m.position as [number, number])));
            map.fitBounds(group.getBounds().pad(0.1));
          } catch (e) {
            console.warn('Error fitting bounds:', e);
          }
        }
      } catch (error) {
        console.error('🗺️ Error initializing map:', error);
        console.error('🗺️ Map ref:', mapRef.current);
        setMapError(true);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.warn('Error removing map:', error);
        }
        mapInstanceRef.current = null;
      }
      // Clear the container
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [geo.audienceName, geo.topMarkets]);

  if (mapError) {
    return <SimpleMapFallback geo={geo} />;
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}