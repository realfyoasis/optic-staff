import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, AlertTriangle, Settings } from 'lucide-react';

interface CameraFeed {
  id: string;
  name: string;
  cameraId: string;
  status: 'active' | 'offline' | 'alert';
  hasVideo: boolean;
}

interface CameraFeedGridProps {
  onEnrollEmployee: (feedId: string) => void;
}

const CameraFeedGrid = ({ onEnrollEmployee }: CameraFeedGridProps) => {
  // No dummy cameras - only show uploaded feeds
  const [cameras] = useState<CameraFeed[]>([]);

  const getStatusColor = (status: CameraFeed['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'offline': return 'secondary';
      case 'alert': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: CameraFeed['status']) => {
    switch (status) {
      case 'active': return null;
      case 'offline': return 'Offline';
      case 'alert': return <AlertTriangle className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <Card className="bg-card shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">Camera Feeds</CardTitle>
          <Button variant="outline" size="sm" onClick={() => onEnrollEmployee('upload')}>
            <Settings className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {cameras.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Camera Feeds</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Upload camera videos to start monitoring employees with facial recognition.
            </p>
            <Button onClick={() => onEnrollEmployee('upload')} className="bg-primary hover:bg-primary/90">
              <Upload className="h-4 w-4 mr-2" />
              Upload First Video
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cameras.map((camera) => (
            <Card key={camera.id} className="border bg-white">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{camera.name}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs text-muted-foreground">ID: {camera.cameraId}</span>
                    <Badge variant={getStatusColor(camera.status) as any} className="text-xs w-fit">
                      {camera.status === 'active' ? 'Active' : camera.status === 'offline' ? 'Offline' : 'Alert'}
                    </Badge>
                    {camera.status === 'alert' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  {camera.hasVideo ? (
                    <div className="text-muted-foreground">Video Feed Active</div>
                  ) : (
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No video uploaded</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={() => onEnrollEmployee(camera.id)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraFeedGrid;