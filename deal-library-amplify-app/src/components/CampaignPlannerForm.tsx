'use client';

import { useState, useEffect } from 'react';
import { Plus, X, FileText, Loader, Sparkles } from 'lucide-react';
import BriefImporter from './BriefImporter';

interface CampaignPlannerFormProps {
  onSubmit: (formData: CampaignPlannerFormData) => void;
  disabled?: boolean;
}

export interface CampaignPlannerFormData {
  advertiserName?: string;
  targetAudiences: string[];
  campaignObjectives?: string[];
  budgetRange?: string;
  geographicFocus?: string;
  keyProducts?: string[];
  timeline?: string;
  additionalContext?: string;
}

const OBJECTIVE_OPTIONS = [
  'Brand Awareness',
  'Lead Generation',
  'Drive Sales',
  'Customer Acquisition',
  'Product Launch',
  'Increase Engagement',
  'Drive Traffic',
  'Market Expansion',
];

export default function CampaignPlannerForm({ onSubmit, disabled = false }: CampaignPlannerFormProps) {
  const [formData, setFormData] = useState<CampaignPlannerFormData>({
    advertiserName: '',
    targetAudiences: [],
    campaignObjectives: [],
    budgetRange: '',
    geographicFocus: '',
    keyProducts: [],
    timeline: '',
    additionalContext: '',
  });

  const [currentAudience, setCurrentAudience] = useState('');
  const [currentProduct, setCurrentProduct] = useState('');
  const [showBriefImporter, setShowBriefImporter] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load saved form data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('campaign_planner_form_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {
        console.error('Error loading saved form data:', e);
      }
    }
  }, []);

  // Save form data to localStorage
  useEffect(() => {
    localStorage.setItem('campaign_planner_form_data', JSON.stringify(formData));
  }, [formData]);

  const handleAddAudience = () => {
    if (currentAudience.trim()) {
      setFormData(prev => ({
        ...prev,
        targetAudiences: [...prev.targetAudiences, currentAudience.trim()]
      }));
      setCurrentAudience('');
      setErrors(prev => ({ ...prev, targetAudiences: '' }));
    }
  };

  const handleRemoveAudience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      targetAudiences: prev.targetAudiences.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = () => {
    if (currentProduct.trim()) {
      setFormData(prev => ({
        ...prev,
        keyProducts: [...(prev.keyProducts || []), currentProduct.trim()]
      }));
      setCurrentProduct('');
    }
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyProducts: prev.keyProducts?.filter((_, i) => i !== index)
    }));
  };

  const handleObjectiveToggle = (objective: string) => {
    setFormData(prev => {
      const objectives = prev.campaignObjectives || [];
      const hasObjective = objectives.includes(objective);
      return {
        ...prev,
        campaignObjectives: hasObjective
          ? objectives.filter(o => o !== objective)
          : [...objectives, objective]
      };
    });
  };

  const handleBriefImport = (parsedData: Partial<CampaignPlannerFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...parsedData,
      targetAudiences: parsedData.targetAudiences || prev.targetAudiences,
      campaignObjectives: parsedData.campaignObjectives || prev.campaignObjectives,
      keyProducts: parsedData.keyProducts || prev.keyProducts,
    }));
    setShowBriefImporter(false);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.targetAudiences.length === 0) {
      newErrors.targetAudiences = 'At least one target audience is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all fields?')) {
      setFormData({
        advertiserName: '',
        targetAudiences: [],
        campaignObjectives: [],
        budgetRange: '',
        geographicFocus: '',
        keyProducts: [],
        timeline: '',
        additionalContext: '',
      });
      localStorage.removeItem('campaign_planner_form_data');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Campaign Details</h2>
        <button
          type="button"
          onClick={() => setShowBriefImporter(true)}
          className="flex items-center gap-2 px-4 py-2 text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
        >
          <FileText className="w-4 h-4" />
          Import from Brief
        </button>
      </div>

      {showBriefImporter && (
        <BriefImporter
          onImport={handleBriefImport}
          onCancel={() => setShowBriefImporter(false)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Advertiser Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Advertiser Name
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.advertiserName}
            onChange={(e) => setFormData(prev => ({ ...prev, advertiserName: e.target.value }))}
            placeholder="e.g., Nike, Starbucks, Tesla"
            className="input w-full"
            disabled={disabled}
          />
        </div>

        {/* Target Audiences (Required) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audiences
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={currentAudience}
              onChange={(e) => setCurrentAudience(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAudience();
                }
              }}
              placeholder="e.g., Basketball fans, Athletes, Sneaker enthusiasts"
              className={`input flex-1 ${errors.targetAudiences ? 'border-red-500' : ''}`}
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleAddAudience}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              disabled={disabled}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          {errors.targetAudiences && (
            <p className="text-red-500 text-sm mb-2">{errors.targetAudiences}</p>
          )}
          {formData.targetAudiences.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.targetAudiences.map((audience, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium"
                >
                  {audience}
                  <button
                    type="button"
                    onClick={() => handleRemoveAudience(index)}
                    className="hover:text-purple-900"
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Objectives */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Objectives
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {OBJECTIVE_OPTIONS.map((objective) => (
              <button
                key={objective}
                type="button"
                onClick={() => handleObjectiveToggle(objective)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.campaignObjectives?.includes(objective)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={disabled}
              >
                {objective}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Range
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.budgetRange}
            onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
            placeholder="e.g., $100K-$250K, $1M+"
            className="input w-full"
            disabled={disabled}
          />
        </div>

        {/* Geographic Focus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Geographic Focus
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.geographicFocus}
            onChange={(e) => setFormData(prev => ({ ...prev, geographicFocus: e.target.value }))}
            placeholder="e.g., US National, Northeast US, Major metros"
            className="input w-full"
            disabled={disabled}
          />
        </div>

        {/* Key Products/Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Products/Services
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={currentProduct}
              onChange={(e) => setCurrentProduct(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddProduct();
                }
              }}
              placeholder="e.g., Basketball shoes, Athletic apparel"
              className="input flex-1"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={handleAddProduct}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              disabled={disabled}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          {formData.keyProducts && formData.keyProducts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.keyProducts.map((product, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
                >
                  {product}
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="hover:text-gray-900"
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Timeline
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.timeline}
            onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
            placeholder="e.g., Q1 2025, January-March 2025"
            className="input w-full"
            disabled={disabled}
          />
        </div>

        {/* Additional Context */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Context
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData.additionalContext}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
            placeholder="Any additional details about the campaign, target market, or specific requirements..."
            rows={4}
            className="input w-full resize-none"
            disabled={disabled}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={disabled || formData.targetAudiences.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {disabled ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Campaign
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={disabled}
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}






