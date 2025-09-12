import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, AlertTriangle, Settings } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface CameraFeedGridProps {
  onEnrollEmployee: (feedId: string) => void;
}

const CameraFeedGrid = ({ onEnrollEmployee }: CameraFeedGridProps) => {
  const { state } = useAppStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return null;
      case 'inactive': return 'Offline';
      case 'error': return <AlertTriangle className="h-3 w-3" />;
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
        {state.feeds.length === 0 ? (
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
            {state.feeds.map((feed) => (
            <Card key={feed.id} className="border bg-white">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Camera className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{feed.name}</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs text-muted-foreground">ID: {feed.id}</span>
                    <Badge variant={getStatusColor(feed.status) as any} className="text-xs w-fit">
                      {feed.status === 'active' ? 'Active' : feed.status === 'inactive' ? 'Inactive' : 'Error'}
                    </Badge>
                    {feed.status === 'error' && <AlertTriangle className="h-3 w-3 text-destructive" />}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  {feed.lastFrame ? (
                    feed.lastFrame.startsWith('blob:') ? (
                      <video
                        src={feed.lastFrame}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={feed.lastFrame} 
                        alt={`${feed.name} feed`}
                        className="w-full h-full object-cover"
                      />
                    )
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
                  onClick={() => onEnrollEmployee(feed.id)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {feed.lastFrame ? 'Enroll Employee' : 'Upload Video'}
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