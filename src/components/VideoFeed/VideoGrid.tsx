import { useState, useEffect } from 'react';
import VideoPanel from './VideoPanel';
import { VideoFeed } from '@/types/employee';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import feed1 from '@/assets/feed1.jpg';
import feed2 from '@/assets/feed2.jpg';  
import feed3 from '@/assets/feed3.jpg';

const mockFeeds: VideoFeed[] = [
  {
    id: 'cam001',
    name: 'Office Floor 1',
    status: 'active',
    location: 'Main Office Area',
    lastFrame: feed1,
    incidents: [],
    employees: [
      {
        employeeId: '001',
        name: 'John Anderson',
        confidence: 0.94,
        bbox: { x: 120, y: 80, width: 80, height: 120 },
        timestamp: new Date(),
      }
    ],
  },
  {
    id: 'cam002',
    name: 'Reception Area',
    status: 'active',
    location: 'Building Entrance',
    lastFrame: feed2,
    incidents: [
      {
        id: 'inc001',
        type: 'unauthorized_access',
        severity: 'medium',
        timestamp: new Date(Date.now() - 300000),
        location: 'Reception Area',
        bbox: { x: 200, y: 60, width: 70, height: 110 },
        description: 'Unrecognized person detected',
      }
    ],
    employees: [],
  },
  {
    id: 'cam003',
    name: 'Hallway B',
    status: 'active',
    location: 'Corridor B Wing',
    lastFrame: feed3,
    incidents: [],
    employees: [
      {
        employeeId: '003',
        name: 'Michael Chen',
        confidence: 0.87,
        bbox: { x: 180, y: 90, width: 75, height: 115 },
        timestamp: new Date(),
      }
    ],
  },
];

interface VideoGridProps {
  onEnrollEmployee: (feedId: string) => void;
}

const VideoGrid = ({ onEnrollEmployee }: VideoGridProps) => {
  const [feeds, setFeeds] = useState<VideoFeed[]>(mockFeeds);
  const [isUploading, setIsUploading] = useState(false);

  // Simulate real-time feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFeeds(prev => prev.map(feed => ({
        ...feed,
        employees: feed.employees.map(emp => ({
          ...emp,
          confidence: Math.max(0.5, emp.confidence + (Math.random() - 0.5) * 0.1),
          timestamp: new Date(),
        })),
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleVideoUpload = () => {
    setIsUploading(true);
    
    // Simulate video upload process
    setTimeout(() => {
      const newFeed: VideoFeed = {
        id: `cam${String(feeds.length + 1).padStart(3, '0')}`,
        name: `Camera ${feeds.length + 1}`,
        status: 'active',
        location: `Location ${feeds.length + 1}`,
        lastFrame: feed1, // Use a placeholder
        incidents: [],
        employees: [],
      };
      
      setFeeds(prev => [...prev, newFeed]);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Live Video Feeds</h2>
          <p className="text-muted-foreground">
            {feeds.filter(f => f.status === 'active').length} of {feeds.length} cameras active
          </p>
        </div>
        
        <Button 
          onClick={handleVideoUpload} 
          disabled={isUploading}
          className="bg-primary hover:bg-primary/90"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeds.map((feed) => (
          <VideoPanel
            key={feed.id}
            feed={feed}
            onEnrollEmployee={() => onEnrollEmployee(feed.id)}
          />
        ))}
        
        {feeds.length < 6 && (
          <Card className="bg-card border border-dashed border-border hover:border-primary/50 transition-colors">
            <div className="aspect-video flex items-center justify-center">
              <Button
                variant="ghost"
                onClick={handleVideoUpload}
                disabled={isUploading}
                className="flex-col h-auto p-8 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-8 w-8 mb-2" />
                <span>Add New Feed</span>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VideoGrid;