'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  
  // New state for specific team selection
  const [specificTeam, setSpecificTeam] = useState<TeamData | null>(null);
  
  // Use the Firestore hook to fetch team data
  const { teams, loading, error } = useFirestore();
  
  const getSelectedTeam = (): TeamData | undefined => {
    // If we have a specific team selected, return that
    if (specificTeam) {
      return specificTeam;
    }
    
    // Otherwise use the alliance/index selection
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
      setSpecificTeam(null); // Clear specific team when selecting an alliance
      setViewMode('alliance');
    });
    
    // Subscribe to robot selection
    const robotUnsubscribe = messagingService.subscribe(MessageType.ROBOT_SELECTION, (payload) => {
      setSelectedAlliance(payload.alliance);
      setSelectedTeamIndex(payload.teamIndex);
      setSpecificTeam(null); // Clear specific team when selecting a robot by alliance/index
      setViewMode('robot');
    });
    
    // Subscribe to specific team selection
    const specificTeamUnsubscribe = messagingService.subscribe(MessageType.SPECIFIC_TEAM_SELECTION, (payload) => {
      const { teamNumber, alliance } = payload;
      
      // Find the team in all teams
      const team = teams.find(t => t.number === teamNumber);
      
      if (team) {
        setSpecificTeam(team);
        setSelectedAlliance(alliance); // Set alliance for display purposes
        setViewMode('robot');
      } else {
        // If team not found in Firestore data, create a basic team object
        setSpecificTeam({
          number: teamNumber,
          // Set default values for required fields
          EPA: 0,
          notes: '',
          location: '',
          name: '',
          rank: 0,
          robot_name: ''
        });
        setSelectedAlliance(alliance);
        setViewMode('robot');
      }
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
      specificTeamUnsubscribe();
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
      <motion.div 
        className="h-screen w-screen relative" 
        style={{ backgroundColor: "#00ff00" }}
      >
        <AnimatePresence mode="wait">
          {viewMode === 'all' && (
            <motion.div
              key="all-teams"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AllTeamsView
                matchNumber={matchNumber}
                blueTeams={blueTeams}
                redTeams={redTeams}
              />
            </motion.div>
          )}

          {viewMode === 'alliance' && (
            <motion.div
              key="alliance"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AllianceView
                teams={selectedAlliance === 'blue' ? blueTeams : redTeams}
                alliance={selectedAlliance}
              />
            </motion.div>
          )}

          {viewMode === 'robot' && getSelectedTeam() && (
            <motion.div
              key="robot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <RobotView
                team={getSelectedTeam()!}
                alliance={selectedAlliance}
              />
            </motion.div>
          )}
          
          {viewMode === 'rankings' && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center h-full w-full"
            >
              <div className="w-full max-w-7xl">
                <RankingsTable 
                  teams={allTeams}
                  itemsPerPage={10}
                  autoChangePage={true}
                  pageChangeInterval={10000}
                  eventKey={eventKey} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Watermarks - only show when not in green screen mode */}
        <div className="absolute bottom-2 left-4 text-white text-sm font-semibold z-50 bg-black px-2 py-1 rounded">
          Built by FRC Team 930
        </div>
        <div className="absolute bottom-2 right-4 text-white text-sm font-semibold z-50 bg-black px-2 py-1 rounded">
          Powered by The Blue Alliance
        </div>
        
        {/* Logo at bottom center */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
          <img 
            src="/images/logo.png" 
            alt="Team Logo" 
            className="max-h-28 w-auto object-contain drop-shadow-[0_0_1px_rgba(0,0,0,1)] filter"
            style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,1))' }}
          />
        </div>
      </motion.div>
    </div>
  );
}
