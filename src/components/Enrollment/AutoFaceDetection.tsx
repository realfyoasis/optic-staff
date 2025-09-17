import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Target } from 'lucide-react';
import { DetectedFace, faceDetector } from '@/utils/faceDetection';
import { faceEmbeddingGenerator, FaceEmbeddingStorage } from '@/utils/faceEmbeddings';
import { toast } from 'sonner';

interface AutoFaceDetectionProps {
  imageUrl: string;
  onFaceSelected: (faceData: string, embedding: number[]) => void;
  onCancel: () => void;
}

export const AutoFaceDetection: React.FC<AutoFaceDetectionProps> = ({
  imageUrl,
  onFaceSelected,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [detectedFaces, setDetectedFaces] = useState<DetectedFace[]>([]);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    initializeDetection();
  }, [imageUrl]);

  const initializeDetection = async () => {
    try {
      setIsDetecting(true);
      console.log('Starting face detection initialization...');
      
      // Initialize face detector if not already done
      try {
        await faceDetector.initialize();
        console.log('Face detector initialized successfully');
      } catch (detectorError) {
        console.error('Face detector initialization failed:', detectorError);
        // Continue without face detection - show manual crop option
        setIsDetecting(false);
        toast.error('Face detection unavailable. You can manually select the face area.');
        return;
      }

      try {
        await faceEmbeddingGenerator.initialize();
        console.log('Embedding generator initialized successfully');
      } catch (embeddingError) {
        console.error('Embedding generator initialization failed:', embeddingError);
        // Continue with face detection but without embeddings
      }
      
      // Load and process image
      await loadAndDetectFaces();
    } catch (error) {
      console.error('Failed to initialize face detection:', error);
      setIsDetecting(false);
      toast.error('Face detection failed. Please try again or contact support.');
    }
  };

  const loadAndDetectFaces = async () => {
    if (!canvasRef.current) {
      console.error('Canvas not available');
      setIsDetecting(false);
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      setIsDetecting(false);
      return;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';
    
    image.onload = async () => {
      try {
        console.log('Image loaded, processing...');
        
        // Set canvas dimensions
        const maxWidth = 800;
        const maxHeight = 600;
        const aspectRatio = image.width / image.height;
        
        let newWidth = maxWidth;
        let newHeight = maxWidth / aspectRatio;
        
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = maxHeight * aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        setCanvasSize({ width: newWidth, height: newHeight });
        
        // Draw image
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        imageRef.current = image;
        
        console.log('Canvas setup complete, starting face detection...');
        
        // Get image data for face detection
        const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
        
        // Detect faces with timeout
        const detectionPromise = faceDetector.detectFaces(imageData);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Detection timeout')), 10000)
        );
        
        try {
          const faces = await Promise.race([detectionPromise, timeoutPromise]) as DetectedFace[];
          console.log(`Face detection completed. Found ${faces.length} faces`);
          
          setDetectedFaces(faces);
          
          // Draw bounding boxes
          drawFaceBoundingBoxes(faces);
          
          setIsDetecting(false);
          
          if (faces.length === 0) {
            toast.warning('No faces detected. You can manually crop the image.');
          } else {
            toast.success(`${faces.length} face(s) detected. Click on a face to select it.`);
          }
        } catch (detectionError) {
          console.error('Face detection failed:', detectionError);
          setIsDetecting(false);
          setDetectedFaces([]);
          toast.error('Face detection timed out. Please try with a clearer image.');
        }
      } catch (error) {
        console.error('Image processing failed:', error);
        setIsDetecting(false);
        toast.error('Failed to process image');
      }
    };
    
    image.onerror = () => {
      console.error('Failed to load image');
      setIsDetecting(false);
      toast.error('Failed to load image');
    };
    
    console.log('Loading image from:', imageUrl);
    image.src = imageUrl;
  };

  const drawFaceBoundingBoxes = (faces: DetectedFace[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    faces.forEach((face, index) => {
      const isSelected = selectedFaceIndex === index;
      
      // Draw bounding box
      ctx.strokeStyle = isSelected ? '#10b981' : '#3b82f6';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(face.x, face.y, face.width, face.height);
      
      // Draw confidence badge
      const badgeText = `${(face.confidence * 100).toFixed(0)}%`;
      const badgeX = face.x;
      const badgeY = face.y - 5;
      
      ctx.fillStyle = isSelected ? '#10b981' : '#3b82f6';
      ctx.font = '12px Arial';
      const textWidth = ctx.measureText(badgeText).width;
      ctx.fillRect(badgeX, badgeY - 15, textWidth + 8, 18);
      
      ctx.fillStyle = 'white';
      ctx.fillText(badgeText, badgeX + 4, badgeY - 3);
      
      // Draw click indicator
      if (!isSelected) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(face.x + face.width / 2, face.y + face.height / 2, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('?', face.x + face.width / 2, face.y + face.height / 2 + 3);
        ctx.textAlign = 'left';
      } else {
        // Draw checkmark for selected face
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(face.x + face.width / 2, face.y + face.height / 2, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(face.x + face.width / 2 - 4, face.y + face.height / 2);
        ctx.lineTo(face.x + face.width / 2 - 1, face.y + face.height / 2 + 3);
        ctx.lineTo(face.x + face.width / 2 + 4, face.y + face.height / 2 - 3);
        ctx.stroke();
      }
    });
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDetecting || detectedFaces.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Scale coordinates to canvas coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    
    // Find clicked face
    const clickedFaceIndex = detectedFaces.findIndex(face => 
      canvasX >= face.x && canvasX <= face.x + face.width &&
      canvasY >= face.y && canvasY <= face.y + face.height
    );
    
    if (clickedFaceIndex !== -1) {
      setSelectedFaceIndex(clickedFaceIndex);
      // Redraw with updated selection
      if (imageRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
          drawFaceBoundingBoxes(detectedFaces);
        }
      }
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedFaceIndex === null || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const selectedFace = detectedFaces[selectedFaceIndex];
      
      // Extract face image
      const faceImageData = await faceDetector.extractFaceImage(canvasRef.current, selectedFace);
      
      // Generate embedding
      const embedding = await faceEmbeddingGenerator.generateEmbedding(faceImageData);
      
      onFaceSelected(faceImageData, embedding);
      toast.success('Face selected and processed successfully!');
    } catch (error) {
      console.error('Failed to process selected face:', error);
      toast.error('Failed to process the selected face');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Face Detection</span>
            </h3>
            <Badge variant="outline">
              {detectedFaces.length} face(s) detected
            </Badge>
          </div>
          
          <div className="relative">
            {isDetecting && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Detecting faces...</span>
                </div>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-w-full border rounded-lg shadow-sm cursor-pointer"
              style={{ 
                maxHeight: '600px',
                cursor: detectedFaces.length > 0 ? 'pointer' : 'default'
              }}
            />
          </div>
          
          {detectedFaces.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Click on a face to select it for enrollment
            </div>
          )}
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Skip face detection and proceed with manual crop
                  setIsDetecting(false);
                  setDetectedFaces([]);
                  toast.info('Proceeding without face detection');
                }}
                disabled={isDetecting}
              >
                Skip Detection
              </Button>
              
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedFaceIndex === null || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Confirm Selection
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};