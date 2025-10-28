'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Download, Eye, Filter, Search, Tag, Calendar, TrendingUp, ExternalLink, Upload, Plus, X, Bookmark, BookmarkCheck, Edit3 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface ResearchStudy {
  id: number;
  title: string;
  description: string;
  author?: string;
  publication_date?: string;
  source?: string;
  category?: string;
  tags?: string[];
  file_url: string;
  file_size_kb?: number;
  thumbnail_url?: string;
  summary?: string;
  why_it_matters?: string;
  download_count: number;
  view_count: number;
  is_featured: boolean;
}

interface ResearchLibraryProps {
  apiBaseUrl?: string;
  onSaveCard?: (card: { type: 'deal' | 'persona' | 'audience-insights' | 'market-sizing' | 'geo-cards' | 'research', data: any }) => void;
  onUnsaveCard?: (cardId: string) => void;
  isSaved?: (cardId: string) => boolean;
}

export default function ResearchLibrary({ apiBaseUrl = 'http://localhost:3002', onSaveCard, onUnsaveCard, isSaved }: ResearchLibraryProps) {
  const [studies, setStudies] = useState<ResearchStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  
  // Upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Study detail modal state
  const [selectedStudy, setSelectedStudy] = useState<ResearchStudy | null>(null);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    date: '',
    source: '',
    category: '',
    description: '',
    whyItMatters: ''
  });
  const [uploadForm, setUploadForm] = useState({
    title: '',
    date: '',
    source: '',
    category: '',
    description: '',
    whyItMatters: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  // Fetch studies on mount
  useEffect(() => {
    fetchStudies();
    fetchCategories();
    fetchSources();
  }, []);

  // Fetch studies based on filters
  useEffect(() => {
    fetchStudies();
  }, [searchQuery, selectedCategory, selectedSource]);

  // Auto-open study modal if openStudyId is provided
  useEffect(() => {
    const openStudyId = searchParams.get('openStudy');
    if (openStudyId && studies.length > 0) {
      const studyToOpen = studies.find(study => study.id.toString() === openStudyId);
      if (studyToOpen) {
        setSelectedStudy(studyToOpen);
        setIsStudyModalOpen(true);
        // Clear the URL parameter to clean up the URL
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('openStudy');
          window.history.replaceState({}, '', url.toString());
        }
      }
    }
  }, [searchParams, studies]);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedSource !== 'all') params.append('source', selectedSource);

      const response = await fetch(`${apiBaseUrl}/api/research?${params.toString()}`);
      
      if (!response.ok) {
        // For 503 status, try to get the detailed error message from backend
        if (response.status === 503) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || 'Research service is unavailable');
          } catch (parseError) {
            throw new Error('Research service is temporarily unavailable. Please ensure the backend server is running with Supabase configured.');
          }
        }
        
        // Check if it's a server error (502, 500, etc.) or network issue
        if (response.status >= 500) {
          throw new Error('Research service is temporarily unavailable. Please ensure the backend server is running with Supabase configured.');
        }
        throw new Error(`Failed to fetch research studies: ${response.statusText}`);
      }

      const data = await response.json();
      setStudies(data.studies || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching studies:', err);
      
      // Provide more specific error messages based on error type
      let errorMessage = err.message;
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Cannot connect to the research service. Please ensure the backend server is running on port 3002.';
      } else if (err.message.includes('Failed to fetch research studies')) {
        errorMessage = 'Research service is temporarily unavailable. The research library may not be configured.';
      }
      
      setError(errorMessage);
      setStudies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/research/categories`);
      if (!response.ok) {
        console.warn('Research categories endpoint not available');
        return;
      }
      const data = await response.json();
      console.log('📋 Categories fetched:', data.categories);
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Don't show error for categories/sources since they're not critical
    }
  };

  const fetchSources = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/research/sources`);
      if (!response.ok) {
        console.warn('Research sources endpoint not available');
        return;
      }
      const data = await response.json();
      console.log('📋 Sources fetched:', data.sources);
      setSources(data.sources || []);
    } catch (err) {
      console.error('Error fetching sources:', err);
      // Don't show error for categories/sources since they're not critical
    }
  };


  const handleDownload = async (study: ResearchStudy) => {
    try {
      // Track download
      await fetch(`${apiBaseUrl}/api/research/${study.id}/download`, {
        method: 'POST'
      });

      // Open PDF in new tab
      window.open(study.file_url, '_blank');

      // Update local state
      setStudies(prevStudies =>
        prevStudies.map(s =>
          s.id === study.id ? { ...s, download_count: s.download_count + 1 } : s
        )
      );
    } catch (err) {
      console.error('Error downloading study:', err);
    }
  };

  const handleStudyClick = (study: ResearchStudy) => {
    setSelectedStudy(study);
    setIsStudyModalOpen(true);
  };

  const handleCloseStudyModal = () => {
    setIsStudyModalOpen(false);
    setSelectedStudy(null);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditStudy = () => {
    if (!selectedStudy) return;
    
    // Convert date from YYYY-MM-DD to YYYY-MM for month input
    let dateValue = '';
    if (selectedStudy.publication_date) {
      const date = new Date(selectedStudy.publication_date);
      dateValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    setEditForm({
      title: selectedStudy.title || '',
      date: dateValue,
      source: selectedStudy.source || '',
      category: selectedStudy.category || '',
      description: selectedStudy.description || '',
      whyItMatters: selectedStudy.why_it_matters || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedStudy) return;
    
    try {
      // Convert month input (YYYY-MM) to full date (YYYY-MM-DD) for PostgreSQL
      let publicationDate = null;
      if (editForm.date && editForm.date.trim()) {
        publicationDate = editForm.date.trim() + '-01';
      }

      // Helper function to convert empty strings to null
      const nullIfEmpty = (value: string | undefined) => {
        if (!value) return null;
        return value.trim() === '' ? null : value.trim();
      };

      const updateData = {
        title: editForm.title.trim(),
        description: nullIfEmpty(editForm.description),
        publication_date: publicationDate,
        source: nullIfEmpty(editForm.source),
        category: nullIfEmpty(editForm.category),
        why_it_matters: nullIfEmpty(editForm.whyItMatters),
        author: null,
        summary: null,
        tags: null
      };

      console.log('📝 Updating study with data:', updateData);
      const response = await fetch(`${apiBaseUrl}/api/research/${selectedStudy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Study updated:', result);
        
        // Update the selected study with new data
        setSelectedStudy(result.study);
        setIsEditing(false);
        
        // Refresh studies list and dropdowns
        await fetchStudies();
        await fetchCategories();
        await fetchSources();
        
        alert('Research study updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Study update failed:', errorData);
        throw new Error(errorData.error || 'Failed to update study (HTTP ' + response.status + ')');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      alert(`Update failed: ${error.message}`);
    }
  };

  const formatFileSize = (kb?: number) => {
    if (!kb) return 'Unknown';
    if (kb < 1024) return kb + ' KB';
    return (kb / 1024).toFixed(1) + ' MB';
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // Upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // Auto-fill title from filename if title is empty
      if (!uploadForm.title) {
        const title = file.name.replace(/\.pdf$/i, '');
        setUploadForm(prev => ({ ...prev, title }));
      }
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.title.trim()) {
      alert('Please select a PDF file and enter a title');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload the PDF file to Supabase Storage
      console.log('📤 Uploading PDF file...');
      console.log('📤 File size:', selectedFile.size, 'bytes');
      console.log('📤 File name:', selectedFile.name);
      console.log('📤 File type:', selectedFile.type);
      
      const fileFormData = new FormData();
      fileFormData.append('file', selectedFile);

      // Add timeout for large file uploads (15 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15 * 60 * 1000); // 15 minutes
      
      console.log('📤 Starting upload request...');
      const uploadStartTime = Date.now();
      
      const uploadResponse = await fetch(`${apiBaseUrl}/api/research/upload`, {
        method: 'POST',
        body: fileFormData, // Don't set Content-Type header for FormData
        signal: controller.signal
      });
      
      const uploadDuration = Date.now() - uploadStartTime;
      console.log(`📤 Upload request completed in ${uploadDuration}ms`);
      
      clearTimeout(timeoutId);

      console.log('Upload response status:', uploadResponse.status);
      console.log('Upload response ok:', uploadResponse.ok);
      console.log('Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

      if (!uploadResponse.ok) {
        let errorData;
        try {
          errorData = await uploadResponse.json();
          console.error('Upload response error (JSON):', errorData);
        } catch (jsonError) {
          const textError = await uploadResponse.text();
          console.error('Upload response error (text):', textError);
          errorData = { error: textError };
        }
        
        // Handle empty error objects
        if (!errorData || Object.keys(errorData).length === 0) {
          throw new Error(`Upload failed with status ${uploadResponse.status}`);
        }
        
        const errorMessage = errorData.error || errorData.details || 'Failed to upload PDF file';
        throw new Error(errorMessage);
      }

      const uploadData = await uploadResponse.json();
      console.log('✅ PDF uploaded:', uploadData.fileUrl);

      // Step 2: Create the study record with the real file URL
      // Convert month input (YYYY-MM) to full date (YYYY-MM-DD) for PostgreSQL
      let publicationDate = null;
      if (uploadForm.date && uploadForm.date.trim()) {
        publicationDate = uploadForm.date.trim() + '-01'; // Append -01 to make it a valid date
      }

      // Helper function to convert empty strings to null
      const nullIfEmpty = (value: string | undefined) => {
        if (!value) return null;
        return value.trim() === '' ? null : value.trim();
      };

      const studyData = {
        title: uploadForm.title.trim(),
        description: nullIfEmpty(uploadForm.description),
        author: null, // No longer using author field
        publication_date: publicationDate,
        source: nullIfEmpty(uploadForm.source),
        category: nullIfEmpty(uploadForm.category),
        tags: null, // No longer using tags field
        why_it_matters: nullIfEmpty(uploadForm.whyItMatters),
        summary: null, // No longer using summary field
        file_url: uploadData.fileUrl, // Real URL from Supabase Storage
        file_size_kb: uploadData.fileSizeKB,
        thumbnail_url: null, // No thumbnail for now
        is_featured: false,
        is_published: true
      };

      console.log('📝 Creating study record with data:', studyData);
      const response = await fetch(`${apiBaseUrl}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studyData),
      });

      console.log('Study creation response status:', response.status);
      console.log('Study creation response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Study created:', result);
        
        // Reset form and close modal
        setUploadForm({
          title: '',
          date: '',
          source: '',
          category: '',
          description: '',
          whyItMatters: ''
        });
        setSelectedFile(null);
        setIsUploadModalOpen(false);
        
        // Refresh studies list and dropdowns
        await fetchStudies();
        await fetchCategories();
        await fetchSources();
        
        alert('Research study uploaded successfully! The PDF is now stored and ready for processing.');
      } else {
        let errorData;
        try {
          errorData = await response.json();
          console.error('❌ Study creation failed (JSON):', errorData);
        } catch (jsonError) {
          const textError = await response.text();
          console.error('❌ Study creation failed (text):', textError);
          errorData = { error: textError };
        }
        
        // Handle empty error objects
        if (!errorData || Object.keys(errorData).length === 0) {
          throw new Error(`Study creation failed with status ${response.status}`);
        }
        
        const errorMessage = errorData.error || errorData.details || `Failed to create study record (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      console.error('Error stringified:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Unknown error occurred';
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        errorMessage = 'Upload timed out. The file may be too large or the connection is slow. Please try again.';
      } else if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.details) {
        errorMessage = error.details;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      console.error('Final error message:', errorMessage);
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      title: '',
      date: '',
      source: '',
      category: '',
      description: '',
      whyItMatters: ''
    });
    setSelectedFile(null);
    setIsUploadModalOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="pt-6 pb-6 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-brand-orange" />
                Research Library
              </h1>
              <p className="text-neutral-600 mt-2">
                Industry studies and insights for marketers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Upload PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline mr-2" size={16} />
                Search
              </label>
              <input
                type="text"
                placeholder="Search studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline mr-2" size={16} />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="inline mr-2" size={16} />
                Source
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                {sources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Studies Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading research studies...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={fetchStudies}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : studies.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No studies found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map(study => (
              <div
                key={study.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-lg cursor-pointer ${
                  study.is_featured ? 'border-blue-500' : 'border-gray-200'
                }`}
                onClick={() => handleStudyClick(study)}
              >
                {study.is_featured && (
                  <div className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-t-xl">
                    ⭐ Featured
                  </div>
                )}
                
                <div className="p-6">
                  {/* Title with Bookmark */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 mr-2">
                      {study.title}
                    </h3>
                    {onSaveCard && onUnsaveCard && isSaved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const cardId = `research-${study.id}`;
                          if (isSaved(cardId)) {
                            onUnsaveCard(cardId);
                          } else {
                            onSaveCard({ type: 'research', data: study });
                          }
                        }}
                        className={`flex-shrink-0 p-2 rounded-lg transition-colors border ${
                          isSaved(`research-${study.id}`)
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
                            : 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50 border-neutral-200'
                        }`}
                        title={isSaved(`research-${study.id}`) ? 'Remove from saved' : 'Save card'}
                      >
                        {isSaved(`research-${study.id}`) ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    {study.source && (
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        {study.source}
                      </span>
                    )}
                    {study.publication_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(study.publication_date)}
                      </span>
                    )}
                  </div>

                  {/* Category Badge */}
                  {study.category && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-3">
                      {study.category}
                    </span>
                  )}

                  {/* Description */}
                  {study.summary && (
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                      {study.summary}
                    </p>
                  )}

                  {/* Why It Matters */}
                  {study.why_it_matters && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">Why This Matters:</p>
                      <p className="text-xs text-yellow-700 line-clamp-2">{study.why_it_matters}</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Download size={14} />
                      {study.download_count} downloads
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {study.view_count} views
                    </span>
                  </div>

                  {/* Click hint */}
                  <div className="text-xs text-gray-500 text-center mb-3">
                    Click anywhere for detailed view
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(study);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download PDF
                    {study.file_size_kb && (
                      <span className="text-xs opacity-75">({formatFileSize(study.file_size_kb)})</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Upload Research PDF</h2>
                <button
                  onClick={resetUploadForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <Upload size={20} />
                          <span className="font-medium">{selectedFile.name}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Size: {formatFileSize(selectedFile.size / 1024)}
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Change file
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Upload size={24} className="mx-auto mb-2" />
                        <p>Click to select PDF file</p>
                        <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                      </button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter study title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date (Month and Year)
                  </label>
                  <input
                    type="month"
                    value={uploadForm.date}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    value={uploadForm.source}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="e.g., IAB, eMarketer, Nielsen"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="programmatic">Programmatic</option>
                    <option value="retail-media">Retail Media</option>
                    <option value="ctv">CTV</option>
                    <option value="audience-targeting">Audience Targeting</option>
                    <option value="consumer-behavior">Consumer Behavior</option>
                    <option value="brand-safety">Brand Safety</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the study"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Why Marketers Should Care */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why Marketers Should Care
                  </label>
                  <textarea
                    value={uploadForm.whyItMatters}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, whyItMatters: e.target.value }))}
                    placeholder="Explain why this research is valuable for marketers"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={resetUploadForm}
                  disabled={uploading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !uploadForm.title.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload Study
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Study Detail Modal */}
      {isStudyModalOpen && selectedStudy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Research Study Details</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditStudy}
                  className="p-2 rounded-lg transition-colors border text-neutral-400 hover:text-blue-600 hover:bg-blue-50 border-neutral-200"
                  title="Edit study"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                {onSaveCard && onUnsaveCard && isSaved && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const cardId = `research-${selectedStudy.id}`;
                      if (isSaved(cardId)) {
                        onUnsaveCard(cardId);
                      } else {
                        onSaveCard({ type: 'research', data: selectedStudy });
                      }
                    }}
                    className={`p-2 rounded-lg transition-colors border ${
                      isSaved(`research-${selectedStudy.id}`)
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200'
                        : 'text-neutral-400 hover:text-blue-600 hover:bg-blue-50 border-neutral-200'
                    }`}
                    title={isSaved(`research-${selectedStudy.id}`) ? 'Remove from saved' : 'Save card'}
                  >
                    {isSaved(`research-${selectedStudy.id}`) ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                )}
                <button
                  onClick={handleCloseStudyModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {isEditing ? (
                <>
                {/* Edit Form */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date (Month and Year)
                    </label>
                    <input
                      type="month"
                      value={editForm.date}
                      onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Source */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source
                    </label>
                    <input
                      type="text"
                      value={editForm.source}
                      onChange={(e) => setEditForm(prev => ({ ...prev, source: e.target.value }))}
                      placeholder="e.g., IAB, eMarketer, Nielsen"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="programmatic">Programmatic</option>
                      <option value="retail-media">Retail Media</option>
                      <option value="ctv">CTV</option>
                      <option value="audience-targeting">Audience Targeting</option>
                      <option value="consumer-behavior">Consumer Behavior</option>
                      <option value="brand-safety">Brand Safety</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the study"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Why Marketers Should Care */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why Marketers Should Care
                    </label>
                    <textarea
                      value={editForm.whyItMatters}
                      onChange={(e) => setEditForm(prev => ({ ...prev, whyItMatters: e.target.value }))}
                      placeholder="Explain why this research is valuable for marketers"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                </>
              ) : (
                <>
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedStudy.title}</h1>
                    
                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      {selectedStudy.author && (
                        <span className="flex items-center gap-1">
                          <Tag size={14} />
                          {selectedStudy.author}
                        </span>
                      )}
                      {selectedStudy.source && (
                        <span className="flex items-center gap-1">
                          <Tag size={14} />
                          {selectedStudy.source}
                        </span>
                      )}
                      {selectedStudy.publication_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(selectedStudy.publication_date)}
                        </span>
                      )}
                    </div>

                    {/* Category and Featured Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      {selectedStudy.category && (
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                          {selectedStudy.category}
                        </span>
                      )}
                      {selectedStudy.is_featured && (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          ⭐ Featured Study
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedStudy.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedStudy.description}</p>
                </div>
              )}

              {/* Summary */}
              {selectedStudy.summary && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Findings</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedStudy.summary}</p>
                </div>
              )}

              {/* Why It Matters */}
              {selectedStudy.why_it_matters && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">Why This Matters</h3>
                  <p className="text-yellow-700 leading-relaxed">{selectedStudy.why_it_matters}</p>
                </div>
              )}

              {/* Tags */}
              {selectedStudy.tags && selectedStudy.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudy.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats and File Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedStudy.download_count}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Download size={14} />
                    Downloads
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedStudy.view_count}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <Eye size={14} />
                    Views
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatFileSize(selectedStudy.file_size_kb)}</div>
                  <div className="text-sm text-gray-600">File Size</div>
                </div>
              </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={isEditing ? handleCancelEdit : handleCloseStudyModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Close'}
              </button>
              <div className="flex gap-3">
                {isEditing ? (
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Edit3 size={18} />
                    Save Changes
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(selectedStudy);
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download size={18} />
                      Download PDF
                    </button>
                    {selectedStudy.file_url && (
                      <button
                        onClick={() => window.open(selectedStudy.file_url, '_blank')}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <ExternalLink size={18} />
                        Open in New Tab
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

