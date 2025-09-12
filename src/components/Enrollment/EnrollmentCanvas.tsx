import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Crop, RotateCcw, Check } from 'lucide-react';

interface EnrollmentCanvasProps {
  imageUrl: string;
  onFaceCapture: (faceCrop: string, boundingBox: { x: number; y: number; width: number; height: number }) => void;
}

interface BoundingBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const EnrollmentCanvas = ({ imageUrl, onFaceCapture }: EnrollmentCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 640, height: 480 });

  // Load and draw the image
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (imageRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate canvas dimensions to maintain aspect ratio
        const maxWidth = 600;
        const maxHeight = 400;
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
        
        // Draw the image
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        setImageLoaded(true);
      }
      imageRef.current = image;
    };
    image.src = imageUrl;
  }, [imageUrl]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;
    
    const coords = getCanvasCoordinates(e);
    setBoundingBox({
      startX: coords.x,
      startY: coords.y,
      endX: coords.x,
      endY: coords.y,
    });
    setIsDrawing(true);
  }, [imageLoaded, getCanvasCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !boundingBox || !imageLoaded) return;
    
    const coords = getCanvasCoordinates(e);
    setBoundingBox(prev => prev ? {
      ...prev,
      endX: coords.x,
      endY: coords.y,
    } : null);
  }, [isDrawing, boundingBox, imageLoaded, getCanvasCoordinates]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Redraw canvas with bounding box
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    // Draw bounding box if exists
    if (boundingBox) {
      const { startX, startY, endX, endY } = boundingBox;
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);

      // Draw bounding box
      ctx.strokeStyle = '#00f5ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);

      // Draw corner handles
      ctx.setLineDash([]);
      ctx.fillStyle = '#00f5ff';
      const handleSize = 6;
      
      // Corner handles
      ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
      ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);

      // Draw label
      ctx.fillStyle = 'rgba(0, 245, 255, 0.1)';
      ctx.fillRect(x, y, width, height);
      
      ctx.fillStyle = '#00f5ff';
      ctx.font = '12px monospace';
      ctx.fillText('Face Region', x + 5, y - 5);
    }
  }, [imageLoaded, boundingBox]);

  const handleCapture = useCallback(() => {
    if (!boundingBox || !canvasRef.current || !imageRef.current) return;

    const { startX, startY, endX, endY } = boundingBox;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    // Minimum size check
    if (width < 50 || height < 50) {
      alert('Bounding box too small. Please select a larger area.');
      return;
    }

    // Create a new canvas for the face crop
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    // Set crop canvas size
    cropCanvas.width = width;
    cropCanvas.height = height;

    // Calculate scale factors from canvas to original image
    const scaleX = imageRef.current.naturalWidth / canvasSize.width;
    const scaleY = imageRef.current.naturalHeight / canvasSize.height;

    // Draw the cropped portion of the original image
    cropCtx.drawImage(
      imageRef.current,
      x * scaleX, y * scaleY,           // Source position
      width * scaleX, height * scaleY, // Source size
      0, 0,                            // Destination position
      width, height                    // Destination size
    );

    // Convert to blob and call callback
    cropCanvas.toBlob((blob) => {
      if (blob) {
        const faceCropUrl = URL.createObjectURL(blob);
        onFaceCapture(faceCropUrl, { x, y, width, height });
      }
    }, 'image/png');
  }, [boundingBox, canvasSize, onFaceCapture]);

  const handleReset = useCallback(() => {
    setBoundingBox(null);
    setIsDrawing(false);
  }, []);

  return (
    <div className="space-y-4">
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="border border-border rounded-lg cursor-crosshair bg-background shadow-inner"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Click and drag to draw a bounding box around the employee's face
            </div>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!boundingBox}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              
              <Button
                onClick={handleCapture}
                disabled={!boundingBox}
                className="bg-primary hover:bg-primary/90"
              >
                <Crop className="h-4 w-4 mr-2" />
                Capture Face
              </Button>
            </div>

            {boundingBox && (
              <div className="text-xs text-muted-foreground">
                Selected area: {Math.round(Math.abs(boundingBox.endX - boundingBox.startX))} × {Math.round(Math.abs(boundingBox.endY - boundingBox.startY))} pixels
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentCanvas;