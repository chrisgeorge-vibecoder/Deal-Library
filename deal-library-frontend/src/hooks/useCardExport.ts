import { useState } from 'react';
import html2canvas from 'html2canvas';

export function useCardExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleCopyAsHTML = async (contentSelector: string) => {
    try {
      setIsExporting(true);
      const content = document.querySelector(contentSelector);
      
      if (!content) {
        console.error('Could not find content to copy');
        return false;
      }

      // Create clipboard item with both HTML and plain text
      const htmlContent = content.innerHTML;
      const textContent = content.textContent || '';
      
      const clipboardItem = new ClipboardItem({
        'text/html': new Blob([htmlContent], { type: 'text/html' }),
        'text/plain': new Blob([textContent], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      
      // Fallback: copy as plain text
      try {
        const content = document.querySelector(contentSelector);
        if (content?.textContent) {
          await navigator.clipboard.writeText(content.textContent);
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 2000);
          return true;
        }
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
        return false;
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadAsImage = async (contentSelector: string, filename: string) => {
    try {
      setIsExporting(true);
      const content = document.querySelector(contentSelector) as HTMLElement;
      
      if (!content) {
        console.error('Could not find content to export');
        return false;
      }

      // Capture the content as canvas
      const canvas = await html2canvas(content, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 2000);
        }
      }, 'image/png');

      return true;
    } catch (err) {
      console.error('Failed to export as image:', err);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
      return true;
    } catch (err) {
      console.error('Failed to print:', err);
      return false;
    }
  };

  return {
    handleCopyAsHTML,
    handleDownloadAsImage,
    handlePrint,
    isExporting,
    exportSuccess
  };
}




