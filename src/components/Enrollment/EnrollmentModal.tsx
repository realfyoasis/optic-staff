import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { User, Upload, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import EnrollmentCanvas from './EnrollmentCanvas';
import { AutoFaceDetection } from './AutoFaceDetection';
import { FaceEmbeddingStorage } from '@/utils/faceEmbeddings';
import { Employee } from '@/types/employee';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedId?: string;
  feedImage?: string;
}

export const EnrollmentModal = ({
  isOpen,
  onClose,
  feedId,
  feedImage
}: EnrollmentModalProps) => {
  const { addEmployee } = useAppStore();
  
  type Step = 'upload' | 'capture' | 'detect' | 'details' | 'success';
  const [step, setStep] = useState<Step>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceImageData, setFaceImageData] = useState<string | null>(null);
  const [faceEmbedding, setFaceEmbedding] = useState<number[] | null>(null);
  const [employeeData, setEmployeeData] = useState({
    name: '',
    role: '',
    contact: '',
    embeddingPath: ''
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentFeedImage, setCurrentFeedImage] = useState<string>(feedImage || '');
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const isVideoSource = !!currentFeedImage && (currentFeedImage.startsWith('blob:') || /(mp4|webm|ogg|mov)$/i.test(currentFeedImage));

  // Set step when modal opens or feed changes
  useEffect(() => {
    if (!isOpen) return;
    if (feedId === 'upload' && !feedImage && !currentFeedImage) {
      setStep('upload');
    } else {
      setStep('capture');
    }
  }, [isOpen, feedId, feedImage, currentFeedImage]);

  // Update current feed image when prop changes
  useEffect(() => {
    if (feedImage) {
      setCurrentFeedImage(feedImage);
    }
  }, [feedImage]);

  const grabFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    setCapturedImage(dataUrl);
    setStep('detect');
  };

  const handleImageCapture = (imageUrl: string) => {
    setCapturedImage(imageUrl);
    setStep('detect');
  };

  const handleFaceSelected = (imageData: string, embedding: number[]) => {
    setFaceImageData(imageData);
    setFaceEmbedding(embedding);
    setStep('details');
    toast.success('Face selected successfully!');
  };

  const handleSubmit = () => {
    if (!employeeData.name || !employeeData.role || !employeeData.contact) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!faceImageData || !faceEmbedding) {
      toast.error('No face data available');
      return;
    }

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: employeeData.name,
      role: employeeData.role,
      contact: employeeData.contact,
      image: faceImageData,
      status: 'online',
      currentLocation: 'Main Office',
      lastSeen: new Date(),
      embeddingPath: `embeddings/${employeeData.name.replace(/\s+/g, '_')}_${Date.now()}.json`
    };

    // Save face embedding
    FaceEmbeddingStorage.saveEmbedding({
      embedding: faceEmbedding,
      metadata: {
        employeeId: newEmployee.id,
        employeeName: newEmployee.name,
        timestamp: new Date(),
        imageData: faceImageData
      }
    });

    addEmployee(newEmployee);
    setStep('success');
    toast.success('Employee enrolled successfully with face recognition!');
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      resetModal();
    }, 300);
  };

  const resetModal = () => {
    setStep('capture');
    setCapturedImage(null);
    setFaceImageData(null);
    setFaceEmbedding(null);
    setEmployeeData({
      name: '',
      role: '',
      contact: '',
      embeddingPath: ''
    });
    setShowVideoUpload(false);
  };

  const handleVideoUploaded = (videoData: { file: File; name: string; location: string; description: string }) => {
    const videoUrl = URL.createObjectURL(videoData.file);
    setCurrentFeedImage(videoUrl);
    setShowVideoUpload(false);
    setStep('capture');
    toast.success('Video uploaded successfully');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Employee Enrollment</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {step === 'upload' && (
              <div className="space-y-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">Upload Video</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a video file to use for employee enrollment
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={() => setShowVideoUpload(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Select Video File
                  </Button>
                </div>
              </div>
            )}

            {step === 'capture' && (
              <div className="space-y-4">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">Capture Face</h3>
                  <p className="text-sm text-muted-foreground">
                    Capture a clear image of the employee's face for enrollment
                  </p>
                </div>

                {isVideoSource ? (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      src={currentFeedImage}
                      className="w-full max-h-96 rounded-lg border"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                    />
                    <div className="flex justify-center">
                      <Button onClick={grabFrame}>
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Frame
                      </Button>
                    </div>
                  </div>
                ) : currentFeedImage ? (
                  <div>
                    <img
                      src={currentFeedImage}
                      alt="Feed frame"
                      className="w-full max-h-96 rounded-lg border object-contain"
                    />
                    <div className="flex justify-center mt-4">
                      <Button onClick={() => handleImageCapture(currentFeedImage)}>
                        Use This Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No image available. Please upload a video first.</p>
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
            )}

            {step === 'detect' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Select the face you want to enroll by clicking on it.
                </p>
                
                <AutoFaceDetection
                  imageUrl={capturedImage!}
                  onFaceSelected={handleFaceSelected}
                  onCancel={() => setStep('capture')}
                />
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Employee Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter employee information to complete enrollment
                  </p>
                </div>

                <div className="space-y-4">
                  {faceImageData && (
                    <div className="flex justify-center">
                      <img
                        src={faceImageData}
                        alt="Selected face"
                        className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={employeeData.name}
                        onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Input
                        id="role"
                        placeholder="Software Engineer"
                        value={employeeData.role}
                        onChange={(e) => setEmployeeData({ ...employeeData, role: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="contact">Email *</Label>
                      <Input
                        id="contact"
                        type="email"
                        placeholder="john.doe@company.com"
                        value={employeeData.contact}
                        onChange={(e) => setEmployeeData({ ...employeeData, contact: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('detect')}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit}>
                    <User className="h-4 w-4 mr-2" />
                    Enroll Employee
                  </Button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6 py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Enrollment Complete!</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {employeeData.name} has been successfully enrolled with face recognition.
                  </p>
                </div>
                <Button onClick={handleClose}>
                  Done
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Upload Modal would go here */}
    </>
  );
};

export default EnrollmentModal;