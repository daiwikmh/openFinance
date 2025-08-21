import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Terminal, Trash2, Info, AlertTriangle, AlertCircle, Send, Shield, Globe, MessageSquare, CheckCircle } from "lucide-react";
import { modelsService, LogEntry, ServiceModel } from "./models-service";

export const ModelFetcher = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [models, setModels] = useState<ServiceModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<ServiceModel | null>(null);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("models");

  const refreshData = () => {
    const currentLogs = modelsService.getLogs();
    const currentModels = modelsService.getAvailableModels();
    setLogs(currentLogs);
    setModels(currentModels);
  };

  const clearLogs = () => {
    modelsService.clearLogs();
    setLogs([]);
  };

  const handleAcknowledgeProvider = async (providerAddress: string) => {
    setAcknowledging(providerAddress);
    
    setTimeout(() => {
      modelsService.acknowledgeProvider(providerAddress);
      refreshData();
      setAcknowledging(null);
    }, 1000);
  };

  const handleSelectModel = (model: ServiceModel) => {
    setSelectedModel(model);
    setActiveTab("chat");
    setResponse("");
    setMessage("");
  };

  const handleSendMessage = async () => {
    if (!selectedModel || !message.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const modelResponse = await modelsService.sendRequest(selectedModel.provider, message);
      setResponse(modelResponse);
      refreshData();
    } catch (error) {
      setResponse("Error: Failed to get response from model");
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleLog = () => {
    const sampleMessages = [
      'Service request initiated',
      'Provider response received',
      'Transaction confirmed on chain',
      'Model inference completed',
      'Fee settlement processed'
    ];
    const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    const randomLevel = Math.random() > 0.8 ? 'warn' : Math.random() > 0.9 ? 'error' : 'info';
    
    modelsService.addLog(randomLevel as LogEntry['level'], randomMessage, {
      timestamp: Date.now(),
      provider: '0xf07...5Dd'
    });
    refreshData();
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const metrics = modelsService.getModelMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="h-6 w-6" />
            0G Compute Network
          </h2>
          <p className="text-muted-foreground">Interact with AI models and monitor broker activity</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addSampleLog} variant="outline" size="sm">
            Add Log
          </Button>
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Network Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.totalModels}</div>
              <div className="text-sm text-muted-foreground">Available Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.acknowledgedModels}</div>
              <div className="text-sm text-muted-foreground">Acknowledged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.verifiedModels}</div>
              <div className="text-sm text-muted-foreground">TEE Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.totalLogs}</div>
              <div className="text-sm text-muted-foreground">Total Logs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models">Available Models</TabsTrigger>
          <TabsTrigger value="chat">Model Chat</TabsTrigger>
          <TabsTrigger value="logs">Broker Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {models.map((model, index) => (
              <Card key={index} className={selectedModel?.provider === model.provider ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{model.model}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {model.provider.slice(0, 6)}...{model.provider.slice(-4)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {model.acknowledged && (
                        <Badge variant="default" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                      {model.verifiability && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          {model.verifiability}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Input Price</p>
                        <p className="font-medium">{model.inputPrice} OG</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Output Price</p>
                        <p className="font-medium">{model.outputPrice} OG</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {!model.acknowledged && (
                        <Button 
                          onClick={() => handleAcknowledgeProvider(model.provider)}
                          disabled={acknowledging === model.provider}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          {acknowledging === model.provider ? "Acknowledging..." : "Acknowledge"}
                        </Button>
                      )}
                      <Button 
                        onClick={() => handleSelectModel(model)}
                        size="sm"
                        className="flex-1"
                        variant={selectedModel?.provider === model.provider ? "default" : "outline"}
                      >
                        {selectedModel?.provider === model.provider ? "Chat Now" : "Select & Chat"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          {selectedModel ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chat with {selectedModel.model}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Provider: {selectedModel.provider.slice(0, 6)}...{selectedModel.provider.slice(-4)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Message</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask the AI model a question..."
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !message.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>

                  {response && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Response from {selectedModel.model}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{response}</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a model from the "Available Models" tab to start chatting</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Broker Activity Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full">
                <div className="space-y-2 font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No logs available</p>
                      <p className="text-xs">Interact with models or click "Add Log" to see activity</p>
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getLevelIcon(log.level)}
                            <Badge variant="outline" className={`text-xs ${getLevelColor(log.level)}`}>
                              {log.level.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pl-6">
                          <p className="text-sm">{log.message}</p>
                          
                          {log.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                View Details
                              </summary>
                              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};