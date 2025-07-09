export interface TeamData {
  number: string;
  imageUrl?: string;
  location?: string;
  // Placeholder for future stats
  stats?: {
    wins?: number;
    losses?: number;
    ties?: number;
    record?: number;
    ranking?: number;
    notes?: string;
    robotName?: string;
    school?: string;
    totalRP?: number;
    avgMatchScore?: number;
    description?: string;
    EPA?: number;
  };
}

export type AllianceType = 'blue' | 'red';
export type ViewMode = 'all' | 'alliance' | 'robot';
