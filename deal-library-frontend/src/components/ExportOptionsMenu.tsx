'use client';

import { useState } from 'react';
import { Copy, Printer, Check } from 'lucide-react';
import { ComprehensiveReport } from '@/types/agentMode';

interface ExportOptionsMenuProps {
  report: ComprehensiveReport;
}

export default function ExportOptionsMenu({ report }: ExportOptionsMenuProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      // Get the main document container
      const documentContent = document.querySelector('.bg-white.rounded-lg.shadow-sm.border.border-gray-200.p-8');
      
      if (!documentContent) {
        console.error('Could not find document content');
        return;
      }

      // Create a blob with HTML content that preserves formatting
      const htmlContent = documentContent.innerHTML;
      
      // Use the Clipboard API to copy both HTML and plain text
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([documentContent.textContent || ''], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: copy as plain text
      try {
        const documentContent = document.querySelector('.bg-white.rounded-lg.shadow-sm.border.border-gray-200.p-8');
        if (documentContent?.textContent) {
          await navigator.clipboard.writeText(documentContent.textContent);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
      }
    }
  };

  const handlePrint = () => {
    // Create a temporary div with the markdown content
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${report.advertiserName} Campaign Plan</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 { color: #1a202c; font-size: 2em; margin-top: 1em; }
              h2 { color: #2d3748; font-size: 1.5em; margin-top: 0.8em; }
              h3 { color: #4a5568; font-size: 1.2em; margin-top: 0.6em; }
              p { margin: 0.5em 0; }
              ul, ol { margin: 0.5em 0; padding-left: 2em; }
              strong { font-weight: 600; }
              pre { background: #f7fafc; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
              table { border-collapse: collapse; width: 100%; margin: 1em 0; }
              th, td { border: 1px solid #e2e8f0; padding: 0.5em; text-align: left; }
              th { background: #edf2f7; font-weight: 600; }
              @media print {
                body { max-width: 100%; }
                h1 { page-break-before: always; }
                h1:first-of-type { page-break-before: avoid; }
              }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap; font-family: inherit;">${report.markdownReport}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleCopyToClipboard}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy to Clipboard
          </>
        )}
      </button>

      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
      >
        <Printer className="w-4 h-4" />
        Print
      </button>
    </div>
  );
}

