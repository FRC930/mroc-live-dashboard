'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TeamData, AllianceType, ViewMode } from '../../models/TeamData';
import { getMatchMessagingService, MessageType } from '../../services/MatchMessaging';
import { useFirestore } from '../../hooks/useFirestore';
import AllTeamsView from './components/AllTeamsView';
import AllianceView from './components/AllianceView';
import RobotView from './components/RobotView';
import RankingsTable from './components/RankingsTable';

export default function LivePage() {
  const [matchNumber, setMatchNumber] = useState('');
  const [blueTeams, setBlueTeams] = useState<TeamData[]>([]);
  const [redTeams, setRedTeams] = useState<TeamData[]>([]);
  const [eventKey, setEventKey] = useState<string>(''); 
  
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedAlliance, setSelectedAlliance] = useState<AllianceType>('blue');
  const [selectedTeamIndex, setSelectedTeamIndex] = useState<number>(0);
  const [rankingsPage, setRankingsPage] = useState<number>(0);
  
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
      setEventKey(payload.eventKey); 
      
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
    
    // Subscribe to rankings page changes
    const rankingsPageUnsubscribe = messagingService.subscribe(MessageType.RANKINGS_PAGE_CHANGE, (payload) => {
      setRankingsPage(payload.page);
    });
    
    // Clean up subscriptions
    return () => {
      matchDataUnsubscribe();
      viewModeUnsubscribe();
      allianceUnsubscribe();
      robotUnsubscribe();
      rankingsPageUnsubscribe();
    };
  }, [teams]); 

  useEffect(() => {
    const enhancedBlueTeams = enhanceTeamsWithFirestoreData(blueTeams);
    const enhancedRedTeams = enhanceTeamsWithFirestoreData(redTeams);
    
    setBlueTeams(enhancedBlueTeams);
    setRedTeams(enhancedRedTeams);
  }, [teams]);

  // Combine all teams for rankings view
  const allTeams = [...teams];

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
      <div className="h-screen w-screen relative" style={{ backgroundColor: "#00ff00" }}>
        <AnimatePresence mode="wait">
          {viewMode === 'all' && (
            <AllTeamsView
              matchNumber={matchNumber}
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
          
          {viewMode === 'rankings' && (
            <div className="flex items-center justify-center h-full w-full">
              <div className="w-full max-w-7xl">
                <RankingsTable 
                  teams={allTeams}
                  itemsPerPage={12}
                  autoChangePage={true}
                  pageChangeInterval={10000}
                  eventKey={eventKey} 
                />
              </div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Watermarks */}
        <div className="absolute bottom-2 left-4 text-white text-xs font-semibold opacity-80 z-50 bg-black bg-opacity-50 px-2 py-1 rounded">
          <a href="https://www.team930.com/">Built by FRC Team 930</a>
        </div>
        <div className="absolute bottom-2 right-4 text-white text-xs font-semibold opacity-80 z-50 bg-black bg-opacity-50 px-2 py-1 rounded">
          <a href="https://www.thebluealliance.com/">Powered by The Blue Alliance</a>
        </div>
      </div>
    </div>
  );
}
