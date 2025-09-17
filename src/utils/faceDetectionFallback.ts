import * as faceDetection from '@tensorflow-models/face-detection';
import '@mediapipe/face_detection';
import type { DetectedFace } from './faceDetection';

export class TFJSFaceDetector {
  private detector: faceDetection.FaceDetector | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    try {
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      // Use the pure MediaPipe runtime (fast, no TFJS backend required)
      const options = {
        runtime: 'mediapipe',
        // Load solution files from CDN (works in build environments too)
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection',
      } as any;

      this.detector = await faceDetection.createDetector(model, options);
      this.initialized = true;
      console.log('[MP] MediaPipe FaceDetector initialized');
    } catch (e) {
      console.error('[MP] Failed to initialize MediaPipe FaceDetector', e);
      throw e;
    }
  }

  async detectFromCanvas(canvas: HTMLCanvasElement): Promise<DetectedFace[]> {
    if (!this.detector) throw new Error('MediaPipe FaceDetector not initialized');

    try {
      const predictions = await this.detector.estimateFaces(canvas as HTMLCanvasElement);

      return predictions.map((p: any) => {
        // Robustly extract bounding box from different shapes
        let x = 0, y = 0, width = 0, height = 0;

        if (p.box) {
          const b = p.box;
          const xMin = b.xMin ?? b.left ?? b.x ?? 0;
          const yMin = b.yMin ?? b.top ?? b.y ?? 0;
          const xMax = b.xMax ?? (b.width != null ? xMin + b.width : undefined);
          const yMax = b.yMax ?? (b.height != null ? yMin + b.height : undefined);
          x = xMin;
          y = yMin;
          width = (b.width != null ? b.width : (xMax != null ? xMax - xMin : 0));
          height = (b.height != null ? b.height : (yMax != null ? yMax - yMin : 0));
        } else if (p.boundingBox) {
          const tl = Array.isArray(p.boundingBox.topLeft)
            ? p.boundingBox.topLeft
            : Array.from(p.boundingBox.topLeft?.dataSync?.() ?? p.boundingBox.topLeft ?? [0, 0]);
          const br = Array.isArray(p.boundingBox.bottomRight)
            ? p.boundingBox.bottomRight
            : Array.from(p.boundingBox.bottomRight?.dataSync?.() ?? p.boundingBox.bottomRight ?? [0, 0]);
          x = tl[0];
          y = tl[1];
          width = br[0] - tl[0];
          height = br[1] - tl[1];
        } else if (p.topLeft && p.bottomRight) {
          const tl = Array.isArray(p.topLeft) ? p.topLeft : Array.from(p.topLeft.dataSync());
          const br = Array.isArray(p.bottomRight) ? p.bottomRight : Array.from(p.bottomRight.dataSync());
          x = tl[0];
          y = tl[1];
          width = br[0] - tl[0];
          height = br[1] - tl[1];
        }

        const score = Array.isArray(p.score) ? p.score[0] : p.score;
        const confidence = typeof score === 'number' ? score : (p.probability ?? 0.9);

        const landmarks: number[][] = [];
        if (Array.isArray(p.keypoints)) {
          for (const kp of p.keypoints) {
            if (kp && kp.x != null && kp.y != null) landmarks.push([kp.x, kp.y]);
          }
        }

        return {
          x,
          y,
          width,
          height,
          confidence,
          landmarks,
        } as DetectedFace;
      });
    } catch (e) {
      console.error('[MP] MediaPipe detection failed', e);
      return [];
    }
  }
}

export const tfjsFaceDetector = new TFJSFaceDetector();