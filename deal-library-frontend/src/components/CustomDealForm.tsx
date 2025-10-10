import { X, Send } from 'lucide-react';
import { useState } from 'react';

interface CustomDealFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomDealForm({ isOpen, onClose }: CustomDealFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    campaignObjectives: '',
    targetAudience: '',
    budget: '',
    timeline: '',
    additionalNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Custom deal request submitted:', formData);
    // TODO: Submit to backend API
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-sovrn-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Don't see a Deal that matches your campaign objectives?</h2>
              <p className="text-neutral-600 mt-2">Request a custom deal tailored to your specific needs.</p>
            </div>
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="input w-full"
                placeholder="Your company name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="input w-full"
                placeholder="your.email@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Campaign Objectives *
            </label>
            <textarea
              value={formData.campaignObjectives}
              onChange={(e) => handleChange('campaignObjectives', e.target.value)}
              className="input w-full min-h-[100px] resize-none"
              placeholder="Describe your campaign goals, objectives, and what you're trying to achieve..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Target Audience *
            </label>
            <textarea
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              className="input w-full min-h-[80px] resize-none"
              placeholder="Who are you trying to reach? Include demographics, interests, behaviors, etc."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Budget Range
              </label>
              <select
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                className="input w-full"
              >
                <option value="">Select budget range</option>
                <option value="under-10k">Under $10,000</option>
                <option value="10k-50k">$10,000 - $50,000</option>
                <option value="50k-100k">$50,000 - $100,000</option>
                <option value="100k-500k">$100,000 - $500,000</option>
                <option value="500k-1m">$500,000 - $1,000,000</option>
                <option value="over-1m">Over $1,000,000</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Timeline
              </label>
              <select
                value={formData.timeline}
                onChange={(e) => handleChange('timeline', e.target.value)}
                className="input w-full"
              >
                <option value="">Select timeline</option>
                <option value="asap">ASAP</option>
                <option value="1-month">Within 1 month</option>
                <option value="3-months">Within 3 months</option>
                <option value="6-months">Within 6 months</option>
                <option value="1-year">Within 1 year</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => handleChange('additionalNotes', e.target.value)}
              className="input w-full min-h-[80px] resize-none"
              placeholder="Any additional information, specific requirements, or questions..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

