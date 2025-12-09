'use client';

import { MarketInsightsMetric } from '@/types/deal';

interface MetricSelectorProps {
  metrics: MarketInsightsMetric[];
  selectedMetric: string;
  onMetricChange: (metricId: string) => void;
}

export default function MetricSelector({
  metrics,
  selectedMetric,
  onMetricChange
}: MetricSelectorProps) {
  // Group metrics by category
  const metricsByCategory = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, MarketInsightsMetric[]>);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        Select Market Attribute
      </label>
      <select
        value={selectedMetric}
        onChange={(e) => onMetricChange(e.target.value)}
        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold transition-colors"
      >
        <option value="">Choose a metric...</option>
        {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
          <optgroup key={category} label={category}>
            {categoryMetrics.map((metric) => (
              <option key={metric.id} value={metric.id}>
                {metric.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {selectedMetric && (
        <p className="mt-2 text-sm text-neutral-600">
          {metrics.find(m => m.id === selectedMetric)?.description}
        </p>
      )}
    </div>
  );
}

