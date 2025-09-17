import * as ort from 'onnxruntime-web';

export interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  landmarks?: number[][];
}

export interface FaceEmbedding {
  embedding: number[];
  metadata: {
    employeeId: string;
    employeeName: string;
    timestamp: Date;
    imageData: string;
  };
}

export class FaceDetector {
  private session: ort.InferenceSession | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Configure ONNX to use WebGL backend for better performance
      ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.1/dist/';
      
      this.session = await ort.InferenceSession.create('/models/yunet.onnx', {
        executionProviders: ['webgl', 'wasm'],
        graphOptimizationLevel: 'all'
      });
      
      this.isInitialized = true;
      console.log('Face detector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize face detector:', error);
      throw error;
    }
  }

  async detectFaces(imageData: ImageData): Promise<DetectedFace[]> {
    if (!this.session || !this.isInitialized) {
      throw new Error('Face detector not initialized');
    }

    try {
      // Preprocess image for YuNet model
      const preprocessed = this.preprocessImage(imageData);
      
      // Run inference
      const feeds = { input: preprocessed };
      const results = await this.session.run(feeds);
      
      // Post-process results to extract face detections
      return this.postprocessResults(results, imageData.width, imageData.height);
    } catch (error) {
      console.error('Face detection failed:', error);
      return [];
    }
  }

  private preprocessImage(imageData: ImageData): ort.Tensor {
    const { width, height, data } = imageData;
    
    // Convert RGBA to RGB and normalize to [0, 1]
    const rgbData = new Float32Array(3 * width * height);
    let rgbIndex = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      // Normalize and convert to RGB
      rgbData[rgbIndex++] = data[i] / 255.0;     // R
      rgbData[rgbIndex++] = data[i + 1] / 255.0; // G
      rgbData[rgbIndex++] = data[i + 2] / 255.0; // B
    }

    // YuNet expects input shape [1, 3, height, width]
    const tensor = new ort.Tensor('float32', rgbData, [1, 3, height, width]);
    return tensor;
  }

  private postprocessResults(results: ort.InferenceSession.OnnxValueMapType, imageWidth: number, imageHeight: number): DetectedFace[] {
    const faces: DetectedFace[] = [];
    
    // Extract output tensor (format may vary based on YuNet version)
    const outputName = Object.keys(results)[0];
    const output = results[outputName] as ort.Tensor;
    const outputData = output.data as Float32Array;
    
    // YuNet typically outputs [num_detections, 15] where each detection has:
    // [x1, y1, x2, y2, confidence, landmarks...]
    const numDetections = output.dims[0] || 0;
    const detectionSize = output.dims[1] || 15;
    
    for (let i = 0; i < numDetections; i++) {
      const offset = i * detectionSize;
      const confidence = outputData[offset + 4];
      
      // Filter by confidence threshold
      if (confidence > 0.5) {
        const x1 = outputData[offset] * imageWidth;
        const y1 = outputData[offset + 1] * imageHeight;
        const x2 = outputData[offset + 2] * imageWidth;
        const y2 = outputData[offset + 3] * imageHeight;
        
        // Extract landmarks if available
        const landmarks: number[][] = [];
        for (let j = 5; j < detectionSize; j += 2) {
          if (j + 1 < detectionSize) {
            landmarks.push([
              outputData[offset + j] * imageWidth,
              outputData[offset + j + 1] * imageHeight
            ]);
          }
        }
        
        faces.push({
          x: x1,
          y: y1,
          width: x2 - x1,
          height: y2 - y1,
          confidence,
          landmarks
        });
      }
    }
    
    return faces;
  }

  async extractFaceImage(canvas: HTMLCanvasElement, face: DetectedFace): Promise<string> {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');

    // Add padding around face
    const padding = Math.max(face.width, face.height) * 0.2;
    const x = Math.max(0, face.x - padding);
    const y = Math.max(0, face.y - padding);
    const width = Math.min(canvas.width - x, face.width + padding * 2);
    const height = Math.min(canvas.height - y, face.height + padding * 2);

    // Create temporary canvas for face extraction
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 224; // Standard size for face recognition
    faceCanvas.height = 224;
    
    const faceCtx = faceCanvas.getContext('2d');
    if (!faceCtx) throw new Error('Cannot create face canvas context');

    // Draw and resize face to standard size
    faceCtx.drawImage(canvas, x, y, width, height, 0, 0, 224, 224);
    
    return faceCanvas.toDataURL('image/jpeg', 0.8);
  }
}

export const faceDetector = new FaceDetector();