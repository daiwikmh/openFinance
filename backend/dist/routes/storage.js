"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const storageService_1 = require("../services/storageService");
const router = express_1.default.Router();
// Configure multer for file uploads
const upload = (0, multer_1.default)({
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
        if (!storageService_1.storageService) {
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
        const result = await storageService_1.storageService.uploadFile(req.file.path);
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
    }
    catch (error) {
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
router.post('/upload-text', express_1.default.json(), async (req, res) => {
    try {
        if (!storageService_1.storageService) {
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
        const result = await storageService_1.storageService.uploadBuffer(buffer, filename);
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
    }
    catch (error) {
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
        if (!storageService_1.storageService) {
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
        await storageService_1.storageService.downloadFile(rootHash, tempPath);
        // Check if file was downloaded successfully
        if (!fs.existsSync(tempPath)) {
            return res.status(404).json({ error: 'File not found or download failed' });
        }
        // Send file to client
        res.download(tempPath, filename, (err) => {
            // Clean up temporary file after download
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
            if (err) {
                console.error('❌ Download error:', err);
            }
        });
    }
    catch (error) {
        console.error('❌ Download error:', error);
        res.status(500).json({
            error: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
});
/**
 * Upload key-value data to 0G-KV
 */
router.post('/kv/upload', express_1.default.json(), async (req, res) => {
    try {
        if (!storageService_1.storageService) {
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
        const txHash = await storageService_1.storageService.uploadToKV(streamId, key, value);
        res.json({
            success: true,
            data: {
                streamId,
                key,
                txHash,
                uploadTime: new Date().toISOString()
            }
        });
    }
    catch (error) {
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
        if (!storageService_1.storageService) {
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
        const value = await storageService_1.storageService.downloadFromKV(streamId, key);
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
    }
    catch (error) {
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
        if (!storageService_1.storageService) {
            return res.status(500).json({
                error: 'Storage service not initialized. Please configure PRIVATE_KEY environment variable.'
            });
        }
        console.log('📊 Getting storage statistics...');
        const stats = await storageService_1.storageService.getStorageStats();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
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
        if (!storageService_1.storageService) {
            return res.status(500).json({
                error: 'Storage service not initialized. Please configure PRIVATE_KEY environment variable.'
            });
        }
        const { rootHash } = req.params;
        if (!rootHash) {
            return res.status(400).json({ error: 'Root hash is required' });
        }
        console.log(`🔍 Verifying file: ${rootHash}`);
        const isValid = await storageService_1.storageService.verifyFile(rootHash);
        res.json({
            success: true,
            data: {
                rootHash,
                isValid,
                verificationTime: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('❌ Verification error:', error);
        res.status(500).json({
            error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
});
exports.default = router;
//# sourceMappingURL=storage.js.map