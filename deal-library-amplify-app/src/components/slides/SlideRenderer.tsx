'use client';

import React from 'react';
import { SlideData } from './SlideView';
import TitleSlide from './templates/TitleSlide';
import TwoColumnSlide from './templates/TwoColumnSlide';
import GridSlide from './templates/GridSlide';
import ListSlide from './templates/ListSlide';
import SWOTSlide from './templates/SWOTSlide';
import TableSlide from './templates/TableSlide';
import StatsSlide from './templates/StatsSlide';

interface SlideRendererProps {
  slide: SlideData;
  slideIndex: number;
}

export default function SlideRenderer({ slide, slideIndex }: SlideRendererProps) {
  const renderSlide = () => {
    switch (slide.type) {
      case 'title':
        // Title slides have their own accent bar, so no padding at top
        return <TitleSlide content={slide.content} />;
      case 'two-column':
        return <TwoColumnSlide content={slide.content} />;
      case 'grid':
        return <GridSlide content={slide.content} />;
      case 'list':
        return <ListSlide content={slide.content} />;
      case 'swot':
        return <SWOTSlide content={slide.content} />;
      case 'table':
        return <TableSlide content={slide.content} />;
      case 'stats':
        return <StatsSlide content={slide.content} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-neutral-500">
            Unknown slide type: {slide.type}
          </div>
        );
    }
  };

  // Title slides need no top padding to show the accent bar
  const isTitle = slide.type === 'title';
  
  return (
    <div className={`w-full h-full flex flex-col ${isTitle ? 'p-0' : 'p-10'}`}>
      {renderSlide()}
    </div>
  );
}

