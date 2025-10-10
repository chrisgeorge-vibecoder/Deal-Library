/**
 * ZIP Code Map Component
 * Interactive map displaying ZIP code data with clustering and markers
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Users, DollarSign } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface ZipCodeMapProps {
  zipCodeInsights: any[];
  searchType: 'location' | 'audience-segment';
}

export default function ZipCodeMap({ zipCodeInsights, searchType }: ZipCodeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  const [selectedZip, setSelectedZip] = useState<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current || zipCodeInsights.length === 0) return;

      try {
        // Dynamic import of Leaflet
        const L = await import('leaflet');
        
        // Fix for default markers in Leaflet with Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Calculate center point from ZIP codes
        const validCoords = zipCodeInsights.filter(zip => 
          zip.zipCodeData?.latitude && zip.zipCodeData?.longitude
        );

        if (validCoords.length === 0) {
          setMapError(true);
          return;
        }

        const centerLat = validCoords.reduce((sum, zip) => sum + zip.zipCodeData.latitude, 0) / validCoords.length;
        const centerLng = validCoords.reduce((sum, zip) => sum + zip.zipCodeData.longitude, 0) / validCoords.length;

        // Create map
        const map = L.map(mapRef.current).setView([centerLat, centerLng], 10);
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Create custom marker icons based on income levels
        const createCustomIcon = (income: number, population: number) => {
          const size = Math.max(15, Math.min(30, population / 1000)); // Size based on population
          let color = '#3B82F6'; // Default blue
          
          if (income > 100000) color = '#10B981'; // Green for high income
          else if (income > 75000) color = '#F59E0B'; // Orange for medium-high income
          else if (income > 50000) color = '#EF4444'; // Red for medium income
          else color = '#6B7280'; // Gray for lower income

          return L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 2px solid white;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 10px;
                font-weight: bold;
              ">
                $
              </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });
        };

        // Add markers for each ZIP code
        validCoords.forEach(zip => {
          const { latitude, longitude } = zip.zipCodeData;
          const income = zip.zipCodeData.medianIncome || zip.censusData?.medianIncome || 0;
          const population = zip.zipCodeData.population || 0;
          
          const marker = L.marker([latitude, longitude], {
            icon: createCustomIcon(income, population)
          }).addTo(map);

          // Create popup content
          const popupContent = `
            <div style="min-width: 200px; font-family: system-ui;">
              <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #1F2937;">
                ZIP Code ${zip.zipCode}
              </div>
              <div style="margin-bottom: 6px; font-size: 12px; color: #6B7280;">
                ${zip.zipCodeData.city || 'Unknown'}, ${zip.zipCodeData.state || 'Unknown'}
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px; font-size: 12px;">
                <span style="color: #3B82F6;">👥</span>
                <span style="margin-left: 6px;">${population.toLocaleString()} people</span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px; font-size: 12px;">
                <span style="color: #10B981;">💰</span>
                <span style="margin-left: 6px;">$${income.toLocaleString()} median income</span>
              </div>
              ${zip.censusData?.medianAge ? `
                <div style="display: flex; align-items: center; font-size: 12px;">
                  <span style="color: #F59E0B;">👤</span>
                  <span style="margin-left: 6px;">${zip.censusData.medianAge} median age</span>
                </div>
              ` : ''}
            </div>
          `;

          marker.bindPopup(popupContent);
          
          // Add click handler for selection
          marker.on('click', () => {
            setSelectedZip(zip);
          });
        });

        // Fit map to show all markers
        if (validCoords.length > 1) {
          const group = new (L as any).featureGroup(validCoords.map(zip => 
            (L as any).marker([zip.zipCodeData.latitude, zip.zipCodeData.longitude])
          ));
          map.fitBounds(group.getBounds().pad(0.1));
        }

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [zipCodeInsights]);

  if (mapError) {
    return (
      <div className="bg-white rounded-xl shadow-sovrn border border-neutral-200 p-8">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Map Unavailable</h3>
          <p className="text-neutral-600">
            Unable to display map. ZIP code location data may be missing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sovrn border border-neutral-200">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Geographic Distribution
        </h2>
        <p className="text-sm text-neutral-600 mt-1">
          {zipCodeInsights.length} ZIP codes mapped • Click markers for details
        </p>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-b-xl"
          style={{ minHeight: '400px' }}
        />
        
        {/* Map Legend */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-neutral-200">
          <div className="text-xs font-medium text-neutral-700 mb-2">Income Legend</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-neutral-600">$100K+</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-neutral-600">$75K-$100K</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-neutral-600">$50K-$75K</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-xs text-neutral-600">Under $50K</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected ZIP Code Details */}
      {selectedZip && (
        <div className="p-6 border-t border-neutral-200 bg-blue-50">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Selected ZIP Code: {selectedZip.zipCode}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-neutral-900">Population</div>
                <div className="text-sm text-neutral-600">
                  {(selectedZip.zipCodeData?.population || 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-sm font-medium text-neutral-900">Median Income</div>
                <div className="text-sm text-neutral-600">
                  ${(selectedZip.zipCodeData?.medianIncome || selectedZip.censusData?.medianIncome || 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-neutral-900">Location</div>
                <div className="text-sm text-neutral-600">
                  {selectedZip.zipCodeData?.city || 'Unknown'}, {selectedZip.zipCodeData?.state || 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
