'use client';

import { useState } from 'react';
import { FileText, Loader, X, Check } from 'lucide-react';
import { CampaignPlannerFormData } from './CampaignPlannerForm';

interface BriefImporterProps {
  onImport: (data: Partial<CampaignPlannerFormData>) => void;
  onCancel: () => void;
}

export default function BriefImporter({ onImport, onCancel }: BriefImporterProps) {
  const [brief, setBrief] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<Partial<CampaignPlannerFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!brief.trim()) {
      setError('Please paste a brief first');
      return;
    }

    setIsParsing(true);
    setError(null);
    setParsedData(null);

    try {
      const response = await fetch('http://localhost:3002/api/campaign-planner/parse-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawBrief: brief }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setParsedData(data.parsed);
      } else {
        throw new Error(data.message || 'Failed to parse brief');
      }
    } catch (err) {
      console.error('Error parsing brief:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse brief');
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = () => {
    if (parsedData) {
      onImport(parsedData);
    }
  };

  const exampleBriefs = [
    {
      name: 'Retail Campaign',
      brief: `Client: Nike
Target Audience: Basketball fans, athletes, sneaker enthusiasts
Campaign Objectives: Product launch awareness, drive pre-orders
Budget: $500K
Geographic Focus: US National
Key Products: New basketball shoe
Timeline: Q1 2025`
    },
    {
      name: 'Healthcare Campaign',
      brief: `Client: LabCorp
Target Audience: Health Seekers, Health Optimizers, Symptom Seekers
Campaign Objectives: Drive awareness, Generate leads, Increase testing appointments
Budget: $250K-$500K
Geographic Focus: US National
Timeline: Q1 2025`
    },
    {
      name: 'B2B SaaS Campaign',
      brief: `Client: Salesforce
Target Audience: Sales leaders, Marketing executives, IT decision-makers
Campaign Objectives: Generate qualified leads, Drive event registrations
Budget: $750K
Geographic Focus: Enterprise markets
Products: Sales Cloud, Marketing Cloud
Timeline: Q4 2024 - Q1 2025`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full h-full sm:h-auto sm:rounded-xl shadow-sovrn-lg sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Import from Brief</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Paste your advertiser brief below and our AI will automatically extract the key information.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Example Briefs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Start Examples
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exampleBriefs.map((example) => (
                <button
                  key={example.name}
                  onClick={() => setBrief(example.brief)}
                  className="px-3 py-2 text-left bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200"
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brief Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Advertiser Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Paste your advertiser brief here...

Example format:
Client: Company Name
Target Audience: Audience 1, Audience 2, Audience 3
Campaign Objectives: Objective 1, Objective 2
Budget: $XXX,XXX
Geographic Focus: Location
Timeline: Q1 2025"
              rows={12}
              className="input w-full resize-none font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Brief Parsed Successfully</h3>
              </div>
              <div className="space-y-2 text-sm">
                {parsedData.advertiserName && (
                  <div>
                    <span className="font-medium text-gray-700">Advertiser:</span>{' '}
                    <span className="text-gray-900">{parsedData.advertiserName}</span>
                  </div>
                )}
                {parsedData.targetAudiences && parsedData.targetAudiences.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Target Audiences:</span>{' '}
                    <span className="text-gray-900">{parsedData.targetAudiences.join(', ')}</span>
                  </div>
                )}
                {parsedData.campaignObjectives && parsedData.campaignObjectives.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Objectives:</span>{' '}
                    <span className="text-gray-900">{parsedData.campaignObjectives.join(', ')}</span>
                  </div>
                )}
                {parsedData.budgetRange && (
                  <div>
                    <span className="font-medium text-gray-700">Budget:</span>{' '}
                    <span className="text-gray-900">{parsedData.budgetRange}</span>
                  </div>
                )}
                {parsedData.geographicFocus && (
                  <div>
                    <span className="font-medium text-gray-700">Geography:</span>{' '}
                    <span className="text-gray-900">{parsedData.geographicFocus}</span>
                  </div>
                )}
                {parsedData.keyProducts && parsedData.keyProducts.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Products:</span>{' '}
                    <span className="text-gray-900">{parsedData.keyProducts.join(', ')}</span>
                  </div>
                )}
                {parsedData.timeline && (
                  <div>
                    <span className="font-medium text-gray-700">Timeline:</span>{' '}
                    <span className="text-gray-900">{parsedData.timeline}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          {!parsedData ? (
            <>
              <button
                onClick={handleParse}
                disabled={isParsing || !brief.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isParsing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Parsing Brief...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Parse Brief
                  </>
                )}
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Check className="w-5 h-5" />
                Apply to Form
              </button>
              <button
                onClick={() => {
                  setParsedData(null);
                  setError(null);
                }}
                className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Parse Again
              </button>
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


