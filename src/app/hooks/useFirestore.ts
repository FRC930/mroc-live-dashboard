import { useState, useEffect, useCallback, useRef } from 'react';
import { FirestoreService } from '../services/FirestoreService';
import { TeamData } from '../models/TeamData';
import { Unsubscribe } from 'firebase/firestore';

/**
 * Custom hook for fetching and managing team data from Firestore
 */
export const useFirestore = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentTeam, setCurrentTeam] = useState<TeamData | null>(null);
  
  // Refs to hold unsubscribe functions
  const teamsUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const teamUnsubscribeRef = useRef<Unsubscribe | null>(null);

  /**
   * Subscribe to all teams from Firestore
   */
  const subscribeToAllTeams = useCallback(() => {
    setLoading(true);
    
    // Clean up any existing subscription
    if (teamsUnsubscribeRef.current) {
      teamsUnsubscribeRef.current();
    }
    
    // Set up new subscription
    teamsUnsubscribeRef.current = FirestoreService.subscribeToAllTeams((teamsData) => {
      setTeams(teamsData);
      setLoading(false);
      setError(null);
    });
  }, []);
  
  /**
   * Subscribe to a single team by number
   */
  const subscribeToTeam = useCallback((teamNumber: string) => {
    setLoading(true);
    
    // Clean up any existing subscription
    if (teamUnsubscribeRef.current) {
      teamUnsubscribeRef.current();
    }
    
    // Set up new subscription
    teamUnsubscribeRef.current = FirestoreService.subscribeToTeam(teamNumber, (team) => {
      setCurrentTeam(team);
      setLoading(false);
      setError(null);
    });
  }, []);
  
  // Set up initial subscription when the hook mounts
  useEffect(() => {
    subscribeToAllTeams();
    
    // Clean up subscriptions when component unmounts
    return () => {
      if (teamsUnsubscribeRef.current) {
        teamsUnsubscribeRef.current();
      }
      if (teamUnsubscribeRef.current) {
        teamUnsubscribeRef.current();
      }
    };
  }, [subscribeToAllTeams]);

  /**
   * Add or update a team
   */
  const saveTeam = useCallback(async (team: TeamData): Promise<void> => {
    try {
      setLoading(true);
      await FirestoreService.setTeam(team);
      // No need to refresh teams - the subscription will handle that
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save team'));
      console.error('Error saving team:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a team
   */
  const updateTeam = useCallback(async (teamNumber: string, teamData: Partial<TeamData>): Promise<void> => {
    try {
      setLoading(true);
      await FirestoreService.updateTeam(teamNumber, teamData);
      // No need to refresh teams - the subscription will handle that
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update team ${teamNumber}`));
      console.error(`Error updating team ${teamNumber}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a team
   */
  const deleteTeam = useCallback(async (teamNumber: string): Promise<void> => {
    try {
      setLoading(true);
      await FirestoreService.deleteTeam(teamNumber);
      // No need to refresh teams - the subscription will handle that
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete team ${teamNumber}`));
      console.error(`Error deleting team ${teamNumber}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    teams,
    currentTeam,
    loading,
    error,
    subscribeToAllTeams,
    subscribeToTeam,
    saveTeam,
    updateTeam,
    deleteTeam
  };
};
