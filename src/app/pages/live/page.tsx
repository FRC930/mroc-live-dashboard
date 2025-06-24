'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TeamData, AllianceType, ViewMode } from '../../models/TeamData';
import { getMatchMessagingService } from '../../services/MatchMessaging';
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
  
  const getSelectedTeam = (): TeamData | undefined => {
    if (selectedAlliance === 'blue') {
      return blueTeams[selectedTeamIndex];
    } else {
      return redTeams[selectedTeamIndex];
    }
  };

  // Set up messaging service subscriptions
  useEffect(() => {
    const messagingService = getMatchMessagingService();
    
    // Subscribe to match data updates
    const matchDataUnsubscribe = messagingService.subscribe('MATCH_DATA_UPDATE', (payload) => {
      setMatchNumber(payload.matchNumber);
      setBlueTeams(payload.blueTeams);
      setRedTeams(payload.redTeams);
    });
    
    // Subscribe to view mode changes
    const viewModeUnsubscribe = messagingService.subscribe('VIEW_MODE_CHANGE', (payload) => {
      setViewMode(payload.mode);
    });
    
    // Subscribe to alliance selection
    const allianceUnsubscribe = messagingService.subscribe('ALLIANCE_SELECTION', (payload) => {
      setSelectedAlliance(payload.alliance);
      setViewMode('alliance');
    });
    
    // Subscribe to robot selection
    const robotUnsubscribe = messagingService.subscribe('ROBOT_SELECTION', (payload) => {
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
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
