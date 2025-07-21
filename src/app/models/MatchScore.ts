/**
 * Match Score model that matches the Firestore structure
 * created by TBA webhook handlers
 */
import { Alliance } from './EventSchedule';

/**
 * Match Score structure as stored in Firestore
 */
export interface MatchScore {
  match_key: string;
  score_data: {
    key: string;
    comp_level: string;
    match_number: number;
    set_number?: number;
    alliances: {
      red: Alliance;
      blue: Alliance;
    };
    winning_alliance: string;
    event_key: string;
    time?: number;
    actual_time?: number;
    predicted_time?: number;
    score_breakdown?: {
      red: any;
      blue: any;
    };
  };
  last_updated: Date;
}

/**
 * Helper function to determine if a team won a match
 */
export function didTeamWin(matchScore: MatchScore, teamNumber: string): boolean | null {
  const redTeams = matchScore.score_data.alliances.red.team_keys || [];
  const blueTeams = matchScore.score_data.alliances.blue.team_keys || [];
  
  // Check if team is in the match
  const isRedTeam = redTeams.includes(teamNumber);
  const isBlueTeam = blueTeams.includes(teamNumber);
  
  if (!isRedTeam && !isBlueTeam) {
    return null; // Team not in this match
  }
  
  // Check winning alliance
  if (matchScore.score_data.winning_alliance === '') {
    return null; // Tie or no winner declared
  }
  
  return (isRedTeam && matchScore.score_data.winning_alliance === 'red') || 
         (isBlueTeam && matchScore.score_data.winning_alliance === 'blue');
}

/**
 * Helper function to get a team's score in a match
 */
export function getTeamScore(matchScore: MatchScore, teamNumber: string): number | null {
  const redTeams = matchScore.score_data.alliances.red.team_keys || [];
  const blueTeams = matchScore.score_data.alliances.blue.team_keys || [];
  
  if (redTeams.includes(teamNumber)) {
    return matchScore.score_data.alliances.red.score || 0;
  } else if (blueTeams.includes(teamNumber)) {
    return matchScore.score_data.alliances.blue.score || 0;
  }
  
  return null; // Team not in this match
}
