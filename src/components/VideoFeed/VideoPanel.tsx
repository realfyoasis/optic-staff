import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoFeed, DetectedEmployee, Incident } from '@/types/employee';
import { 
  Camera, 
  AlertTriangle, 
  UserPlus, 
  Maximize2, 
  Users,
  Wifi,
  WifiOff 
} from 'lucide-react';

interface VideoPanelProps {
  feed: VideoFeed;
  onEnrollEmployee: () => void;
}

const VideoPanel = ({ feed, onEnrollEmployee }: VideoPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: VideoFeed['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-warning';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const renderOverlays = () => {
    if (!feed.lastFrame) return null;

    return (
      <div className="absolute inset-0">
        {/* Employee Detection Boxes */}
        {feed.employees.map((employee, index) => (
          <div
            key={`emp-${employee.employeeId}-${index}`}
            className="absolute border-2 border-success animate-pulse-glow"
            style={{
              left: `${(employee.bbox.x / 640) * 100}%`,
              top: `${(employee.bbox.y / 480) * 100}%`,
              width: `${(employee.bbox.width / 640) * 100}%`,
              height: `${(employee.bbox.height / 480) * 100}%`,
            }}
          >
            <div className="absolute -top-6 left-0 bg-success text-success-foreground text-xs px-2 py-1 rounded">
              {employee.name} ({Math.round(employee.confidence * 100)}%)
            </div>
          </div>
        ))}

        {/* Incident Detection Boxes */}
        {feed.incidents.map((incident, index) => (
          incident.bbox && (
            <div
              key={`inc-${incident.id}-${index}`}
              className="absolute border-2 border-destructive animate-pulse-glow"
              style={{
                left: `${(incident.bbox.x / 640) * 100}%`,
                top: `${(incident.bbox.y / 480) * 100}%`,
                width: `${(incident.bbox.width / 640) * 100}%`,
                height: `${(incident.bbox.height / 480) * 100}%`,
              }}
            >
              <div className="absolute -top-6 left-0 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                {incident.type.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <Card className={`group relative overflow-hidden bg-gradient-to-br from-card to-card/80 border transition-all duration-300 ${
      isExpanded ? 'lg:col-span-2 lg:row-span-2' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">{feed.name}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {feed.status === 'active' ? (
              <Wifi className="h-4 w-4 text-success animate-pulse-glow" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge variant={getStatusColor(feed.status) as any}>
              {feed.status}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{feed.location}</p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted overflow-hidden">
          {feed.lastFrame ? (
            <>
              <img 
                src={feed.lastFrame} 
                alt={`${feed.name} feed`}
                className="w-full h-full object-cover"
              />
              {renderOverlays()}
              
              {/* Live indicator */}
              {feed.status === 'active' && (
                <div className="absolute top-2 right-2 flex items-center space-x-1 bg-destructive/90 text-destructive-foreground text-xs px-2 py-1 rounded">
                  <div className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse-glow" />
                  <span>LIVE</span>
                </div>
              )}

              {/* Stats overlay */}
              <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {feed.employees.length}
                  </span>
                  {feed.incidents.length > 0 && (
                    <span className="flex items-center text-destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {feed.incidents.length}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="p-3 bg-gradient-to-r from-card to-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8"
              >
                <Maximize2 className="h-3 w-3 mr-1" />
                {isExpanded ? 'Minimize' : 'Expand'}
              </Button>
              
              <Button
                size="sm"
                onClick={onEnrollEmployee}
                className="h-8 bg-primary hover:bg-primary/90"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Enroll
              </Button>
            </div>

            {/* Incident alerts */}
            <div className="flex space-x-1">
              {feed.incidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`w-2 h-2 rounded-full ${getSeverityColor(incident.severity)} animate-pulse-glow`}
                  title={`${incident.type}: ${incident.description}`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPanel;