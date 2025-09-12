import { useState, useEffect } from 'react';
import VideoPanel from './VideoPanel';
import VideoUploadModal from './VideoUploadModal';
import { VideoFeed } from '@/types/employee';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, VideoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Start with empty feeds - only show uploaded videos
const initialFeeds: VideoFeed[] = [];

interface VideoGridProps {
  onEnrollEmployee: (feedId: string) => void;
}

const VideoGrid = ({ onEnrollEmployee }: VideoGridProps) => {
  const { toast } = useToast();
  const [feeds, setFeeds] = useState<VideoFeed[]>(initialFeeds);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Simulate real-time feed updates for facial recognition
  useEffect(() => {
    if (feeds.length === 0) return;

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
  }, [feeds.length]);

  const handleVideoUpload = (videoData: {
    file: File;
    name: string;
    location: string;
    description: string;
  }) => {
    // Create object URL for the uploaded video
    const videoUrl = URL.createObjectURL(videoData.file);
    
    const newFeed: VideoFeed = {
      id: `cam${String(feeds.length + 1).padStart(3, '0')}`,
      name: videoData.name,
      status: 'active',
      location: videoData.location,
      lastFrame: videoUrl, // Use actual uploaded video
      incidents: [],
      employees: [],
    };
    
    setFeeds(prev => [...prev, newFeed]);
    
    toast({
      title: "Video Feed Added",
      description: `${videoData.name} is now active and ready for facial recognition.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Camera Video Feeds</h2>
          <p className="text-muted-foreground">
            {feeds.length === 0 ? 'No feeds uploaded yet' : 
             `${feeds.filter(f => f.status === 'active').length} of ${feeds.length} cameras active`}
          </p>
        </div>
        
        <Button 
          onClick={() => setUploadModalOpen(true)}
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Video Feed
        </Button>
      </div>

      {feeds.length === 0 ? (
        <Card className="bg-card border-2 border-dashed border-border/50">
          <div className="p-12 text-center">
            <VideoIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Video Feeds Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload your first camera video to start monitoring and tracking employees using facial recognition.
            </p>
            <Button 
              onClick={() => setUploadModalOpen(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload First Video
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feeds.map((feed) => (
            <VideoPanel
              key={feed.id}
              feed={feed}
              onEnrollEmployee={() => onEnrollEmployee(feed.id)}
            />
          ))}
          
          <Card className="bg-card border border-dashed border-border hover:border-primary/50 transition-colors">
            <div className="aspect-video flex items-center justify-center">
              <Button
                variant="ghost"
                onClick={() => setUploadModalOpen(true)}
                className="flex-col h-auto p-8 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-8 w-8 mb-2" />
                <span>Add New Feed</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onVideoUpload={handleVideoUpload}
      />
    </div>
  );
};

export default VideoGrid;