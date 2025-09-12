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
  const [cameras] = useState<CameraFeed[]>([
    { id: 'cam001', name: 'Entrance', cameraId: 'CAM001', status: 'active', hasVideo: false },
    { id: 'cam002', name: 'Lobby', cameraId: 'CAM002', status: 'active', hasVideo: false },
    { id: 'cam003', name: 'Office Floor 1', cameraId: 'CAM003', status: 'active', hasVideo: false },
    { id: 'cam004', name: 'Parking', cameraId: 'CAM004', status: 'offline', hasVideo: false },
  ]);

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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Camera Feeds</CardTitle>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Manage Cameras
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cameras.map((camera) => (
            <Card key={camera.id} className="border bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-4 w-4 text-primary" />
                    <span className="font-medium">{camera.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">ID: {camera.cameraId}</span>
                    <Badge variant={getStatusColor(camera.status) as any} className="text-xs">
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
      </CardContent>
    </Card>
  );
};

export default CameraFeedGrid;