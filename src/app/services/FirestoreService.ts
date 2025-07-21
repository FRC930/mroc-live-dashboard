import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  DocumentData,
  onSnapshot,
  QuerySnapshot,
  DocumentSnapshot,
  Unsubscribe,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { TeamData } from '../models/TeamData';
import { EventSchedule, SimplifiedMatch } from '../models/EventSchedule';
import { MatchScore } from '../models/MatchScore';

// Collection references
const TEAMS_COLLECTION = 'team_info';
const TBA_WEBHOOKS_COLLECTION = 'tba_webhooks';
const EVENT_SCHEDULES_COLLECTION = 'event_schedules';
const MATCH_SCORES_COLLECTION = 'match_scores';

/**
 * Firestore service for handling team data operations
 */
export class FirestoreService {
  /**
   * Subscribe to real-time updates for all teams
   * @param callback Function to call when data changes
   * @returns Unsubscribe function
   */
  static subscribeToAllTeams(callback: (teams: TeamData[]) => void): Unsubscribe {
    const teamsRef = collection(db, TEAMS_COLLECTION);
    
    return onSnapshot(teamsRef, (snapshot: QuerySnapshot) => {
      const teams = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          number: doc.id,
          EPA: data.EPA,
          notes: data.notes,
          location: data.location,
          name: data.name,
          rank: data.rank,
          robot_name: data.robot_name,
          ranking_data: data.ranking_data
        };
      });
      
      callback(teams);
    }, (error) => {
      console.error('Error subscribing to teams:', error);
    });
  }
  
  /**
   * Subscribe to real-time updates for a specific team
   * @param teamNumber Team number to subscribe to
   * @param callback Function to call when data changes
   * @returns Unsubscribe function
   */
  static subscribeToTeam(teamNumber: string, callback: (team: TeamData | null) => void): Unsubscribe {
    const teamRef = doc(db, TEAMS_COLLECTION, teamNumber);
    
    return onSnapshot(teamRef, (snapshot: DocumentSnapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      
      const data = snapshot.data();
      callback({
        number: teamNumber,
        EPA: data?.EPA,
        notes: data?.notes,
        location: data?.location,
        name: data?.name,
        rank: data?.rank,
        robot_name: data?.robot_name,
        ranking_data: data?.ranking_data
      });
    }, (error) => {
      console.error(`Error subscribing to team ${teamNumber}:`, error);
    });
  }
  // The getAllTeams and getTeamByNumber methods have been replaced by the subscription methods above

  /**
   * Add or update a team in Firestore
   * Uses the team number as the document ID
   */
  static async setTeam(team: TeamData): Promise<void> {
    try {
      if (!team.number) {
        throw new Error('Team number is required');
      }

      // Extract the fields that match Firestore structure
      const { number, imageUrl, ...firestoreData } = team;
      
      await setDoc(doc(db, TEAMS_COLLECTION, team.number), firestoreData);
    } catch (error) {
      console.error('Error setting team:', error);
      throw error;
    }
  }

  /**
   * Update an existing team in Firestore
   */
  static async updateTeam(teamNumber: string, team: Partial<TeamData>): Promise<void> {
    try {
      const teamRef = doc(db, TEAMS_COLLECTION, teamNumber);
      
      // Remove fields that shouldn't be sent to Firestore
      const { number, imageUrl, ...updateData } = team;
      
      await updateDoc(teamRef, updateData as DocumentData);
    } catch (error) {
      console.error(`Error updating team ${teamNumber}:`, error);
      throw error;
    }
  }

  /**
   * Delete a team from Firestore
   */
  static async deleteTeam(teamNumber: string): Promise<void> {
    try {
      await deleteDoc(doc(db, TEAMS_COLLECTION, teamNumber));
    } catch (error) {
      console.error(`Error deleting team ${teamNumber}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time updates for an event schedule
   * @param eventKey The event key to subscribe to
   * @param callback Function to call when data changes
   * @returns Unsubscribe function
   */
  static subscribeToEventSchedule(eventKey: string, callback: (schedule: EventSchedule | null) => void): Unsubscribe {
    const eventRef = doc(db, EVENT_SCHEDULES_COLLECTION, eventKey);
    
    return onSnapshot(eventRef, (snapshot: DocumentSnapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      
      const data = snapshot.data();
      callback({
        event_key: eventKey,
        matches: data?.matches || [],
        last_updated: data?.last_updated?.toDate() || new Date()
      });
    }, (error) => {
      console.error(`Error subscribing to event schedule ${eventKey}:`, error);
    });
  }

  /**
   * Subscribe to real-time updates for a specific match score
   * @param matchKey The match key to subscribe to
   * @param callback Function to call when data changes
   * @returns Unsubscribe function
   */
  static subscribeToMatchScore(matchKey: string, callback: (matchScore: MatchScore | null) => void): Unsubscribe {
    const matchRef = doc(db, MATCH_SCORES_COLLECTION, matchKey);
    
    return onSnapshot(matchRef, (snapshot: DocumentSnapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }
      
      const data = snapshot.data();
      callback({
        match_key: matchKey,
        score_data: data?.score_data,
        last_updated: data?.last_updated?.toDate() || new Date()
      });
    }, (error) => {
      console.error(`Error subscribing to match score ${matchKey}:`, error);
    });
  }

  /**
   * Subscribe to real-time updates for all match scores in an event
   * @param eventKey The event key to subscribe to
   * @param callback Function to call when data changes
   * @returns Unsubscribe function
   */
  static subscribeToEventMatchScores(eventKey: string, callback: (matchScores: MatchScore[]) => void): Unsubscribe {
    const matchesQuery = query(
      collection(db, MATCH_SCORES_COLLECTION),
      where("score_data.event_key", "==", eventKey)
    );
    
    return onSnapshot(matchesQuery, (snapshot: QuerySnapshot) => {
      const matchScores = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          match_key: doc.id,
          score_data: data.score_data,
          last_updated: data.last_updated?.toDate() || new Date()
        };
      });
      
      callback(matchScores);
    }, (error) => {
      console.error(`Error subscribing to event match scores ${eventKey}:`, error);
    });
  }
}
