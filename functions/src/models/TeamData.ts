/**
 * Team data model shared between the main app and cloud functions
 */
export interface TeamData {
  number: string;
  name?: string;
  location?: string;
  robot_name?: string;
  EPA?: number;
  notes?: string;
  rank?: number;
  // New ranking data fields
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

export type AllianceType = 'red' | 'blue';
export type ViewMode = 'all' | 'alliance' | 'robot';
