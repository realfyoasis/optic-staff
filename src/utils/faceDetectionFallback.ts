import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import type { DetectedFace } from './faceDetection';

export class TFJSFaceDetector {
  private detector: faceDetection.FaceDetector | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    try {
      // Prefer WebGL backend for speed
      const backends = tf.getBackend();
      if (backends !== 'webgl') {
        await tf.setBackend('webgl');
      }
      await tf.ready();

      this.detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        {
          runtime: 'tfjs',
          modelType: 'short', // fast and decent accuracy
          maxFaces: 10,
        }
      );
      this.initialized = true;
      console.log('[TFJS] MediaPipeFaceDetector initialized');
    } catch (e) {
      console.error('[TFJS] Failed to initialize MediaPipeFaceDetector', e);
      throw e;
    }
  }

  async detectFromCanvas(canvas: HTMLCanvasElement): Promise<DetectedFace[]> {
    if (!this.detector) throw new Error('TFJS detector not initialized');

    try {
      const detections = await this.detector.estimateFaces(canvas);
      const width = canvas.width;
      const height = canvas.height;

      return detections.map((det) => {
        const box = det.box;
        const confidence = 0.9; // MediaPipe Face Detector doesn't expose a score consistently
        const landmarks = (det.keypoints || []).map((kp) => [kp.x, kp.y]);
        return {
          x: box.xMin,
          y: box.yMin,
          width: box.width,
          height: box.height,
          confidence,
          landmarks,
        } as DetectedFace;
      });
    } catch (e) {
      console.error('[TFJS] Face detection failed', e);
      return [];
    }
  }
}

export const tfjsFaceDetector = new TFJSFaceDetector();