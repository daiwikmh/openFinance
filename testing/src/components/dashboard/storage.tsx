import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Download, 
  Database, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Copy,
  Trash2,
  Eye,
  HardDrive,
  Key
} from 'lucide-react';

interface StorageFile {
  rootHash: string;
  filename: string;
  size: number;
  uploadTime: string;
  txHash: string;
}

interface KVPair {
  streamId: string;
  key: string;
  value: string;
  txHash?: string;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  totalTransactions: number;
}

export function Storage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // File storage state
  const [uploadedFiles, setUploadedFiles] = useState<StorageFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [textFilename, setTextFilename] = useState('');
  
  // KV storage state
  const [kvPairs, setKvPairs] = useState<KVPair[]>([]);
  const [streamId, setStreamId] = useState('');
  const [kvKey, setKvKey] = useState('');
  const [kvValue, setKvValue] = useState('');
  const [downloadStreamId, setDownloadStreamId] = useState('');
  const [downloadKey, setDownloadKey] = useState('');
  
  // Download state
  const [downloadHash, setDownloadHash] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');
  
  // Stats
  const [stats, setStats] = useState<StorageStats | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Backend API base URL
  const API_BASE_URL = '/api/storage';

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      clearMessages();
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newFile: StorageFile = result.data;
        setUploadedFiles(prev => [newFile, ...prev]);
        setSuccess(`File uploaded successfully! Root Hash: ${newFile.rootHash}`);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadText = async () => {
    if (!textContent.trim() || !textFilename.trim()) {
      setError('Please provide both content and filename');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/upload-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: textContent,
          filename: textFilename
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newFile: StorageFile = result.data;
        setUploadedFiles(prev => [newFile, ...prev]);
        setSuccess(`Text uploaded successfully! Root Hash: ${newFile.rootHash}`);
        setTextContent('');
        setTextFilename('');
      } else {
        setError(result.error || 'Text upload failed');
      }
    } catch (err) {
      setError(`Text upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = async () => {
    if (!downloadHash.trim()) {
      setError('Please provide a root hash to download');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const filename = downloadFilename.trim() || 'download';
      const response = await fetch(`${API_BASE_URL}/download/${downloadHash}?filename=${filename}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('File downloaded successfully!');
        setDownloadHash('');
        setDownloadFilename('');
      } else {
        const result = await response.json();
        setError(result.error || 'Download failed');
      }
    } catch (err) {
      setError(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadKV = async () => {
    if (!streamId.trim() || !kvKey.trim() || !kvValue.trim()) {
      setError('Please provide stream ID, key, and value');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/kv/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId: streamId,
          key: kvKey,
          value: kvValue
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newKV: KVPair = {
          streamId: result.data.streamId,
          key: result.data.key,
          value: kvValue,
          txHash: result.data.txHash
        };
        setKvPairs(prev => [newKV, ...prev]);
        setSuccess(`KV pair uploaded successfully! TX: ${result.data.txHash}`);
        setKvKey('');
        setKvValue('');
      } else {
        setError(result.error || 'KV upload failed');
      }
    } catch (err) {
      setError(`KV upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadKV = async () => {
    if (!downloadStreamId.trim() || !downloadKey.trim()) {
      setError('Please provide stream ID and key');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      const response = await fetch(`${API_BASE_URL}/kv/${downloadStreamId}/${downloadKey}`);
      const result = await response.json();

      if (result.success) {
        const downloadedKV: KVPair = result.data;
        // Update existing or add new
        setKvPairs(prev => {
          const existing = prev.find(kv => kv.streamId === downloadedKV.streamId && kv.key === downloadedKV.key);
          if (existing) {
            return prev.map(kv => 
              kv.streamId === downloadedKV.streamId && kv.key === downloadedKV.key 
                ? downloadedKV 
                : kv
            );
          } else {
            return [downloadedKV, ...prev];
          }
        });
        setSuccess(`KV pair downloaded successfully! Value: ${downloadedKV.value.substring(0, 50)}...`);
        setDownloadStreamId('');
        setDownloadKey('');
      } else {
        setError(result.error || 'KV download failed');
      }
    } catch (err) {
      setError(`KV download failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-purple-500" />
            0G Storage Network
          </CardTitle>
          <CardDescription>
            Decentralized storage powered by 0G Labs infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-500">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Storage Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg mb-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Files</div>
                <div className="font-semibold">{stats.totalFiles}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total Size</div>
                <div className="font-semibold">{formatFileSize(stats.totalSize)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Transactions</div>
                <div className="font-semibold">{stats.totalTransactions}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Tabs */}
      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            File Storage
          </TabsTrigger>
          <TabsTrigger value="kv" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Key-Value Store
          </TabsTrigger>
          <TabsTrigger value="download" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </TabsTrigger>
        </TabsList>

        {/* File Storage Tab */}
        <TabsContent value="files">
          <div className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>
                  Upload files to the 0G Storage Network with automatic Merkle tree verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* File Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select File</label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept="*/*"
                  />
                  {selectedFile && (
                    <div className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </div>
                  )}
                  <Button
                    onClick={uploadFile}
                    disabled={!selectedFile || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload File
                  </Button>
                </div>

                {/* Text Upload */}
                <div className="border-t pt-4 space-y-2">
                  <label className="text-sm font-medium">Upload Text Content</label>
                  <Input
                    placeholder="Filename (e.g., document.txt)"
                    value={textFilename}
                    onChange={(e) => setTextFilename(e.target.value)}
                  />
                  <Textarea
                    placeholder="Enter text content to upload..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={4}
                  />
                  <Button
                    onClick={uploadText}
                    disabled={!textContent.trim() || !textFilename.trim() || isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Upload Text
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>
                  Files stored on the 0G Storage Network
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No files uploaded yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.rootHash} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{file.filename}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)} " {new Date(file.uploadTime).toLocaleDateString()}
                          </div>
                          <div className="text-xs font-mono text-muted-foreground">
                            Hash: {file.rootHash.slice(0, 20)}...
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(file.rootHash)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Key-Value Store Tab */}
        <TabsContent value="kv">
          <div className="space-y-6">
            {/* KV Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Key-Value Storage</CardTitle>
                <CardDescription>
                  Store key-value pairs in the 0G-KV distributed database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stream ID</label>
                    <Input
                      placeholder="stream-001"
                      value={streamId}
                      onChange={(e) => setStreamId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key</label>
                    <Input
                      placeholder="user-data"
                      value={kvKey}
                      onChange={(e) => setKvKey(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <Textarea
                    placeholder="Enter value to store..."
                    value={kvValue}
                    onChange={(e) => setKvValue(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={uploadKV}
                  disabled={!streamId.trim() || !kvKey.trim() || !kvValue.trim() || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  Store Key-Value
                </Button>
              </CardContent>
            </Card>

            {/* KV Download */}
            <Card>
              <CardHeader>
                <CardTitle>Retrieve Key-Value</CardTitle>
                <CardDescription>
                  Download values from the 0G-KV store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stream ID</label>
                    <Input
                      placeholder="stream-001"
                      value={downloadStreamId}
                      onChange={(e) => setDownloadStreamId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Key</label>
                    <Input
                      placeholder="user-data"
                      value={downloadKey}
                      onChange={(e) => setDownloadKey(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={downloadKV}
                  disabled={!downloadStreamId.trim() || !downloadKey.trim() || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Retrieve Value
                </Button>
              </CardContent>
            </Card>

            {/* Stored KV Pairs */}
            <Card>
              <CardHeader>
                <CardTitle>Stored Key-Value Pairs</CardTitle>
                <CardDescription>
                  Your stored data in the 0G-KV network
                </CardDescription>
              </CardHeader>
              <CardContent>
                {kvPairs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No key-value pairs stored yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {kvPairs.map((kv, index) => (
                      <div key={`${kv.streamId}-${kv.key}-${index}`} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{kv.streamId}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(kv.value)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Key:</span> {kv.key}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Value:</span> {kv.value.length > 100 ? `${kv.value.substring(0, 100)}...` : kv.value}
                        </div>
                        {kv.txHash && (
                          <div className="text-xs font-mono text-muted-foreground mt-1">
                            TX: {kv.txHash.slice(0, 20)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Download Tab */}
        <TabsContent value="download">
          <Card>
            <CardHeader>
              <CardTitle>Download Files</CardTitle>
              <CardDescription>
                Download files from the 0G Storage Network using root hash
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Root Hash</label>
                <Input
                  placeholder="0x1234abcd..."
                  value={downloadHash}
                  onChange={(e) => setDownloadHash(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Filename (optional)</label>
                <Input
                  placeholder="downloaded-file.txt"
                  value={downloadFilename}
                  onChange={(e) => setDownloadFilename(e.target.value)}
                />
              </div>
              <Button
                onClick={downloadFile}
                disabled={!downloadHash.trim() || isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download File
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}