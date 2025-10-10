import { DealFilters } from '@/types/deal';
import { X } from 'lucide-react';

interface FilterPanelProps {
  filters: DealFilters;
  onFiltersChange: (filters: DealFilters) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterPanel({ filters, onFiltersChange, isOpen, onClose }: FilterPanelProps) {
  if (!isOpen) return null;

  const handleFilterChange = (key: keyof DealFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  // Filter options for the new schema
  const targetingOptions = ['Premium mobile users', 'Web publishers', 'Enterprise IT departments', 'Data scientists', 'Social media marketers', 'Entertainment enthusiasts', 'Music listeners', 'Gen Z'];
  const environmentOptions = ['Production', 'Staging', 'Pending', 'Development'];
  const mediaTypeOptions = ['Mobile Display', 'Web Display', 'Cloud Services', 'Data Services', 'Social Media Ads', 'Video Ads', 'Audio Ads', 'Internal Tool'];

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value,
      },
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      targeting: '',
      environment: '',
      mediaType: '',
      dateRange: { start: '', end: '' },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end">
      <div className="bg-white w-96 h-full shadow-xl overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Targeting Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Targeting
            </label>
            <select
              value={filters.targeting || ''}
              onChange={(e) => handleFilterChange('targeting', e.target.value)}
              className="input w-full"
            >
              <option value="">All Targeting</option>
              {targetingOptions.map((targeting) => (
                <option key={targeting} value={targeting}>
                  {targeting}
                </option>
              ))}
            </select>
          </div>

          {/* Environment Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment
            </label>
            <select
              value={filters.environment || ''}
              onChange={(e) => handleFilterChange('environment', e.target.value)}
              className="input w-full"
            >
              <option value="">All Environments</option>
              {environmentOptions.map((environment) => (
                <option key={environment} value={environment}>
                  {environment}
                </option>
              ))}
            </select>
          </div>

          {/* Media Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Type
            </label>
            <select
              value={filters.mediaType || ''}
              onChange={(e) => handleFilterChange('mediaType', e.target.value)}
              className="input w-full"
            >
              <option value="">All Media Types</option>
              {mediaTypeOptions.map((mediaType) => (
                <option key={mediaType} value={mediaType}>
                  {mediaType}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flight Date Range
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="pt-4 border-t">
            <button
              onClick={clearFilters}
              className="w-full btn-secondary"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}