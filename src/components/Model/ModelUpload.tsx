import { useState, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { YoloModel } from '@/types/employee';
import { 
  Upload, 
  File, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Camera,
  Shield,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ModelUploadProps {
  onModelUpload: (model: YoloModel) => void;
}

const ModelUpload = ({ onModelUpload }: ModelUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedModels, setUploadedModels] = useState<YoloModel[]>([
    {
      id: 'model001',
      name: 'YOLOv8n Person Detection',
      type: 'person_detection',
      fileName: 'yolov8n.pt',
      uploadDate: new Date(Date.now() - 86400000), // 1 day ago
      isActive: true,
      appliedFeeds: ['cam001', 'cam002', 'cam003'],
    },
    {
      id: 'model002', 
      name: 'Fire Detection Model',
      type: 'incident_detection',
      fileName: 'fire_detection.pt',
      uploadDate: new Date(Date.now() - 172800000), // 2 days ago
      isActive: false,
      appliedFeeds: [],
    },
  ]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelName, setModelName] = useState('');
  const [modelType, setModelType] = useState<'person_detection' | 'incident_detection'>('person_detection');
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);

  const availableFeeds = [
    { id: 'cam001', name: 'Office Floor 1' },
    { id: 'cam002', name: 'Reception Area' },
    { id: 'cam003', name: 'Hallway B' },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.pt')) {
        setSelectedFile(file);
        setModelName(file.name.replace('.pt', ''));
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a .pt model file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !modelName) {
      toast({
        title: "Missing Information",
        description: "Please select a model file and enter a name.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      const newModel: YoloModel = {
        id: `model${String(uploadedModels.length + 1).padStart(3, '0')}`,
        name: modelName,
        type: modelType,
        fileName: selectedFile.name,
        uploadDate: new Date(),
        isActive: selectedFeeds.length > 0,
        appliedFeeds: selectedFeeds,
      };

      setUploadedModels(prev => [...prev, newModel]);
      onModelUpload(newModel);

      toast({
        title: "Model Uploaded Successfully",
        description: `${modelName} has been uploaded and configured.`,
      });

      // Reset form
      setSelectedFile(null);
      setModelName('');
      setModelType('person_detection');
      setSelectedFeeds([]);
      setIsUploading(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 3000);
  };

  const handleToggleModel = (modelId: string) => {
    setUploadedModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, isActive: !model.isActive }
        : model
    ));
    
    const model = uploadedModels.find(m => m.id === modelId);
    if (model) {
      toast({
        title: model.isActive ? "Model Deactivated" : "Model Activated",
        description: `${model.name} has been ${model.isActive ? 'deactivated' : 'activated'}.`,
      });
    }
  };

  const handleDeleteModel = (modelId: string) => {
    const model = uploadedModels.find(m => m.id === modelId);
    if (model) {
      setUploadedModels(prev => prev.filter(m => m.id !== modelId));
      toast({
        title: "Model Deleted",
        description: `${model.name} has been removed from the system.`,
      });
    }
  };

  const handleFeedToggle = (feedId: string) => {
    setSelectedFeeds(prev => 
      prev.includes(feedId)
        ? prev.filter(id => id !== feedId)
        : [...prev, feedId]
    );
  };

  const getModelTypeIcon = (type: YoloModel['type']) => {
    return type === 'person_detection' ? Camera : Shield;
  };

  const getModelTypeColor = (type: YoloModel['type']) => {
    return type === 'person_detection' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning';
  };

  return (
    <div className="space-y-6">
      {/* Upload New Model */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>YOLO Model Management</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Model File</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select .pt File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                {selectedFile && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <File className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelName">Model Name</Label>
                <Input
                  id="modelName"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Enter model name"
                />
              </div>

              <div className="space-y-2">
                <Label>Model Type</Label>
                <Select value={modelType} onValueChange={(value: any) => setModelType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="person_detection">Person Detection</SelectItem>
                    <SelectItem value="incident_detection">Incident Detection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Feed Selection */}
            <div className="space-y-4">
              <Label>Apply to Feeds</Label>
              <div className="space-y-3">
                {availableFeeds.map((feed) => (
                  <div key={feed.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={feed.id}
                      checked={selectedFeeds.includes(feed.id)}
                      onCheckedChange={() => handleFeedToggle(feed.id)}
                    />
                    <Label htmlFor={feed.id} className="text-sm font-normal">
                      {feed.name}
                    </Label>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !modelName || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Model
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Models */}
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="text-lg">Uploaded Models</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {uploadedModels.map((model) => {
              const TypeIcon = getModelTypeIcon(model.type);
              
              return (
                <div
                  key={model.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-gradient-to-r from-background to-muted/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getModelTypeColor(model.type)}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground">{model.name}</h4>
                      <p className="text-sm text-muted-foreground">{model.fileName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {model.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Uploaded {model.uploadDate.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {model.isActive ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Badge variant={model.isActive ? 'default' : 'secondary'}>
                          {model.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {model.appliedFeeds.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied to {model.appliedFeeds.length} feeds
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleModel(model.id)}
                      >
                        {model.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteModel(model.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {uploadedModels.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No models uploaded yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelUpload;
