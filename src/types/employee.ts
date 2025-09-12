export interface Employee {
  id: string;
  name: string;
  role: string;
  contact: string;
  image?: string;
  status: 'online' | 'offline' | 'break';
  currentLocation: string;
  lastSeen: Date;
  embeddingPath?: string;
}

export interface VideoFeed {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  location: string;
  lastFrame?: string;
  incidents: Incident[];
  employees: DetectedEmployee[];
}

export interface DetectedEmployee {
  employeeId: string;
  name: string;
  confidence: number;
  bbox: BoundingBox;
  timestamp: Date;
}

export interface Incident {
  id: string;
  type: 'fire' | 'unauthorized_access' | 'suspicious_activity' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  location: string;
  bbox?: BoundingBox;
  description: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ActivityLog {
  timestamp: Date;
  employeeId: string;
  employeeName: string;
  cameraIndex: string;
  eventType: 'entry' | 'exit' | 'detected' | 'lost_track';
  location: string;
}

export interface YoloModel {
  id: string;
  name: string;
  type: 'person_detection' | 'incident_detection';
  fileName: string;
  uploadDate: Date;
  isActive: boolean;
  appliedFeeds: string[];
}