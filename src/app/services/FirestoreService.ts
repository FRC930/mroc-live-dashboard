import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { TeamData, createEmptyTeam } from '../models/TeamData';

// Collection reference
const TEAMS_COLLECTION = 'team_info';

/**
 * Firestore service for handling team data operations
 */
export class FirestoreService {
  /**
   * Get all teams from Firestore
   */
  static async getAllTeams(): Promise<TeamData[]> {
    try {
      const teamsSnapshot = await getDocs(collection(db, TEAMS_COLLECTION));
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
   * Get a team by its number
   */
  static async getTeamByNumber(teamNumber: string): Promise<TeamData | null> {
    try {
      const teamRef = doc(db, TEAMS_COLLECTION, teamNumber);
      const teamSnapshot = await getDoc(teamRef);
      
      if (!teamSnapshot.exists()) {
        return null;
      }
      
      const data = teamSnapshot.data();
      return {
        number: teamNumber,
        EPA: data.EPA,
        notes: data.notes,
        location: data.location,
        name: data.name,
        rank: data.rank,
        robot_name: data.robot_name
      };
    } catch (error) {
      console.error(`Error getting team ${teamNumber}:`, error);
      throw error;
    }
  }

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
}
