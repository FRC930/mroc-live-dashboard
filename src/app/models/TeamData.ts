/**
 * TeamData interface that directly matches the Firestore structure
 * with team numbers as document IDs
 */
export interface TeamData {
  number: string;
  EPA?: number;
  notes?: string;
  location?: string;
  name?: string;
  rank?: number;
  robot_name?: string;
  imageUrl?: string; // Additional field for UI purposes
  // New ranking data fields from TBA webhooks
  ranking_data?: {
    matches_played: number;
    record: {
      wins: number;
      losses: number;
      ties: number;
    };
    ranking_score: number;
    // Raw arrays from TBA
    extra_stats?: number[];
    sort_orders?: number[];
    // Named stats mapped from the arrays
    named_extra_stats?: { [key: string]: number };
    named_sort_orders?: { [key: string]: number };
    event_key: string;
    last_updated: Date;
  };
}

/**
 * Helper functions for team data operations
 */
export function createEmptyTeam(teamNumber: string ): TeamData {
  return {
    number: teamNumber,
    EPA: 0,
    notes: '',
    location: '',
    name: '',
    rank: 0,
    robot_name: ''
  };
}

/**
 * Alliance types for team grouping
 */
export type AllianceType = 'blue' | 'red';

/**
 * View modes for team display
 */
export type ViewMode = 'all' | 'alliance' | 'robot' | 'rankings' | 'greenscreen';
