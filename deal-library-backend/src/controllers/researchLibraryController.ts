import { Request, Response } from 'express';
import { RAGService } from '../services/ragService';
import { PDFProcessingService } from '../services/pdfProcessingService';
import { SupabaseService } from '../services/supabaseService';

// Extend Request type for file uploads
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/**
 * Research Library Controller
 * Handles API endpoints for research library management and access
 */
export class ResearchLibraryController {
  private ragService: RAGService;
  private pdfProcessingService: PDFProcessingService;
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
    this.ragService = new RAGService(supabase);
    this.pdfProcessingService = new PDFProcessingService(supabase, this.ragService);
    
    console.log('✅ Research Library Controller initialized');
  }

  /**
   * Get RAG service instance (for use by other services)
   */
  getRAGService(): RAGService {
    return this.ragService;
  }

  /**
   * GET /api/research - Get all published research studies
   */
  async getAllStudies(req: Request, res: Response): Promise<void> {
    try {
      const { 
        category, 
        source, 
        featured, 
        search,
        limit = 50,
        offset = 0 
      } = req.query;

      let query = this.supabase
        .from('research_studies')
        .select('*')
        .eq('is_published', true);

      if (category) {
        query = query.eq('category', category);
      }

      if (source) {
        query = query.eq('source', source);
      }

      if (featured === 'true') {
        query = query.eq('is_featured', true);
      }

      if (search && typeof search === 'string') {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      query = query
        .order('is_featured', { ascending: false })
        .order('publication_date', { ascending: false })
        .range(Number(offset), Number(offset) + Number(limit) - 1);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching studies:', error);
        res.status(500).json({ error: 'Failed to fetch research studies' });
        return;
      }

      res.json({
        studies: data || [],
        count: data?.length || 0
      });
    } catch (error: any) {
      console.error('❌ Error in getAllStudies:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/research/:id - Get a specific research study
   */
  async getStudyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Study ID is required' });
        return;
      }

      const { data, error } = await this.supabase
        .from('research_studies')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        res.status(404).json({ error: 'Study not found' });
        return;
      }

      // Increment view count
      await this.supabase.rpc('increment_view_count', { study_id_param: parseInt(id as string) });

      // Get embedding stats
      const stats = await this.pdfProcessingService.getEmbeddingStats(parseInt(id as string));

      res.json({
        study: data,
        embeddingStats: stats
      });
    } catch (error: any) {
      console.error('❌ Error in getStudyById:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/research/:id/download - Track download and return file URL
   */
  async downloadStudy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Study ID is required' });
        return;
      }

      const { data, error } = await this.supabase
        .from('research_studies')
        .select('file_url, title')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        res.status(404).json({ error: 'Study not found' });
        return;
      }

      // Increment download count
      await this.supabase.rpc('increment_download_count', { study_id_param: parseInt(id as string) });

      res.json({
        fileUrl: data.file_url,
        title: data.title
      });
    } catch (error: any) {
      console.error('❌ Error in downloadStudy:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/research/categories - Get all unique categories
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('research_studies')
        .select('category')
        .eq('is_published', true)
        .not('category', 'is', null);

      if (error) {
        console.error('❌ Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
        return;
      }

      const uniqueCategories = [...new Set(data.map((row: any) => row.category))].sort();

      res.json({ categories: uniqueCategories });
    } catch (error: any) {
      console.error('❌ Error in getCategories:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/research/sources - Get all unique sources
   */
  async getSources(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('research_studies')
        .select('source')
        .eq('is_published', true)
        .not('source', 'is', null);

      if (error) {
        console.error('❌ Error fetching sources:', error);
        res.status(500).json({ error: 'Failed to fetch sources' });
        return;
      }

      const uniqueSources = [...new Set(data.map((row: any) => row.source))].sort();

      res.json({ sources: uniqueSources });
    } catch (error: any) {
      console.error('❌ Error in getSources:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/research - Create new research study (admin)
   */
  async createStudy(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        author,
        publication_date,
        source,
        category,
        tags,
        file_url,
        file_size_kb,
        thumbnail_url,
        summary,
        why_it_matters,
        is_featured = false,
        is_published = true
      } = req.body;

      if (!title || !file_url) {
        res.status(400).json({ error: 'Title and file_url are required' });
        return;
      }

      const { data, error } = await this.supabase
        .from('research_studies')
        .insert({
          title,
          description,
          author,
          publication_date,
          source,
          category,
          tags,
          file_url,
          file_size_kb,
          thumbnail_url,
          summary,
          why_it_matters,
          is_featured,
          is_published
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating study:', error);
        res.status(500).json({ error: 'Failed to create study' });
        return;
      }

      console.log(`✅ Created new study: ${title} (ID: ${data.id})`);

      res.status(201).json({
        study: data,
        message: 'Study created successfully. Use /api/research/:id/process to generate embeddings.'
      });
    } catch (error: any) {
      console.error('❌ Error in createStudy:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/research/upload - Upload PDF file to Supabase Storage
   */
  async uploadPDF(req: MulterRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const file = req.file;
      
      // Validate file type
      if (file.mimetype !== 'application/pdf') {
        res.status(400).json({ error: 'Only PDF files are allowed' });
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        res.status(400).json({ error: 'File size must be less than 10MB' });
        return;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}-${sanitizedName}`;
      
      console.log(`📤 Uploading PDF: ${fileName} (${Math.round(file.size / 1024)}KB)`);
      
      // Try both service role client and regular client for storage operations
      let storageClient;
      
      try {
        storageClient = SupabaseService.getServiceRoleClient();
        console.log('📤 Using service role client for upload');
      } catch (serviceRoleError) {
        console.log('⚠️ Service role client failed, falling back to regular client:', serviceRoleError);
        storageClient = this.supabase;
      }
      
      // Upload to Supabase Storage
      console.log('📤 Attempting upload to research-pdfs bucket...');
      const { data, error } = await storageClient.storage
        .from('research-pdfs')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('❌ Error uploading to Supabase Storage:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        res.status(500).json({ 
          error: 'Failed to upload file to storage', 
          details: error.message || error 
        });
        return;
      }

      // Get public URL using the same client that was used for upload
      const { data: urlData } = storageClient.storage
        .from('research-pdfs')
        .getPublicUrl(fileName);

      console.log(`✅ PDF uploaded successfully: ${urlData.publicUrl}`);

      res.json({
        success: true,
        fileUrl: urlData.publicUrl,
        fileName: fileName,
        originalName: file.originalname,
        fileSize: file.size,
        fileSizeKB: Math.round(file.size / 1024)
      });
    } catch (error: any) {
      console.error('❌ Error in uploadPDF:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/research/:id/process - Process PDF and generate embeddings
   */
  async processStudy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Study ID is required' });
        return;
      }
      
      const { force = false } = req.body;

      // Check if study exists
      const { data: study, error: studyError } = await this.supabase
        .from('research_studies')
        .select('*')
        .eq('id', id)
        .single();

      if (studyError || !study) {
        res.status(404).json({ error: 'Study not found' });
        return;
      }

      // Check if embeddings already exist
      if (!force) {
        const stats = await this.pdfProcessingService.getEmbeddingStats(parseInt(id as string));
        if (stats && stats.chunkCount > 0) {
          res.status(400).json({
            error: 'Study already processed',
            message: 'Use force=true to reprocess',
            stats
          });
          return;
        }
      } else {
        // Delete existing embeddings
        await this.pdfProcessingService.deleteEmbeddings(parseInt(id as string));
      }

      // Process the PDF
      console.log(`🔄 Processing study ${id}: ${study.title}`);
      
      const result = await this.pdfProcessingService.processPDF(
        parseInt(id as string),
        study.file_url,
        {
          title: study.title,
          author: study.author
        }
      );

      if (result.success) {
        res.json({
          message: 'Study processed successfully',
          chunksProcessed: result.chunksProcessed
        });
      } else {
        res.status(500).json({
          error: 'Failed to process study',
          message: result.error
        });
      }
    } catch (error: any) {
      console.error('❌ Error in processStudy:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/research/:id/process-text - Process text directly (for testing)
   */
  async processText(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Study ID is required' });
        return;
      }
      
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'Text content is required' });
        return;
      }

      // Check if study exists
      const { data: study, error: studyError } = await this.supabase
        .from('research_studies')
        .select('*')
        .eq('id', id)
        .single();

      if (studyError || !study) {
        res.status(404).json({ error: 'Study not found' });
        return;
      }

      console.log(`📝 Processing text for study ${id}: ${study.title}`);

      const result = await this.pdfProcessingService.processText(
        parseInt(id as string),
        text,
        {
          title: study.title,
          author: study.author
        }
      );

      if (result.success) {
        res.json({
          message: 'Text processed successfully',
          chunksProcessed: result.chunksProcessed
        });
      } else {
        res.status(500).json({
          error: 'Failed to process text',
          message: result.error
        });
      }
    } catch (error: any) {
      console.error('❌ Error in processText:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/research/:id - Update research study
   */
  async updateStudy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Don't allow updating id or created_at
      delete updates.id;
      delete updates.created_at;

      const { data, error } = await this.supabase
        .from('research_studies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating study:', error);
        res.status(500).json({ error: 'Failed to update study' });
        return;
      }

      console.log(`✅ Updated study ${id}`);
      res.json({ study: data });
    } catch (error: any) {
      console.error('❌ Error in updateStudy:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/research/:id - Delete research study
   */
  async deleteStudy(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Study ID is required' });
        return;
      }

      // Delete embeddings first (cascade should handle this, but being explicit)
      await this.pdfProcessingService.deleteEmbeddings(parseInt(id as string));

      const { error } = await this.supabase
        .from('research_studies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting study:', error);
        res.status(500).json({ error: 'Failed to delete study' });
        return;
      }

      console.log(`✅ Deleted study ${id}`);
      res.json({ message: 'Study deleted successfully' });
    } catch (error: any) {
      console.error('❌ Error in deleteStudy:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/research/stats - Get library statistics
   */
  async getLibraryStats(req: Request, res: Response): Promise<void> {
    try {
      const { data: studies, error: studiesError } = await this.supabase
        .from('research_studies')
        .select('id, category, download_count, view_count')
        .eq('is_published', true);

      if (studiesError) {
        console.error('❌ Error fetching stats:', studiesError);
        res.status(500).json({ error: 'Failed to fetch statistics' });
        return;
      }

      const totalStudies = studies.length;
      const totalDownloads = studies.reduce((sum: number, s: any) => sum + (s.download_count || 0), 0);
      const totalViews = studies.reduce((sum: number, s: any) => sum + (s.view_count || 0), 0);

      const categoryCounts = studies.reduce((acc: any, s: any) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {});

      const { data: embeddings, error: embeddingsError } = await this.supabase
        .from('research_embeddings')
        .select('id');

      const totalEmbeddings = embeddings?.length || 0;

      res.json({
        totalStudies,
        totalDownloads,
        totalViews,
        totalEmbeddings,
        categoryCounts
      });
    } catch (error: any) {
      console.error('❌ Error in getLibraryStats:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

