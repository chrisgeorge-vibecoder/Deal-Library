'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download, Image as ImageIcon, FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface SlideData {
  id: string;
  title: string;
  type: 'title' | 'two-column' | 'grid' | 'list' | 'swot' | 'table' | 'stats';
  content: any;
}

interface SlideViewProps {
  slides: SlideData[];
  cardType: string;
  cardTitle: string;
  children: (slide: SlideData, index: number) => React.ReactNode;
  onClose?: () => void;
}

export default function SlideView({ 
  slides, 
  cardType, 
  cardTitle, 
  children 
}: SlideViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportType, setExportType] = useState<'slide' | 'all' | 'pdf' | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Export current slide as PNG
  const handleExportSlide = async () => {
    try {
      setIsExporting(true);
      setExportType('slide');
      const slideElement = document.getElementById('slide-content');
      
      if (!slideElement) {
        console.error('Could not find slide content');
        return;
      }

      const canvas = await html2canvas(slideElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1280,
        height: 720,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const safeTitle = cardTitle.replace(/[^a-zA-Z0-9]/g, '-');
          link.download = `${safeTitle}-slide-${currentSlide + 1}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 2000);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to export slide:', err);
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Export all slides as individual PNGs with progress
  const handleExportAllSlides = async () => {
    try {
      setIsExporting(true);
      setExportType('all');
      setExportProgress(0);
      const originalSlide = currentSlide;
      const images: { name: string; blob: Blob }[] = [];

      for (let i = 0; i < slides.length; i++) {
        setCurrentSlide(i);
        setExportProgress(Math.round(((i + 0.5) / slides.length) * 100));
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const slideElement = document.getElementById('slide-content');
        if (!slideElement) continue;

        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 1280,
          height: 720,
        });

        const blob = await new Promise<Blob | null>(resolve => 
          canvas.toBlob(resolve, 'image/png')
        );

        if (blob) {
          const safeTitle = cardTitle.replace(/[^a-zA-Z0-9]/g, '-');
          images.push({
            name: `${safeTitle}-slide-${i + 1}.png`,
            blob
          });
        }
        setExportProgress(Math.round(((i + 1) / slides.length) * 100));
      }

      // Download each image
      for (const image of images) {
        const url = URL.createObjectURL(image.blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = image.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setCurrentSlide(originalSlide);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to export all slides:', err);
    } finally {
      setIsExporting(false);
      setExportType(null);
      setExportProgress(0);
    }
  };

  // Export all slides as PDF deck
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setExportType('pdf');
      setExportProgress(0);
      const originalSlide = currentSlide;

      // Create PDF with 16:9 dimensions (1280x720 at 72 DPI)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720],
        hotfixes: ['px_scaling']
      });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) {
          pdf.addPage([1280, 720], 'landscape');
        }
        
        setCurrentSlide(i);
        setExportProgress(Math.round(((i + 0.5) / slides.length) * 100));
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const slideElement = document.getElementById('slide-content');
        if (!slideElement) continue;

        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 1280,
          height: 720,
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720);
        
        setExportProgress(Math.round(((i + 1) / slides.length) * 100));
      }

      // Save the PDF
      const safeTitle = cardTitle.replace(/[^a-zA-Z0-9]/g, '-');
      pdf.save(`${safeTitle}-slides.pdf`);

      setCurrentSlide(originalSlide);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(false);
      setExportType(null);
      setExportProgress(0);
    }
  };

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-500">
        No slides available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Slide Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-neutral-50 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-600">
            Slide {currentSlide + 1} of {slides.length}
          </span>
          <span className="text-sm text-neutral-400">|</span>
          <span className="text-sm text-neutral-500">{slides[currentSlide]?.title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Export buttons */}
          <button
            onClick={handleExportSlide}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
            title="Download this slide as PNG"
          >
            {isExporting && exportType === 'slide' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {exportSuccess && exportType === null ? 'Downloaded!' : 'This Slide'}
            </span>
          </button>
          <button
            onClick={handleExportAllSlides}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors disabled:opacity-50"
            title="Download all slides as PNGs"
          >
            {isExporting && exportType === 'all' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isExporting && exportType === 'all' ? `${exportProgress}%` : 'All Images'}
            </span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
            title="Download as PDF presentation"
          >
            {isExporting && exportType === 'pdf' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isExporting && exportType === 'pdf' ? `${exportProgress}%` : 'PDF Deck'}
            </span>
          </button>
        </div>
      </div>

      {/* Export Progress Bar */}
      {isExporting && (exportType === 'all' || exportType === 'pdf') && (
        <div className="h-1 bg-neutral-200">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${exportProgress}%` }}
          />
        </div>
      )}

      {/* Slide Content Area */}
      <div className="flex-1 relative flex items-center justify-center bg-neutral-100 p-4 sm:p-8 overflow-hidden">
        {/* Previous Button */}
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0 || isExporting}
          className={`absolute left-2 sm:left-4 z-10 p-2 sm:p-3 rounded-full bg-white shadow-lg transition-all ${
            currentSlide === 0 || isExporting
              ? 'opacity-30 cursor-not-allowed' 
              : 'opacity-90 hover:opacity-100 hover:scale-110'
          }`}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" />
        </button>

        {/* Slide Container - 16:9 aspect ratio */}
        <div 
          id="slide-content"
          className="w-full max-w-[1280px] aspect-video bg-white rounded-lg shadow-xl overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          {children(slides[currentSlide], currentSlide)}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1 || isExporting}
          className={`absolute right-2 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-white shadow-lg transition-all ${
            currentSlide === slides.length - 1 || isExporting
              ? 'opacity-30 cursor-not-allowed' 
              : 'opacity-90 hover:opacity-100 hover:scale-110'
          }`}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-700" />
        </button>
      </div>

      {/* Dot Navigation */}
      <div className="flex items-center justify-center gap-2 py-4 bg-neutral-50 border-t border-neutral-200">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => !isExporting && goToSlide(index)}
            disabled={isExporting}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-blue-600 scale-125' 
                : 'bg-neutral-300 hover:bg-neutral-400'
            } ${isExporting ? 'cursor-not-allowed' : ''}`}
            title={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

