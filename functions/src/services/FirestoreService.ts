import { getFirestore } from "firebase-admin/firestore";
import { TeamData } from "../models/TeamData";
import { SimplifiedMatch, TeamRanking } from "../models/TBAModels";

// Collection references
const TEAMS_COLLECTION = 'team_info';
const TBA_WEBHOOKS_COLLECTION = 'tba_webhooks';
const EVENT_SCHEDULES_COLLECTION = 'event_schedules';
const MATCH_SCORES_COLLECTION = 'match_scores';

// Get Firestore instance
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

/**
 * Firestore service for handling TBA webhook data operations
 */
export class FirestoreService {
  /**
   * Log a webhook notification to Firestore
   */
  static async logWebhookNotification(type: string, data: any): Promise<void> {
    try {
      const webhookRef = db.collection(TBA_WEBHOOKS_COLLECTION).doc();
      await webhookRef.set({
        type,
        data,
        timestamp: new Date(),
        processed: true
      });
    } catch (error) {
      console.error('Error logging webhook notification:', error);
      throw error;
    }
  }

  /**
   * Save event schedule data to Firestore
   */
  static async saveEventSchedule(eventKey: string, scheduleData: any): Promise<void> {
    try {
      const eventRef = db.collection(EVENT_SCHEDULES_COLLECTION).doc(eventKey);
      await eventRef.set({
        event_key: eventKey,
        schedule_data: scheduleData,
        last_updated: new Date()
      }, { merge: true });
    } catch (error) {
      console.error(`Error saving event schedule for ${eventKey}:`, error);
      throw error;
    }
  }

  /**
   * Save match data to Firestore
   * Each match is stored as a separate document in the event's matches collection
   */
  static async saveMatches(matches: SimplifiedMatch[]): Promise<void> {
    try {
      // Group matches by event
      const matchesByEvent: { [eventKey: string]: SimplifiedMatch[] } = {};
      
      matches.forEach(match => {
        if (!matchesByEvent[match.event_key]) {
          matchesByEvent[match.event_key] = [];
        }
        matchesByEvent[match.event_key].push(match);
      });
      
      // Create a batch to perform all writes atomically
      const batch = db.batch();
      
      // Process each event's matches
      for (const [eventKey, eventMatches] of Object.entries(matchesByEvent)) {
        // Create a document for the event with all its matches
        const eventRef = db.collection(EVENT_SCHEDULES_COLLECTION).doc(eventKey);
        
        // Add matches to the batch
        batch.set(eventRef, {
          event_key: eventKey,
          matches: eventMatches,
          last_updated: new Date()
        }, { merge: true });
      }
      
      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error('Error saving matches:', error);
      throw error;
    }
  }

  /**
   * Save match score data to Firestore
   */
  static async saveMatchScore(matchKey: string, scoreData: any): Promise<void> {
    try {
      const matchRef = db.collection(MATCH_SCORES_COLLECTION).doc(matchKey);
      await matchRef.set({
        match_key: matchKey,
        score_data: scoreData,
        last_updated: new Date()
      }, { merge: true });
    } catch (error) {
      console.error(`Error saving match score for ${matchKey}:`, error);
      throw error;
    }
  }

  /**
   * Save team rankings data to Firestore
   * Updates each team's document with their current ranking information
   */
  static async saveTeamRankings(eventKey: string, rankings: TeamRanking[]): Promise<void> {
    try {
      // Create a batch to perform all writes atomically
      const batch = db.batch();
      
      // Update each team's document with their ranking
      for (const ranking of rankings) {
        const teamRef = db.collection(TEAMS_COLLECTION).doc(ranking.team_number);
        
        // Check if team exists first
        const teamDoc = await teamRef.get();
        
        if (teamDoc.exists) {
          // Update existing team with ranking data while preserving existing fields
          batch.update(teamRef, {
            // Maintain backward compatibility with existing fields
            rank: ranking.rank,
            // Add new ranking fields
            ranking_data: {
              matches_played: ranking.matches_played,
              record: ranking.record,
              ranking_score: ranking.ranking_score,
              extra_stats: ranking.extra_stats,
              sort_orders: ranking.sort_orders,
              event_key: eventKey,
              last_updated: new Date()
            }
          });
        } else {
          // Create a minimal team document with ranking data
          batch.set(teamRef, {
            number: ranking.team_number,
            rank: ranking.rank,
            ranking_data: {
              matches_played: ranking.matches_played,
              record: ranking.record,
              ranking_score: ranking.ranking_score,
              extra_stats: ranking.extra_stats,
              sort_orders: ranking.sort_orders,
              event_key: eventKey,
              last_updated: new Date()
            }
          });
        }
      }
      
      // Commit the batch
      await batch.commit();
    } catch (error) {
      console.error(`Error saving team rankings for event ${eventKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all teams from Firestore
   * Used to update team data with TBA information
   */
  static async getAllTeams(): Promise<TeamData[]> {
    try {
      const teamsSnapshot = await db.collection(TEAMS_COLLECTION).get();
      return teamsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          number: doc.id,
          EPA: data.EPA,
          notes: data.notes,
          location: data.location,
          name: data.name,
          rank: data.rank,
          robot_name: data.robot_name
        };
      });
    } catch (error) {
      console.error('Error getting teams:', error);
      throw error;
    }
  }

  /**
   * Update team data in Firestore
   */
  static async updateTeam(team: TeamData): Promise<void> {
    try {
      if (!team.number) {
        throw new Error('Team number is required');
      }
      
      const teamRef = db.collection(TEAMS_COLLECTION).doc(team.number);
      await teamRef.set(team, { merge: true });
    } catch (error) {
      console.error(`Error updating team ${team.number}:`, error);
      throw error;
    }
  }
}
