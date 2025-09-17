import { pipeline } from '@huggingface/transformers';
import { FaceEmbedding } from './faceDetection';

export class FaceEmbeddingGenerator {
  private extractor: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing face embedding generator...');
      
      // Use a lightweight embedding model that works well for faces
      this.extractor = await pipeline(
        'feature-extraction',
        'Xenova/clip-vit-base-patch32',
        { 
          device: 'webgpu',
          dtype: 'fp16'
        }
      );
      
      this.isInitialized = true;
      console.log('Face embedding generator initialized');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      try {
        this.extractor = await pipeline(
          'feature-extraction',
          'Xenova/clip-vit-base-patch32'
        );
        this.isInitialized = true;
        console.log('Face embedding generator initialized (CPU)');
      } catch (fallbackError) {
        console.error('Failed to initialize face embedding generator:', fallbackError);
        throw fallbackError;
      }
    }
  }

  async generateEmbedding(faceImageData: string): Promise<number[]> {
    if (!this.extractor || !this.isInitialized) {
      throw new Error('Face embedding generator not initialized');
    }

    try {
      // Convert base64 image to input format
      const image = await this.loadImageFromBase64(faceImageData);
      
      // Generate embedding
      const embedding = await this.extractor(image, { 
        pooling: 'mean', 
        normalize: true 
      });
      
      return Array.from(embedding.data);
    } catch (error) {
      console.error('Failed to generate face embedding:', error);
      throw error;
    }
  }

  private async loadImageFromBase64(base64: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = base64;
    });
  }

  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    // Calculate cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  findBestMatch(queryEmbedding: number[], storedEmbeddings: FaceEmbedding[], threshold: number = 0.8): FaceEmbedding | null {
    let bestMatch: FaceEmbedding | null = null;
    let bestSimilarity = 0;

    for (const stored of storedEmbeddings) {
      const similarity = this.calculateSimilarity(queryEmbedding, stored.embedding);
      if (similarity > bestSimilarity && similarity > threshold) {
        bestSimilarity = similarity;
        bestMatch = stored;
      }
    }

    return bestMatch;
  }
}

export const faceEmbeddingGenerator = new FaceEmbeddingGenerator();

// Storage utilities for face embeddings
export class FaceEmbeddingStorage {
  private static STORAGE_KEY = 'face_embeddings';

  static saveEmbedding(embedding: FaceEmbedding): void {
    try {
      const stored = this.getAllEmbeddings();
      stored.push(embedding);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
      console.log('Face embedding saved:', embedding.metadata.employeeName);
    } catch (error) {
      console.error('Failed to save face embedding:', error);
    }
  }

  static getAllEmbeddings(): FaceEmbedding[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load face embeddings:', error);
      return [];
    }
  }

  static getEmbeddingsByEmployee(employeeId: string): FaceEmbedding[] {
    return this.getAllEmbeddings().filter(
      embedding => embedding.metadata.employeeId === employeeId
    );
  }

  static deleteEmbedding(employeeId: string): void {
    try {
      const stored = this.getAllEmbeddings();
      const filtered = stored.filter(
        embedding => embedding.metadata.employeeId !== employeeId
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      console.log('Face embedding deleted for employee:', employeeId);
    } catch (error) {
      console.error('Failed to delete face embedding:', error);
    }
  }

  static exportEmbeddings(): string {
    return JSON.stringify(this.getAllEmbeddings(), null, 2);
  }

  static importEmbeddings(jsonData: string): void {
    try {
      const embeddings = JSON.parse(jsonData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(embeddings));
      console.log('Face embeddings imported successfully');
    } catch (error) {
      console.error('Failed to import face embeddings:', error);
      throw error;
    }
  }
}