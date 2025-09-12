import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VideoFeed } from '@/types/employee';
import { useAppStore } from '@/store/appStore';
import { Upload, Video, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUpload: (videoUrl: string) => void;
}

const VideoUploadModal = ({ isOpen, onClose, onVideoUpload }: VideoUploadModalProps) => {
  const { toast } = useToast();
  const { addFeed } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [feedName, setFeedName] = useState('');
  const [feedLocation, setFeedLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setFeedName(file.name.replace(/\.[^/.]+$/, ""));
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a video file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !feedName || !feedLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a video file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const videoUrl = URL.createObjectURL(selectedFile);
      const newFeed: VideoFeed = {
        id: `feed-${Date.now()}`,
        name: feedName,
        status: 'active',
        location: feedLocation,
        lastFrame: videoUrl,
        incidents: [],
        employees: [],
      };

      addFeed(newFeed);
      onVideoUpload(videoUrl);
      toast({
        title: "Video Uploaded Successfully",
        description: `${feedName} has been added to your camera feeds.`,
      });
      handleClose();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFeedName('');
    setFeedLocation('');
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-primary" />
            <span>Upload Video Feed</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Video File</Label>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 justify-start"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Video File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {selectedFile && (
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4 text-primary" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedName" className="text-sm font-medium">Feed Name</Label>
            <Input
              id="feedName"
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              placeholder="e.g., Main Entrance Camera"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedLocation" className="text-sm font-medium">Location</Label>
            <Input
              id="feedLocation"
              value={feedLocation}
              onChange={(e) => setFeedLocation(e.target.value)}
              placeholder="e.g., Building A - Floor 1"
              disabled={isUploading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !feedName || !feedLocation || isUploading}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUploadModal;