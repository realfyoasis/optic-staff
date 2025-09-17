import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import type { DetectedFace } from './faceDetection';

export class TFJSFaceDetector {
  private model: blazeface.BlazeFaceModel | null = null;
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

      this.model = await blazeface.load();
      this.initialized = true;
      console.log('[TFJS] BlazeFace model initialized');
    } catch (e) {
      console.error('[TFJS] Failed to initialize BlazeFace model', e);
      throw e;
    }
  }

  async detectFromCanvas(canvas: HTMLCanvasElement): Promise<DetectedFace[]> {
    if (!this.model) throw new Error('TFJS BlazeFace model not initialized');

    try {
      const predictions = await this.model.estimateFaces(canvas, false);
      
      return predictions.map((prediction) => {
        // Extract coordinates from tensors
        const topLeft = Array.isArray(prediction.topLeft) ? 
          prediction.topLeft : 
          Array.from(prediction.topLeft.dataSync());
        const bottomRight = Array.isArray(prediction.bottomRight) ? 
          prediction.bottomRight : 
          Array.from(prediction.bottomRight.dataSync());

        const x = topLeft[0];
        const y = topLeft[1];
        const width = bottomRight[0] - topLeft[0];
        const height = bottomRight[1] - topLeft[1];

        // Extract landmarks if available
        const landmarks: number[][] = [];
        if (prediction.landmarks) {
          if (Array.isArray(prediction.landmarks)) {
            landmarks.push(...prediction.landmarks.map((landmark: number[]) => [landmark[0], landmark[1]]));
          } else {
            // Handle tensor case
            const landmarkData = Array.from(prediction.landmarks.dataSync());
            for (let i = 0; i < landmarkData.length; i += 2) {
              landmarks.push([landmarkData[i], landmarkData[i + 1]]);
            }
          }
        }

        return {
          x,
          y,
          width,
          height,
          confidence: prediction.probability || 0.9,
          landmarks,
        } as DetectedFace;
      });
    } catch (e) {
      console.error('[TFJS] BlazeFace detection failed', e);
      return [];
    }
  }
}

export const tfjsFaceDetector = new TFJSFaceDetector();