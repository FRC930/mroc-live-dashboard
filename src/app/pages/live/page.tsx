'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TeamData, AllianceType, ViewMode } from '../../models/TeamData';
import { getMatchMessagingService, MessageType } from '../../services/MatchMessaging';
import { useFirestore } from '../../hooks/useFirestore';
import AllTeamsView from './components/AllTeamsView';
import AllianceView from './components/AllianceView';
import RobotView from './components/RobotView';

export default function LivePage() {
  const [matchNumber, setMatchNumber] = useState('');
  const [blueTeams, setBlueTeams] = useState<TeamData[]>([]);
  const [redTeams, setRedTeams] = useState<TeamData[]>([]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedAlliance, setSelectedAlliance] = useState<AllianceType>('blue');
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number>(0);
  
  // Use the Firestore hook to fetch team data
  const { teams, loading, error } = useFirestore();
  
  const getSelectedTeam = (): TeamData | undefined => {
    if (selectedAlliance === 'blue') {
      return blueTeams[selectedTeamIndex];
    } else {
      return redTeams[selectedTeamIndex];
    }
  };

  // Enhance teams with Firestore data
  const enhanceTeamsWithFirestoreData = (teamNumbers: TeamData[]) => {
    return teamNumbers.map(basicTeam => {
      // Find the matching team in Firestore data
      const firestoreTeam = teams.find(t => t.number === basicTeam.number);
      // Return the Firestore data if found, otherwise return the basic team
      return firestoreTeam || basicTeam;
    });
  };

  // Set up messaging service subscriptions
  useEffect(() => {
    const messagingService = getMatchMessagingService();
    
    // Subscribe to match data updates
    const matchDataUnsubscribe = messagingService.subscribe(MessageType.MATCH_DATA_UPDATE, (payload) => {
      setMatchNumber(payload.matchNumber);
      
      // Enhance teams with Firestore data if available
      const enhancedBlueTeams = enhanceTeamsWithFirestoreData(payload.blueTeams);
      const enhancedRedTeams = enhanceTeamsWithFirestoreData(payload.redTeams);
      
      setBlueTeams(enhancedBlueTeams);
      setRedTeams(enhancedRedTeams);
    });
    
    // Subscribe to view mode changes
    const viewModeUnsubscribe = messagingService.subscribe(MessageType.VIEW_MODE_CHANGE, (payload) => {
      setViewMode(payload.mode);
    });
    
    // Subscribe to alliance selection
    const allianceUnsubscribe = messagingService.subscribe(MessageType.ALLIANCE_SELECTION, (payload) => {
      setSelectedAlliance(payload.alliance);
      setViewMode('alliance');
    });
    
    // Subscribe to robot selection
    const robotUnsubscribe = messagingService.subscribe(MessageType.ROBOT_SELECTION, (payload) => {
      setSelectedAlliance(payload.alliance);
      setSelectedTeamIndex(payload.teamIndex);
      setViewMode('robot');
    });
    
    // Clean up subscriptions
    return () => {
      matchDataUnsubscribe();
      viewModeUnsubscribe();
      allianceUnsubscribe();
      robotUnsubscribe();
    };
  }, [teams]); // Add teams as a dependency to re-run when Firestore data changes

  useEffect(() => {
    const enhancedBlueTeams = enhanceTeamsWithFirestoreData(blueTeams);
    const enhancedRedTeams = enhanceTeamsWithFirestoreData(redTeams);
    
    setBlueTeams(enhancedBlueTeams);
    setRedTeams(enhancedRedTeams);
  }, [teams]);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {loading && (
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
          Loading team data...
        </div>
      )}
      {error && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-md text-sm">
          Error loading team data
        </div>
      )}
      <div className="h-screen w-screen relative bg-gradient-to-r from-blue-900 via-purple-900 to-red-900 py-4">
        <AnimatePresence mode="wait">
          {viewMode === 'all' && (
            <AllTeamsView 
              blueTeams={blueTeams}
              redTeams={redTeams}
            />
          )}

          {viewMode === 'alliance' && (
            <AllianceView
              teams={selectedAlliance === 'blue' ? blueTeams : redTeams}
              alliance={selectedAlliance}
            />
          )}

          {viewMode === 'robot' && getSelectedTeam() && (
            <RobotView
              team={getSelectedTeam()!}
              alliance={selectedAlliance}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
