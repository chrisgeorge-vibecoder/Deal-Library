'use client';

import React from 'react';
import { GeoCard } from '@/types/deal';
import { MapPin } from 'lucide-react';

interface SimpleMapFallbackProps {
  geo: GeoCard;
}

export default function SimpleMapFallback({ geo }: SimpleMapFallbackProps) {
  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-6 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{geo.audienceName}</h3>
            <p className="text-sm text-gray-600">Geographic Distribution</p>
          </div>
        </div>

        {/* Top Markets */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Markets</h4>
          {geo.topMarkets.slice(0, 5).map((market, index) => {
            const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500'];
            const color = colors[index] || 'bg-gray-500';
            
            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{market.region}</div>
                  <div className="text-xs text-gray-500">{market.percentage}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Total Addressable: {geo.totalAddressable}
          </div>
        </div>
      </div>
    </div>
  );
}


