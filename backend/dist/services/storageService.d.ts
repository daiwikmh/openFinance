export declare class ZGStorageService {
    private indexer;
    private provider;
    private signer;
    constructor(privateKey: string);
    /**
     * Upload file to 0G Storage Network
     */
    uploadFile(filePath: string): Promise<{
        rootHash: string;
        txHash: string;
    }>;
    /**
     * Upload data from buffer to 0G Storage
     */
    uploadBuffer(buffer: Buffer, filename: string): Promise<{
        rootHash: string;
        txHash: string;
    }>;
    /**
     * Download file from 0G Storage Network
     */
    downloadFile(rootHash: string, outputPath: string): Promise<void>;
    /**
     * Upload key-value data to 0G-KV
     */
    uploadToKV(streamId: string, key: string, value: string): Promise<string>;
    /**
     * Download value from 0G-KV
     */
    downloadFromKV(streamId: string, key: string): Promise<string | null>;
    /**
     * List stored files (metadata)
     */
    listStoredFiles(): Promise<Array<{
        rootHash: string;
        filename: string;
        uploadTime: Date;
    }>>;
    /**
     * Get storage statistics
     */
    getStorageStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        totalTransactions: number;
    }>;
    /**
     * Verify file integrity
     */
    verifyFile(rootHash: string): Promise<boolean>;
}
export declare const storageService: ZGStorageService;
export default ZGStorageService;
//# sourceMappingURL=storageService.d.ts.map