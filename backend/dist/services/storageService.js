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
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.ZGStorageService = void 0;
const { ZgFile, Indexer, Batcher, KvClient } = require('@0glabs/0g-ts-sdk');
const ethers_1 = require("ethers");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Network Constants
const RPC_URL = 'https://evmrpc-testnet.0g.ai/';
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai';
class ZGStorageService {
    constructor(privateKey) {
        // Initialize provider and signer
        this.provider = new ethers_1.ethers.JsonRpcProvider(RPC_URL);
        this.signer = new ethers_1.ethers.Wallet(privateKey, this.provider);
        // Initialize indexer
        this.indexer = new Indexer(INDEXER_RPC);
        console.log('🗄️ 0G Storage Service initialized');
        console.log(`📡 RPC URL: ${RPC_URL}`);
        console.log(`🔍 Indexer RPC: ${INDEXER_RPC}`);
        console.log(`👤 Signer Address: ${this.signer.address}`);
    }
    /**
     * Upload file to 0G Storage Network
     */
    async uploadFile(filePath) {
        try {
            console.log(`📤 Uploading file: ${filePath}`);
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                throw new Error(`File not found: ${filePath}`);
            }
            // Create file object from file path
            const file = await ZgFile.fromFilePath(filePath);
            console.log(`📁 File object created for: ${path.basename(filePath)}`);
            // Generate Merkle tree for verification
            const [tree, treeErr] = await file.merkleTree();
            if (treeErr !== null) {
                await file.close();
                throw new Error(`Error generating Merkle tree: ${treeErr}`);
            }
            // Get root hash for future reference
            const rootHash = tree?.rootHash() || '';
            console.log(`🌳 File Root Hash: ${rootHash}`);
            // Upload to network
            const [tx, uploadErr] = await this.indexer.upload(file, RPC_URL, this.signer);
            if (uploadErr !== null) {
                await file.close();
                throw new Error(`Upload error: ${uploadErr}`);
            }
            console.log(`✅ Upload successful! Transaction: ${tx}`);
            // Always close the file when done
            await file.close();
            return { rootHash, txHash: tx };
        }
        catch (error) {
            console.error('❌ File upload failed:', error);
            throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Upload data from buffer to 0G Storage
     */
    async uploadBuffer(buffer, filename) {
        try {
            console.log(`📤 Uploading buffer as: ${filename}`);
            // Create file object from buffer
            const file = await ZgFile.fromBuffer(buffer, filename);
            console.log(`📁 File object created from buffer: ${filename}`);
            // Generate Merkle tree for verification
            const [tree, treeErr] = await file.merkleTree();
            if (treeErr !== null) {
                await file.close();
                throw new Error(`Error generating Merkle tree: ${treeErr}`);
            }
            // Get root hash for future reference
            const rootHash = tree?.rootHash() || '';
            console.log(`🌳 Buffer Root Hash: ${rootHash}`);
            // Upload to network
            const [tx, uploadErr] = await this.indexer.upload(file, RPC_URL, this.signer);
            if (uploadErr !== null) {
                await file.close();
                throw new Error(`Upload error: ${uploadErr}`);
            }
            console.log(`✅ Buffer upload successful! Transaction: ${tx}`);
            // Always close the file when done
            await file.close();
            return { rootHash, txHash: tx };
        }
        catch (error) {
            console.error('❌ Buffer upload failed:', error);
            throw new Error(`Buffer upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Download file from 0G Storage Network
     */
    async downloadFile(rootHash, outputPath) {
        try {
            console.log(`📥 Downloading file with root hash: ${rootHash}`);
            console.log(`💾 Output path: ${outputPath}`);
            // Ensure output directory exists
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            // Download with Merkle proof verification enabled
            const err = await this.indexer.download(rootHash, outputPath, true);
            if (err !== null) {
                throw new Error(`Download error: ${err}`);
            }
            console.log(`✅ Download successful! File saved to: ${outputPath}`);
        }
        catch (error) {
            console.error('❌ File download failed:', error);
            throw new Error(`File download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Upload key-value data to 0G-KV
     */
    async uploadToKV(streamId, key, value) {
        try {
            console.log(`📤 Uploading to KV - Stream: ${streamId}, Key: ${key}`);
            // Select nodes for storage
            const [nodes, err] = await this.indexer.selectNodes(1);
            if (err !== null) {
                throw new Error(`Error selecting nodes: ${err}`);
            }
            console.log(`🔗 Selected ${nodes.length} storage nodes`);
            // Create batcher for KV operations
            const batcher = new Batcher(1, nodes, null, RPC_URL); // flowContract can be null for basic operations
            // Convert key and value to bytes
            const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
            const valueBytes = Uint8Array.from(Buffer.from(value, 'utf-8'));
            // Set key-value pair in stream
            batcher.streamDataBuilder.set(streamId, keyBytes, valueBytes);
            // Execute batch upload
            const [tx, batchErr] = await batcher.exec();
            if (batchErr !== null) {
                throw new Error(`Batch execution error: ${batchErr}`);
            }
            console.log(`✅ KV upload successful! Transaction: ${tx}`);
            return tx;
        }
        catch (error) {
            console.error('❌ KV upload failed:', error);
            throw new Error(`KV upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Download value from 0G-KV
     */
    async downloadFromKV(streamId, key) {
        try {
            console.log(`📥 Downloading from KV - Stream: ${streamId}, Key: ${key}`);
            // Create KV client
            const kvClient = new KvClient("http://3.101.147.150:6789");
            // Convert key to bytes and encode
            const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
            const encodedKey = ethers_1.ethers.encodeBase64(keyBytes);
            // Get value from KV store
            const value = await kvClient.getValue(streamId, encodedKey);
            if (value) {
                console.log(`✅ KV download successful! Key: ${key}`);
                return value;
            }
            else {
                console.log(`ℹ️ No value found for key: ${key}`);
                return null;
            }
        }
        catch (error) {
            console.error('❌ KV download failed:', error);
            throw new Error(`KV download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * List stored files (metadata)
     */
    async listStoredFiles() {
        // This would typically be stored in a database or KV store
        // For demonstration, return empty array
        console.log('📋 Listing stored files...');
        return [];
    }
    /**
     * Get storage statistics
     */
    async getStorageStats() {
        try {
            console.log('📊 Getting storage statistics...');
            // This would typically aggregate data from your database
            // For demonstration, return mock stats
            return {
                totalFiles: 0,
                totalSize: 0,
                totalTransactions: 0
            };
        }
        catch (error) {
            console.error('❌ Failed to get storage stats:', error);
            throw new Error(`Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Verify file integrity
     */
    async verifyFile(rootHash) {
        try {
            console.log(`🔍 Verifying file integrity for: ${rootHash}`);
            // This would implement Merkle proof verification
            // For now, return true as placeholder
            return true;
        }
        catch (error) {
            console.error('❌ File verification failed:', error);
            return false;
        }
    }
}
exports.ZGStorageService = ZGStorageService;
// Export singleton instance (will be initialized with env variable)
exports.storageService = process.env.PRIVATE_KEY
    ? new ZGStorageService(process.env.PRIVATE_KEY)
    : null;
exports.default = ZGStorageService;
//# sourceMappingURL=storageService.js.map