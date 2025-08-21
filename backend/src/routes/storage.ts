import express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { storageService } from '../services/storageService';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  }
});

/**
 * Upload file to 0G Storage
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!storageService) {
      return res.status(500).json({ 
        error: 'Storage service not initialized. Please configure PRIVATE_KEY environment variable.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📁 Processing upload: ${req.file.originalname}`);
    console.log(`📏 File size: ${req.file.size} bytes`);

    // Upload file to 0G Storage
    const result = await storageService.uploadFile(req.file.path);

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        rootHash: result.rootHash,
        txHash: result.txHash,
        filename: req.file.originalname,
        size: req.file.size,
        uploadTime: new Date().toISOString()
      }
    });
  } catch (error) {
    // Clean up temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
});

/**
 * Upload text data to 0G Storage
 */
router.post('/upload-text', express.json(), async (req, res) => {
  try {
    if (!storageService) {
      return res.status(500).json({ 
        error: 'Storage service not initialized. Please configure PRIVATE_KEY environment variable.' 
      });
    }

    const { content, filename } = req.body;

    if (!content || !filename) {
      return res.status(400).json({ error: 'Content and filename are required' });
    }

    console.log(`📝 Processing text upload: ${filename}`);
    
    // Create buffer from text content
    const buffer = Buffer.from(content, 'utf-8');

    // Upload buffer to 0G Storage
    const result = await storageService.uploadBuffer(buffer, filename);

    res.json({
      success: true,
      data: {
        rootHash: result.rootHash,
        txHash: result.txHash,
        filename: filename,
        size: buffer.length,
        uploadTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Text upload error:', error);
    res.status(500).json({ 
      error: `Text upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
});

/**
 * Download file from 0G Storage
 */
router.get('/download/:rootHash', async (req, res) => {
  try {
    if (!storageService) {
      return res.status(500).json({ 
        error: 'Storage service not initialized. Please configure PRIVATE_KEY environment variable.' 
      });
    }

    const { rootHash } = req.params;
    const { filename = 'download' } = req.query;

    if (!rootHash) {
      return res.status(400).json({ error: 'Root hash is required' });
    }

    console.log(`📥 Processing download: ${rootHash}`);

    // Create temporary file path for download
    const tempPath = path.join('downloads', `${rootHash}_${filename}`);
    const tempDir = path.dirname(tempPath);

    // Ensure downloads directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Download file from 0G Storage
    await storageService.downloadFile(rootHash, tempPath);

    // Check if file was downloaded successfully
    if (!fs.existsSync(tempPath)) {
      return res.status(404).json({ error: 'File not found or download failed' });
    }

    // Send file to client
    res.download(tempPath, filename as string, (err) => {
      // Clean up temporary file after download
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }

      if (err) {
        console.error('❌ Download error:', err);
      }
    });
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({ 
      error: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
});

/**
 * Upload key-value data to 0G-KV
 */
router.post('/kv/upload', express.json(), async (req, res) => {
  try {
    if (!storageService) {
      return res.status(500).json({ 
        error: 'Storage service not initialized. Please configure PRIVATE_KEY environment variable.' 
      });
    }

    const { streamId, key, value } = req.body;

    if (!streamId || !key || !value) {
      return res.status(400).json({ error: 'streamId, key, and value are required' });
    }

    console.log(`🔑 Processing KV upload: ${key} to stream ${streamId}`);

    // Upload to 0G-KV
    const txHash = await storageService.uploadToKV(streamId, key, value);

    res.json({
      success: true,
      data: {
        streamId,
        key,
        txHash,
        uploadTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ KV upload error:', error);
    res.status(500).json({ 
      error: `KV upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
});

/**
 * Download value from 0G-KV
 */
router.get('/kv/:streamId/:key', async (req, res) => {
  try {
    if (!storageService) {
      return res.status(500).json({ 
        error: 'Storage service not initialized. Please configure PRIVATE_KEY environment variable.' 
      });
    }

    const { streamId, key } = req.params;

    if (!streamId || !key) {
      return res.status(400).json({ error: 'streamId and key are required' });
    }

    console.log(`🔑 Processing KV download: ${key} from stream ${streamId}`);

    // Download from 0G-KV
    const value = await storageService.downloadFromKV(streamId, key);

    if (value === null) {
      return res.status(404).json({ error: 'Key not found' });
    }

    res.json({
      success: true,
      data: {
        streamId,
        key,
        value,
        downloadTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ KV download error:', error);
    res.status(500).json({ 
      error: `KV download failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
});

/**
 * Get storage statistics
 */
router.get('/stats', async (req, res) => {
  try {
    if (!storageService) {
      return res.status(500).json({ 
        error: 'Storage service not initialized. Please configure PRIVATE_KEY environment variable.' 
      });
    }

    console.log('📊 Getting storage statistics...');

    const stats = await storageService.getStorageStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ 
      error: `Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
});

/**
 * Verify file integrity
 */
router.get('/verify/:rootHash', async (req, res) => {
  try {
    if (!storageService) {
      return res.status(500).json({ 
        error: 'Storage service not initialized. Please configure PRIVATE_KEY environment variable.' 
      });
    }

    const { rootHash } = req.params;

    if (!rootHash) {
      return res.status(400).json({ error: 'Root hash is required' });
    }

    console.log(`🔍 Verifying file: ${rootHash}`);

    const isValid = await storageService.verifyFile(rootHash);

    res.json({
      success: true,
      data: {
        rootHash,
        isValid,
        verificationTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({ 
      error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    });
  }
});

export default router;