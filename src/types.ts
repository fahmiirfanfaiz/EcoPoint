export type TrashCategory =
  | "Plastic"
  | "Glass"
  | "Metal"
  | "Paper/Cardboard"
  | "Organic/Food"
  | "E-Waste"
  | "Hazardous"
  | "General Waste";

export interface AlternativeCategory {
  category: TrashCategory;
  confidence: number;
}

export interface ClassificationResult {
  category: TrashCategory;
  confidence: number;
  item_detected: string;
  disposal_tip: string;
  top_alternatives: AlternativeCategory[];
}

export interface ClassifyResponse {
  success: true;
  data: ClassificationResult;
}

export interface ErrorResponse {
  success: false;
  error: string;
}
