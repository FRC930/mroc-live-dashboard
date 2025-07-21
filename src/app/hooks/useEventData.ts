import { useState, useEffect, useCallback, useRef } from 'react';
import { FirestoreService } from '../services/FirestoreService';
import { EventSchedule, SimplifiedMatch } from '../models/EventSchedule';
import { MatchScore } from '../models/MatchScore';
import { Unsubscribe } from 'firebase/firestore';

/**
 * Custom hook for fetching and managing event data from Firestore
 */
export const useEventData = (defaultEventKey?: string) => {
  const [eventSchedule, setEventSchedule] = useState<EventSchedule | null>(null);
  const [matchScores, setMatchScores] = useState<MatchScore[]>([]);
  const [currentMatchScore, setCurrentMatchScore] = useState<MatchScore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentEventKey, setCurrentEventKey] = useState<string | undefined>(defaultEventKey);
  
  // Refs to hold unsubscribe functions
  const scheduleUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const matchScoresUnsubscribeRef = useRef<Unsubscribe | null>(null);
  const matchScoreUnsubscribeRef = useRef<Unsubscribe | null>(null);

  /**
   * Subscribe to an event schedule
   */
  const subscribeToEventSchedule = useCallback((eventKey: string) => {
    setLoading(true);
    setCurrentEventKey(eventKey);
    
    // Clean up any existing subscription
    if (scheduleUnsubscribeRef.current) {
      scheduleUnsubscribeRef.current();
    }
    
    // Set up new subscription
    scheduleUnsubscribeRef.current = FirestoreService.subscribeToEventSchedule(eventKey, (schedule) => {
      setEventSchedule(schedule);
      setLoading(false);
      setError(null);
    });
  }, []);
  
  /**
   * Subscribe to all match scores for an event
   */
  const subscribeToEventMatchScores = useCallback((eventKey: string) => {
    setLoading(true);
    setCurrentEventKey(eventKey);
    
    // Clean up any existing subscription
    if (matchScoresUnsubscribeRef.current) {
      matchScoresUnsubscribeRef.current();
    }
    
    // Set up new subscription
    matchScoresUnsubscribeRef.current = FirestoreService.subscribeToEventMatchScores(eventKey, (scores) => {
      setMatchScores(scores);
      setLoading(false);
      setError(null);
    });
  }, []);
  
  /**
   * Subscribe to a specific match score
   */
  const subscribeToMatchScore = useCallback((matchKey: string) => {
    setLoading(true);
    
    // Clean up any existing subscription
    if (matchScoreUnsubscribeRef.current) {
      matchScoreUnsubscribeRef.current();
    }
    
    // Set up new subscription
    matchScoreUnsubscribeRef.current = FirestoreService.subscribeToMatchScore(matchKey, (score) => {
      setCurrentMatchScore(score);
      setLoading(false);
      setError(null);
    });
  }, []);
  
  /**
   * Subscribe to both event schedule and match scores
   */
  const subscribeToEvent = useCallback((eventKey: string) => {
    subscribeToEventSchedule(eventKey);
    subscribeToEventMatchScores(eventKey);
  }, [subscribeToEventSchedule, subscribeToEventMatchScores]);

  // Set up initial subscription if default event key is provided
  useEffect(() => {
    if (defaultEventKey) {
      subscribeToEvent(defaultEventKey);
    }
    
    // Clean up subscriptions when component unmounts
    return () => {
      if (scheduleUnsubscribeRef.current) {
        scheduleUnsubscribeRef.current();
      }
      if (matchScoresUnsubscribeRef.current) {
        matchScoresUnsubscribeRef.current();
      }
      if (matchScoreUnsubscribeRef.current) {
        matchScoreUnsubscribeRef.current();
      }
    };
  }, [defaultEventKey, subscribeToEvent]);

  /**
   * Get a match by its key
   */
  const getMatchByKey = useCallback((matchKey: string): SimplifiedMatch | undefined => {
    return eventSchedule?.matches.find(match => match.key === matchKey);
  }, [eventSchedule]);

  /**
   * Get matches for a specific team
   */
  const getMatchesForTeam = useCallback((teamNumber: string): SimplifiedMatch[] => {
    if (!eventSchedule?.matches) return [];
    
    return eventSchedule.matches.filter(match => {
      const redTeams = match.alliances.red.team_keys || [];
      const blueTeams = match.alliances.blue.team_keys || [];
      return redTeams.includes(teamNumber) || blueTeams.includes(teamNumber);
    });
  }, [eventSchedule]);

  /**
   * Get match scores for a specific team
   */
  const getMatchScoresForTeam = useCallback((teamNumber: string): MatchScore[] => {
    if (!matchScores.length) return [];
    
    return matchScores.filter(score => {
      const redTeams = score.score_data.alliances.red.team_keys || [];
      const blueTeams = score.score_data.alliances.blue.team_keys || [];
      return redTeams.includes(teamNumber) || blueTeams.includes(teamNumber);
    });
  }, [matchScores]);

  return {
    eventSchedule,
    matchScores,
    currentMatchScore,
    loading,
    error,
    currentEventKey,
    subscribeToEventSchedule,
    subscribeToEventMatchScores,
    subscribeToMatchScore,
    subscribeToEvent,
    getMatchByKey,
    getMatchesForTeam,
    getMatchScoresForTeam
  };
};
