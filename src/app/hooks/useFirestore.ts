import { useState, useEffect, useCallback } from 'react';
import { FirestoreService } from '../services/FirestoreService';
import { TeamData } from '../models/TeamData';

/**
 * Custom hook for fetching and managing team data from Firestore
 */
export const useFirestore = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all teams from Firestore
   */
  const fetchAllTeams = useCallback(async () => {
    try {
      setLoading(true);
      const teamsData = await FirestoreService.getAllTeams();
      setTeams(teamsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch teams'));
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single team by number
   */
  const fetchTeam = useCallback(async (teamNumber: string): Promise<TeamData | null> => {
    try {
      setLoading(true);
      const team = await FirestoreService.getTeamByNumber(teamNumber);
      setError(null);
      return team;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to fetch team ${teamNumber}`));
      console.error(`Error fetching team ${teamNumber}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add or update a team
   */
  const saveTeam = useCallback(async (team: TeamData): Promise<void> => {
    try {
      setLoading(true);
      await FirestoreService.setTeam(team);
      // Refresh the teams list
      await fetchAllTeams();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save team'));
      console.error('Error saving team:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchAllTeams]);

  /**
   * Update a team
   */
  const updateTeam = useCallback(async (teamNumber: string, teamData: Partial<TeamData>): Promise<void> => {
    try {
      setLoading(true);
      await FirestoreService.updateTeam(teamNumber, teamData);
      // Refresh the teams list
      await fetchAllTeams();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to update team ${teamNumber}`));
      console.error(`Error updating team ${teamNumber}:`, err);
    } finally {
      setLoading(false);
    }
  }, [fetchAllTeams]);

  /**
   * Delete a team
   */
  const deleteTeam = useCallback(async (teamNumber: string): Promise<void> => {
    try {
      setLoading(true);
      await FirestoreService.deleteTeam(teamNumber);
      // Refresh the teams list
      await fetchAllTeams();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to delete team ${teamNumber}`));
      console.error(`Error deleting team ${teamNumber}:`, err);
    } finally {
      setLoading(false);
    }
  }, [fetchAllTeams]);

  return {
    teams,
    loading,
    error,
    fetchAllTeams,
    fetchTeam,
    saveTeam,
    updateTeam,
    deleteTeam
  };
};
