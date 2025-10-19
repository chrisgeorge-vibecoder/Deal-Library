# PDF Storage Implementation Guide

## Current Status
- ✅ Database schema exists (`research_studies` table)
- ❌ PDF files are not actually stored (only metadata)
- ❌ PDF processing for RAG is not implemented

## What You Need to Implement

### 1. Supabase Storage Setup

In your Supabase dashboard:
1. Go to Storage → Create a new bucket called `research-pdfs`
2. Set bucket policies for public read access:

```sql
-- Allow public read access to research PDFs
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'research-pdfs');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'research-pdfs' AND auth.role() = 'authenticated');

-- Allow service role to manage files
CREATE POLICY "Service Role Full Access" ON storage.objects FOR ALL 
USING (bucket_id = 'research-pdfs');
```

### 2. Backend Changes Needed

#### Add File Upload Endpoint
You need to add a new endpoint that handles multipart file uploads:

```typescript
// In researchLibraryController.ts - Add this method:
async uploadPDF(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;
    
    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from('research-pdfs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('research-pdfs')
      .getPublicUrl(fileName);

    res.json({
      fileUrl: urlData.publicUrl,
      fileName: fileName,
      fileSize: file.size
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

#### Update createStudy method
The createStudy method should accept the actual file upload or reference.

### 3. Frontend Changes Needed

Update the upload handler in ResearchLibrary.tsx:

```typescript
const handleUpload = async () => {
  if (!selectedFile || !uploadForm.title.trim()) {
    alert('Please select a PDF file and enter a title');
    return;
  }

  setUploading(true);
  try {
    // First upload the file
    const formData = new FormData();
    formData.append('file', selectedFile);

    const uploadResponse = await fetch(`${apiBaseUrl}/api/research/upload`, {
      method: 'POST',
      body: formData, // No Content-Type header needed for FormData
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    const uploadData = await uploadResponse.json();

    // Now create the study record
    const studyData = {
      title: uploadForm.title.trim(),
      description: uploadForm.description.trim(),
      author: uploadForm.author.trim(),
      source: uploadForm.source.trim(),
      category: uploadForm.category.trim(),
      summary: uploadForm.summary.trim(),
      why_it_matters: uploadForm.whyItMatters.trim(),
      file_url: uploadData.fileUrl, // Real URL from Supabase Storage
      file_size_kb: Math.round(selectedFile.size / 1024),
      is_published: true
    };

    const response = await fetch(`${apiBaseUrl}/api/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studyData),
    });

    // ... rest of the success handling
  } catch (error) {
    // ... error handling
  }
};
```

### 4. Required Dependencies

Add to package.json:
```bash
npm install multer @types/multer
```

### 5. Middleware Setup

Add multer middleware to handle file uploads in your Express app:

```typescript
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Add route
app.post('/api/research/upload', upload.single('file'), (req, res) => 
  researchLibraryController.uploadPDF(req, res)
);
```

## Summary

Right now:
- ✅ You have the database schema ready
- ❌ PDF files are stored as `placeholder/filename.pdf` (not real files)
- ❌ No actual file storage happening

After implementation:
- ✅ PDFs will be stored in Supabase Storage
- ✅ Real URLs will be generated for download
- ✅ RAG processing can be implemented to extract text from actual PDFs
