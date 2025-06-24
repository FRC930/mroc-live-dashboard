'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { TeamData, AllianceType, ViewMode } from '../../models/TeamData';
import { getMatchMessagingService } from '../../services/MatchMessaging';
import AllTeamsView from './components/AllTeamsView';
import AllianceView from './components/AllianceView';
import RobotView from './components/RobotView';

export default function LivePage() {
  const router = useRouter();
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

  // Initial data load from localStorage (only once on component mount)
  const loadInitialData = () => {
    try {
      const storedMatchNumber = localStorage.getItem('matchNumber');
      if (storedMatchNumber) {
        setMatchNumber(storedMatchNumber);
      }

      const storedBlueTeams = localStorage.getItem('blueTeams');
      if (storedBlueTeams) {
        const parsedBlueTeams = JSON.parse(storedBlueTeams);
        setBlueTeams(parsedBlueTeams.map((number: string) => ({ number })));
      }

      const storedRedTeams = localStorage.getItem('redTeams');
      if (storedRedTeams) {
        const parsedRedTeams = JSON.parse(storedRedTeams);
        setRedTeams(parsedRedTeams.map((number: string) => ({ number })));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  };

  // Set up messaging service subscriptions
  useEffect(() => {
    // Load initial data once
    loadInitialData();
    
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
      <div className="h-screen w-screen relative bg-gradient-to-r from-blue-900 via-purple-900 to-red-900 p-4 overflow-hidden">
        
        <div className="text-center mb-6 relative z-10">
          <h1 className="text-5xl font-bold py-2">Match {matchNumber}</h1>
        </div>
        
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
