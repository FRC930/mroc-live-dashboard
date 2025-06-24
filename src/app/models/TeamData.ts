export interface TeamData {
  number: string;
  imageUrl?: string;
  // Placeholder for future stats
  stats?: {
    wins?: number;
    losses?: number;
    ranking?: number;
    notes?: string;
  };
}

export type AllianceType = 'blue' | 'red';
export type ViewMode = 'all' | 'alliance' | 'robot';
