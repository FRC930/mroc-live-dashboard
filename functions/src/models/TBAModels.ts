/**
 * Models for TheBlueAlliance API responses
 */

export interface TBAMatchAlliance {
  dq_team_keys: string[];
  score: number;
  surrogate_team_keys: string[];
  team_keys: string[];
}

export interface TBAMatchAlliances {
  blue: TBAMatchAlliance;
  red: TBAMatchAlliance;
}

export interface TBAMatch {
  actual_time?: number | null;
  alliances: TBAMatchAlliances;
  comp_level: string;
  event_key: string;
  key: string;
  match_number: number;
  predicted_time?: number | null;
  set_number: number;
  time?: number | null;
  winning_alliance?: string;
}

// Simplified version of the match data for storage in Firestore
export interface SimplifiedMatch {
  match_number: number;
  comp_level: string;
  alliances: {
    blue: {
      team_keys: string[];
      score?: number;
    };
    red: {
      team_keys: string[];
      score?: number;
    };
  };
  winning_alliance?: string;
  match_key: string;
  event_key: string;
  time?: number;
  actual_time?: number;
}

// Rankings models
export interface TBARecord {
  losses: number;
  ties: number;
  wins: number;
}

export interface TBARanking {
  dq: number;
  extra_stats: number[];
  matches_played: number;
  qual_average: number | null;
  rank: number;
  record: TBARecord;
  sort_orders: number[];
  team_key: string;
}

export interface TBAStatInfo {
  name: string;
  precision: number;
}

export interface TBARankings {
  extra_stats_info: TBAStatInfo[];
  rankings: TBARanking[];
  sort_order_info: TBAStatInfo[];
}

// Simplified team ranking data for storage in Firestore
export interface TeamRanking {
  team_number: string;
  rank: number;
  matches_played: number;
  record: {
    wins: number;
    losses: number;
    ties: number;
  };
  ranking_score: number;
  extra_stats?: number[];
  sort_orders?: number[];
  named_extra_stats?: { [key: string]: number };
  named_sort_orders?: { [key: string]: number };
}
