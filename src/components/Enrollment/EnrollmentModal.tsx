import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnrollmentCanvas from './EnrollmentCanvas';
import VideoUploadModal from '@/components/VideoFeed/VideoUploadModal';
import { Employee, VideoFeed } from '@/types/employee';
import { useAppStore } from '@/store/appStore';
import { 
  User, 
  Mail, 
  Briefcase, 
  Save, 
  X,
  CheckCircle,
  Camera,
  Crop,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedId?: string;
  feedImage?: string;
}

interface EnrollmentData {
  id: string;
  name: string;
  role: string;
  contact: string;
  faceCrop?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

const EnrollmentModal = ({ isOpen, onClose, feedId, feedImage }: EnrollmentModalProps) => {
  const { toast } = useToast();
  const { addEmployee, updateFeed, addFeed, state } = useAppStore();
  const [step, setStep] = useState<'upload' | 'capture' | 'form' | 'processing' | 'complete'>('upload');
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({
    id: '',
    name: '',
    role: '',
    contact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFeedImage, setCurrentFeedImage] = useState<string>(feedImage || '');
  // Video frame capture support
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameImage, setFrameImage] = useState<string | null>(null);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const isVideoSource = !!currentFeedImage && (currentFeedImage.startsWith('blob:') || /(mp4|webm|ogg|mov)$/i.test(currentFeedImage));

  // Set step when modal opens or feed changes
  useEffect(() => {
    if (!isOpen) return;
    if (feedId === 'upload' && !currentFeedImage) {
      setStep('upload');
    } else {
      setStep('capture');
    }
  }, [isOpen, feedId, currentFeedImage]);

  const grabFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 360;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/png');
    setFrameImage(dataUrl);
  };

  const handleFaceCapture = (faceCrop: string, boundingBox: { x: number; y: number; width: number; height: number }) => {
    setEnrollmentData(prev => ({
      ...prev,
      faceCrop,
      boundingBox,
    }));
    setStep('form');
  };

  const handleInputChange = (field: keyof EnrollmentData, value: string) => {
    setEnrollmentData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVideoUploaded = (videoUrl: string) => {
    setCurrentFeedImage(videoUrl);
    setShowVideoUpload(false);
    setStep('capture');
  };

  const handleSubmit = async () => {
    if (!enrollmentData.name || !enrollmentData.role || !enrollmentData.contact) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setStep('processing');

    try {
      // Simulate enrollment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new employee
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        name: enrollmentData.name,
        role: enrollmentData.role,
        contact: enrollmentData.contact,
        status: 'online',
        currentLocation: feedId === 'upload' ? 'Unknown' : `Camera ${feedId}`,
        lastSeen: new Date(),
        embeddingPath: enrollmentData.faceCrop,
        image: enrollmentData.faceCrop,
      };

      addEmployee(newEmployee);

      // Handle video upload case
      if (feedId === 'upload' && currentFeedImage) {
        const newFeed: VideoFeed = {
          id: `feed-${Date.now()}`,
          name: `Camera ${Date.now().toString().slice(-4)}`,
          status: 'active',
          location: 'Uploaded Location',
          lastFrame: currentFeedImage,
          incidents: [],
          employees: [],
        };
        addFeed(newFeed);
      } else if (feedId !== 'upload') {
        // Update existing feed
        const existingFeed = state.feeds.find(f => f.id === feedId);
        if (existingFeed) {
          updateFeed({
            ...existingFeed,
            employees: [
              ...existingFeed.employees,
              {
                employeeId: newEmployee.id,
                name: newEmployee.name,
                confidence: 0.95,
                bbox: enrollmentData.boundingBox || { x: 100, y: 100, width: 150, height: 200 },
                timestamp: new Date(),
              }
            ]
          });
        }
      }

      toast({
        title: "Employee Enrolled Successfully",
        description: `${enrollmentData.name} has been enrolled and can now be detected on camera feeds.`,
      });

      setStep('complete');
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll employee. Please try again.",
        variant: "destructive",
      });
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(feedId === 'upload' && !currentFeedImage ? 'upload' : 'capture');
    setEnrollmentData({
      id: '',
      name: '',
      role: '',
      contact: '',
    });
    setFrameImage(null);
    setCurrentFeedImage(feedImage || '');
    setIsSubmitting(false);
    setShowVideoUpload(false);
    onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground">Upload Video Feed</h3>
              <p className="text-sm text-muted-foreground">
                Upload a video file to create a new camera feed for employee enrollment
              </p>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowVideoUpload(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Upload className="h-4 w-4 mr-2" />
                Select Video File
              </Button>
            </div>
          </div>
        );
      case 'capture':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Camera className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground">Capture Employee Face</h3>
              <p className="text-sm text-muted-foreground">
                Draw a bounding box around the employee's face in the video feed
              </p>
            </div>
            
            {isVideoSource ? (
              frameImage ? (
                <>
                  <EnrollmentCanvas 
                    imageUrl={frameImage}
                    onFaceCapture={handleFaceCapture}
                  />
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setFrameImage(null)}>
                      Retake Frame
                    </Button>
                  </div>
                </>
              ) : (
                <div>
                  <video
                    ref={videoRef}
                    src={currentFeedImage}
                    className="w-full rounded-lg border"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  />
                  <div className="flex justify-end mt-3">
                    <Button onClick={grabFrame} className="bg-primary hover:bg-primary/90">
                      Capture Frame
                    </Button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )
            ) : currentFeedImage ? (
              <EnrollmentCanvas 
                imageUrl={currentFeedImage}
                onFaceCapture={handleFaceCapture}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No feed image available. Please upload a video first.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setStep('upload')}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'form':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {enrollmentData.faceCrop && (
                <div className="flex-shrink-0">
                  <img 
                    src={enrollmentData.faceCrop} 
                    alt="Captured face"
                    className="w-20 h-20 rounded-lg object-cover border border-border"
                  />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-foreground">Employee Details</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the employee information below
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="employeeId"
                    placeholder="EMP001"
                    value={enrollmentData.id}
                    onChange={(e) => handleInputChange('id', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeName">Full Name *</Label>
                <Input
                  id="employeeName"
                  placeholder="John Doe"
                  value={enrollmentData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeRole">Role *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="employeeRole"
                    placeholder="Software Engineer"
                    value={enrollmentData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeContact">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="employeeContact"
                    type="email"
                    placeholder="john.doe@company.com"
                    value={enrollmentData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Processing Enrollment</h3>
              <p className="text-sm text-muted-foreground">
                Generating face embedding and updating employee database...
              </p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6 py-8">
            <CheckCircle className="h-16 w-16 text-success mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Enrollment Complete!</h3>
              <p className="text-sm text-muted-foreground">
                {enrollmentData.name} has been successfully enrolled in the system.
              </p>
            </div>
            
            <Card className="bg-muted/30 border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-4">
                  {enrollmentData.faceCrop && (
                    <img 
                      src={enrollmentData.faceCrop} 
                      alt="Enrolled employee"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{enrollmentData.name}</p>
                    <p className="text-sm text-muted-foreground">{enrollmentData.role}</p>
                    <Badge variant="outline" className="mt-1">ID: {enrollmentData.id}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  const renderActions = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        );
      case 'capture':
        return (
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        );

      case 'form':
        return (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('capture')}>
              Back to Capture
            </Button>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                Enroll Employee
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return null;

      case 'complete':
        return (
          <div className="flex justify-center">
            <Button onClick={handleClose}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Done
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Employee Enrollment</span>
            {feedId && (
              <Badge variant="outline">Feed: {feedId}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {renderStepContent()}
          {renderActions()}
        </div>
      </DialogContent>

      {/* Video Upload Modal */}
      <VideoUploadModal 
        isOpen={showVideoUpload}
        onClose={() => setShowVideoUpload(false)}
        onVideoUpload={handleVideoUploaded}
      />
    </Dialog>
  );
};

export default EnrollmentModal;