import { useState, useEffect } from 'react';
import VideoPanel from './VideoPanel';
import VideoUploadModal from './VideoUploadModal';
import { VideoFeed } from '@/types/employee';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, VideoIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/appStore';

interface VideoGridProps {
  onEnrollEmployee: (feedId: string) => void;
}

const VideoGrid = ({ onEnrollEmployee }: VideoGridProps) => {
  const { toast } = useToast();
  const { state, addFeed, deleteFeed } = useAppStore();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const handleVideoUpload = (videoUrl: string) => {
    // VideoUploadModal handles feed creation internally
    // This callback is just for additional actions if needed
    console.log('Video uploaded:', videoUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Camera Video Feeds</h2>
          <p className="text-muted-foreground">
            {state.feeds.length === 0 ? 'No feeds uploaded yet' : 
             `${state.feeds.filter(f => f.status === 'active').length} of ${state.feeds.length} cameras active`}
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

      {state.feeds.length === 0 ? (
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
          {state.feeds.map((feed) => (
            <VideoPanel
              key={feed.id}
              feed={feed}
              onEnrollEmployee={() => onEnrollEmployee(feed.id)}
              onDeleteFeed={(feedId) => deleteFeed(feedId)}
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