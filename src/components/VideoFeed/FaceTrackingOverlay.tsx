import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DetectedFace, faceDetector } from '@/utils/faceDetection';
import { faceEmbeddingGenerator, FaceEmbeddingStorage } from '@/utils/faceEmbeddings';
import { useAppStore } from '@/store/appStore';
import { Badge } from '@/components/ui/badge';

interface FaceTrackingOverlayProps {
  videoElement: HTMLVideoElement | null;
  feedId: string;
  isActive: boolean;
}

interface TrackedFace extends DetectedFace {
  employeeId?: string;
  employeeName?: string;
  similarity?: number;
}

export const FaceTrackingOverlay: React.FC<FaceTrackingOverlayProps> = ({
  videoElement,
  feedId,
  isActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  const lastProcessTime = useRef<number>(0);
  const [trackedFaces, setTrackedFaces] = useState<TrackedFace[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { state, updateEmployee } = useAppStore();

  const PROCESSING_INTERVAL = 500; // Process every 500ms for performance

  useEffect(() => {
    initializeTracking();
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && isInitialized) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isActive, isInitialized, videoElement]);

  const initializeTracking = async () => {
    try {
      await faceDetector.initialize();
      await faceEmbeddingGenerator.initialize();
      setIsInitialized(true);
      console.log(`Face tracking initialized for feed ${feedId}`);
    } catch (error) {
      console.error(`Failed to initialize face tracking for feed ${feedId}:`, error);
    }
  };

  const startTracking = useCallback(() => {
    if (!videoElement || !canvasRef.current || !isInitialized) return;

    const processFrame = async () => {
      const now = Date.now();
      
      if (now - lastProcessTime.current < PROCESSING_INTERVAL) {
        frameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      lastProcessTime.current = now;

      try {
        await detectAndTrackFaces();
      } catch (error) {
        console.error('Frame processing error:', error);
      }

      frameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  }, [videoElement, isInitialized, feedId]);

  const stopTracking = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }
    setTrackedFaces([]);
  };

  const detectAndTrackFaces = async () => {
    if (!videoElement || !canvasRef.current || videoElement.readyState < 2) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    const videoWidth = videoElement.videoWidth || videoElement.clientWidth;
    const videoHeight = videoElement.videoHeight || videoElement.clientHeight;
    
    if (videoWidth === 0 || videoHeight === 0) return;

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Draw current video frame
    ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

    // Get image data for face detection
    const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);

    try {
      // Detect faces
      const detectedFaces = await faceDetector.detectFaces(imageData);
      
      // Recognize faces
      const recognizedFaces = await recognizeFaces(detectedFaces, canvas);
      
      setTrackedFaces(recognizedFaces);
      
      // Update employee locations
      updateEmployeeLocations(recognizedFaces);
      
      // Draw overlays
      drawFaceOverlays(ctx, recognizedFaces);
    } catch (error) {
      console.error('Face detection/recognition failed:', error);
    }
  };

  const recognizeFaces = async (faces: DetectedFace[], canvas: HTMLCanvasElement): Promise<TrackedFace[]> => {
    const storedEmbeddings = FaceEmbeddingStorage.getAllEmbeddings();
    const recognizedFaces: TrackedFace[] = [];

    for (const face of faces) {
      try {
        // Extract face image
        const faceImageData = await faceDetector.extractFaceImage(canvas, face);
        
        // Generate embedding
        const faceEmbedding = await faceEmbeddingGenerator.generateEmbedding(faceImageData);
        
        // Find best match
        const match = faceEmbeddingGenerator.findBestMatch(faceEmbedding, storedEmbeddings, 0.75);
        
        const recognizedFace: TrackedFace = {
          ...face,
          employeeId: match?.metadata.employeeId,
          employeeName: match?.metadata.employeeName,
          similarity: match ? faceEmbeddingGenerator.calculateSimilarity(faceEmbedding, match.embedding) : undefined
        };
        
        recognizedFaces.push(recognizedFace);
      } catch (error) {
        // If recognition fails, still track the face as unknown
        recognizedFaces.push({ ...face });
      }
    }

    return recognizedFaces;
  };

  const updateEmployeeLocations = (faces: TrackedFace[]) => {
    faces.forEach(face => {
      if (face.employeeId && face.employeeName) {
        // Update employee location based on feed
        const feedLocation = `Camera Feed ${feedId}`;
        // Find and update employee
        const employee = state.employees.find(emp => emp.id === face.employeeId);
        if (employee) {
          updateEmployee({
            ...employee,
            currentLocation: feedLocation,
            lastSeen: new Date(),
            status: 'online'
          });
        }
      }
    });
  };

  const drawFaceOverlays = (ctx: CanvasRenderingContext2D, faces: TrackedFace[]) => {
    faces.forEach(face => {
      const isRecognized = !!face.employeeName;
      
      // Draw bounding box
      ctx.strokeStyle = isRecognized ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(face.x, face.y, face.width, face.height);
      
      // Draw name label for recognized faces
      if (isRecognized && face.employeeName) {
        const labelText = `${face.employeeName} (${Math.round((face.similarity || 0) * 100)}%)`;
        
        // Measure text
        ctx.font = 'bold 14px Arial';
        const textWidth = ctx.measureText(labelText).width;
        
        // Draw background
        const labelX = Math.max(0, face.x);
        const labelY = Math.max(20, face.y - 5);
        
        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.fillRect(labelX, labelY - 18, textWidth + 12, 22);
        
        // Draw text
        ctx.fillStyle = 'white';
        ctx.fillText(labelText, labelX + 6, labelY - 3);
      } else {
        // Draw "Unknown" label for unrecognized faces
        const labelText = 'Unknown';
        
        ctx.font = 'bold 12px Arial';
        const textWidth = ctx.measureText(labelText).width;
        
        const labelX = Math.max(0, face.x);
        const labelY = Math.max(20, face.y - 5);
        
        ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
        ctx.fillRect(labelX, labelY - 16, textWidth + 8, 18);
        
        ctx.fillStyle = 'white';
        ctx.fillText(labelText, labelX + 4, labelY - 2);
      }
      
      // Draw confidence indicator
      const confidence = Math.round(face.confidence * 100);
      ctx.fillStyle = face.confidence > 0.8 ? '#10b981' : face.confidence > 0.6 ? '#f59e0b' : '#ef4444';
      ctx.font = '10px Arial';
      ctx.fillText(`${confidence}%`, face.x + face.width - 30, face.y + 15);
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 10,
        mixBlendMode: 'normal'
      }}
    />
  );
};