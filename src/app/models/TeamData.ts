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
}

/**
 * Helper functions for team data operations
 */
export function createEmptyTeam(teamNumber: string): TeamData {
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
export type ViewMode = 'all' | 'alliance' | 'robot';
