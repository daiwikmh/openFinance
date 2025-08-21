const { ZgFile, Indexer, Batcher, KvClient } = require('@0glabs/0g-ts-sdk');
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

// Network Constants
const RPC_URL = 'https://evmrpc-testnet.0g.ai/';
const INDEXER_RPC = 'https://indexer-storage-testnet-turbo.0g.ai';

export class ZGStorageService {
  private indexer: any;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor(privateKey: string) {
    // Initialize provider and signer
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    
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
  async uploadFile(filePath: string): Promise<{ rootHash: string; txHash: string }> {
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
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload data from buffer to 0G Storage
   */
  async uploadBuffer(buffer: Buffer, filename: string): Promise<{ rootHash: string; txHash: string }> {
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
    } catch (error) {
      console.error('❌ Buffer upload failed:', error);
      throw new Error(`Buffer upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download file from 0G Storage Network
   */
  async downloadFile(rootHash: string, outputPath: string): Promise<void> {
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
    } catch (error) {
      console.error('❌ File download failed:', error);
      throw new Error(`File download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload key-value data to 0G-KV
   */
  async uploadToKV(streamId: string, key: string, value: string): Promise<string> {
    try {
      console.log(`📤 Uploading to KV - Stream: ${streamId}, Key: ${key}`);
      
      // Select nodes for storage
      const [nodes, err] = await this.indexer.selectNodes(1);
      if (err !== null) {
        throw new Error(`Error selecting nodes: ${err}`);
      }
      
      console.log(`🔗 Selected ${nodes.length} storage nodes`);
      
      // Create batcher for KV operations
      const batcher = new Batcher(1, nodes, null as any, RPC_URL); // flowContract can be null for basic operations
      
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
    } catch (error) {
      console.error('❌ KV upload failed:', error);
      throw new Error(`KV upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download value from 0G-KV
   */
  async downloadFromKV(streamId: string, key: string): Promise<string | null> {
    try {
      console.log(`📥 Downloading from KV - Stream: ${streamId}, Key: ${key}`);
      
      // Create KV client
      const kvClient = new KvClient("http://3.101.147.150:6789");
      
      // Convert key to bytes and encode
      const keyBytes = Uint8Array.from(Buffer.from(key, 'utf-8'));
      const encodedKey = ethers.encodeBase64(keyBytes);
      
      // Get value from KV store
      const value = await kvClient.getValue(streamId, encodedKey);
      
      if (value) {
        console.log(`✅ KV download successful! Key: ${key}`);
        return value;
      } else {
        console.log(`ℹ️ No value found for key: ${key}`);
        return null;
      }
    } catch (error) {
      console.error('❌ KV download failed:', error);
      throw new Error(`KV download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List stored files (metadata)
   */
  async listStoredFiles(): Promise<Array<{ rootHash: string; filename: string; uploadTime: Date }>> {
    // This would typically be stored in a database or KV store
    // For demonstration, return empty array
    console.log('📋 Listing stored files...');
    return [];
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{ totalFiles: number; totalSize: number; totalTransactions: number }> {
    try {
      console.log('📊 Getting storage statistics...');
      
      // This would typically aggregate data from your database
      // For demonstration, return mock stats
      return {
        totalFiles: 0,
        totalSize: 0,
        totalTransactions: 0
      };
    } catch (error) {
      console.error('❌ Failed to get storage stats:', error);
      throw new Error(`Failed to get storage stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify file integrity
   */
  async verifyFile(rootHash: string): Promise<boolean> {
    try {
      console.log(`🔍 Verifying file integrity for: ${rootHash}`);
      
      // This would implement Merkle proof verification
      // For now, return true as placeholder
      return true;
    } catch (error) {
      console.error('❌ File verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance (will be initialized with env variable)
export const storageService = process.env.PRIVATE_KEY 
  ? new ZGStorageService(process.env.PRIVATE_KEY)
  : null;

export default ZGStorageService;