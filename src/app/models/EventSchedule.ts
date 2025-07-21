/**
 * Event Schedule model that matches the Firestore structure
 * created by TBA webhook handlers
 */

/**
 * Alliance structure in a match
 */
export interface Alliance {
  team_keys: string[];
  score?: number;
  surrogate_team_keys?: string[];
  dq_team_keys?: string[];
}

/**
 * Simplified match structure for schedule display
 */
export interface SimplifiedMatch {
  key: string;
  event_key: string;
  comp_level: string;
  match_number: number;
  set_number?: number;
  time?: number;
  actual_time?: number;
  predicted_time?: number;
  alliances: {
    red: Alliance;
    blue: Alliance;
  };
  winning_alliance?: string;
  score_breakdown?: any;
}

/**
 * Event Schedule structure as stored in Firestore
 */
export interface EventSchedule {
  event_key: string;
  matches: SimplifiedMatch[];
  last_updated: Date;
}

/**
 * Helper function to get a readable match name
 */
export function getMatchName(match: SimplifiedMatch): string {
  const compLevel = match.comp_level.toUpperCase();
  
  if (compLevel === 'QM') {
    return `Qual ${match.match_number}`;
  } else if (compLevel === 'QF') {
    return `Quarter ${match.set_number} Match ${match.match_number}`;
  } else if (compLevel === 'SF') {
    return `Semi ${match.set_number} Match ${match.match_number}`;
  } else if (compLevel === 'F') {
    return `Final ${match.match_number}`;
  }
  
  return `${compLevel} ${match.match_number}`;
}

/**
 * Helper function to get the teams in a match
 */
export function getTeamsInMatch(match: SimplifiedMatch): string[] {
  const teams: string[] = [];
  
  if (match.alliances) {
    if (match.alliances.red && match.alliances.red.team_keys) {
      teams.push(...match.alliances.red.team_keys);
    }
    
    if (match.alliances.blue && match.alliances.blue.team_keys) {
      teams.push(...match.alliances.blue.team_keys);
    }
  }
  
  return teams;
}
