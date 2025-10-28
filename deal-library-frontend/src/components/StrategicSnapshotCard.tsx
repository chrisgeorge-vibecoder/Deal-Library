'use client';

import { StrategicInsight } from '@/types/deal';
import { TrendingUp, TrendingDown, AlertCircle, ChevronRight, Target } from 'lucide-react';

interface StrategicSnapshotCardProps {
  topStrengths: StrategicInsight[];
  bottomConcerns: StrategicInsight[];
  summary: string;
  archetype?: string;
  bestFor?: string[];
  geographicHierarchy?: {
    region?: string;
    state?: string;
    cbsa?: string;
    county?: string;
    city?: string;
  };
}

export default function StrategicSnapshotCard({
  topStrengths,
  bottomConcerns,
  summary,
  archetype,
  bestFor,
  geographicHierarchy
}: StrategicSnapshotCardProps) {
  // Build hierarchy breadcrumb
  const hierarchyPath: string[] = [];
  if (geographicHierarchy) {
    if (geographicHierarchy.region) hierarchyPath.push(geographicHierarchy.region);
    if (geographicHierarchy.state) hierarchyPath.push(geographicHierarchy.state);
    if (geographicHierarchy.cbsa) hierarchyPath.push(geographicHierarchy.cbsa);
    if (geographicHierarchy.county) hierarchyPath.push(geographicHierarchy.county);
    if (geographicHierarchy.city) hierarchyPath.push(geographicHierarchy.city);
  }

  return (
    <div className="bg-gradient-to-br from-brand-gold/10 to-brand-orange/10 border-2 border-brand-gold rounded-lg p-6 mb-6">
      <h3 className="text-lg font-bold text-brand-charcoal mb-2 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Strategic Market Snapshot
      </h3>
      
      {/* Geographic Hierarchy */}
      {hierarchyPath.length > 0 && (
        <div className="mb-3 flex items-center flex-wrap gap-1 text-sm text-neutral-600">
          {hierarchyPath.map((level, index) => (
            <span key={index} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="w-3 h-3" />}
              <span className="font-medium">{level}</span>
            </span>
          ))}
        </div>
      )}
      
      <p className="text-neutral-700 mb-4">{summary}</p>

      {/* Market Archetype */}
      {archetype && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-brand-gold/30">
          <h4 className="font-semibold text-brand-charcoal mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-gold" />
            Market Archetype: <span className="text-brand-gold">{archetype}</span>
          </h4>
          
          {/* Best For */}
          {bestFor && bestFor.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-neutral-900">Best For:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {bestFor.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Over-Index */}
        <div>
          <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Over-Index
          </h4>
          <div className="space-y-2">
            {topStrengths.length > 0 ? (
              topStrengths.map((strength, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border-l-4 border-green-500"
                >
                  <div className="font-medium text-neutral-900 text-sm">
                    {strength.attribute}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {strength.formattedValue}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    {strength.comparison}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No significant strengths identified</p>
            )}
          </div>
        </div>

        {/* Under-Index */}
        <div>
          <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            Under-Index
          </h4>
          <div className="space-y-2">
            {bottomConcerns.length > 0 ? (
              bottomConcerns.map((concern, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border-l-4 border-red-500"
                >
                  <div className="font-medium text-neutral-900 text-sm">
                    {concern.attribute}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {concern.formattedValue}
                  </div>
                  <div className="text-xs text-red-700 mt-1">
                    {concern.comparison}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No significant concerns identified</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

