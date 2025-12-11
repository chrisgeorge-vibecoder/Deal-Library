'use client';

import React from 'react';

/**
 * Parses markdown-style formatting in text and returns React elements.
 * Supports:
 * - **bold text** → <strong>bold text</strong>
 * - *italic text* → <em>italic text</em>
 * - `code` → <code>code</code>
 * 
 * @param text - The text to parse
 * @returns React node with proper formatting
 */
export function formatMarkdownText(text: string): React.ReactNode {
  if (!text || typeof text !== 'string') return text;
  
  // Match patterns in order: bold (**text**), italic (*text*), code (`text`)
  // Use a combined regex to handle all patterns
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  
  const parts = text.split(pattern);
  
  if (parts.length === 1) {
    return text; // No formatting found
  }
  
  return parts.map((part, index) => {
    if (!part) return null;
    
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index} className="font-semibold">{boldText}</strong>;
    }
    
    // Italic: *text* (but not if it's part of a bold marker)
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      const italicText = part.slice(1, -1);
      return <em key={index} className="italic">{italicText}</em>;
    }
    
    // Code: `text`
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code 
          key={index} 
          className="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono"
        >
          {codeText}
        </code>
      );
    }
    
    // Plain text
    return part;
  });
}

/**
 * Removes markdown formatting from text and returns plain string.
 * Useful for contexts where React nodes can't be used (e.g., attributes).
 * 
 * @param text - The text to clean
 * @returns Plain text without markdown markers
 */
export function stripMarkdown(text: string): string {
  if (!text || typeof text !== 'string') return text || '';
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
    .replace(/`(.*?)`/g, '$1')       // Remove `code`
    .replace(/#{1,6}\s*/g, '')       // Remove headers
    .trim();
}

/**
 * Truncates text while preserving markdown formatting integrity.
 * Ensures we don't cut in the middle of a markdown marker.
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text that maintains valid markdown
 */
export function truncateWithMarkdown(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  
  // First strip markdown to get true content length
  const stripped = stripMarkdown(text);
  
  if (stripped.length <= maxLength) {
    return text; // Original is fine after removing markdown
  }
  
  // Truncate and add ellipsis
  let truncated = text.slice(0, maxLength);
  
  // Make sure we don't end in the middle of a markdown marker
  // Check for unclosed bold
  const boldOpens = (truncated.match(/\*\*/g) || []).length;
  if (boldOpens % 2 !== 0) {
    // Find last ** and remove it
    const lastBold = truncated.lastIndexOf('**');
    truncated = truncated.slice(0, lastBold);
  }
  
  // Check for unclosed italic
  const italicOpens = (truncated.match(/(?<!\*)\*(?!\*)/g) || []).length;
  if (italicOpens % 2 !== 0) {
    const lastItalic = truncated.lastIndexOf('*');
    truncated = truncated.slice(0, lastItalic);
  }
  
  // Check for unclosed code
  const codeOpens = (truncated.match(/`/g) || []).length;
  if (codeOpens % 2 !== 0) {
    const lastCode = truncated.lastIndexOf('`');
    truncated = truncated.slice(0, lastCode);
  }
  
  return truncated.trim() + '...';
}




