export interface Material {
  name: string;
  category: string;
  finish: string;
  color: string;
  confidence: number;
  description: string;
}

export interface ScanRecord {
  id: string;
  imageUrl: string;
  materials: Material[];
  createdAt: string;
}
