'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { AllianceType } from '../../models/TeamData';
import { getMatchMessagingService } from '../../services/MatchMessaging';
import { useEventData } from '../../hooks/useEventData';
import { SimplifiedMatch, getMatchName } from '../../models/EventSchedule';

export default function SetupPage() {
  const router = useRouter();
  const [matchNumber, setMatchNumber] = useState('');
  const [blueTeams, setBlueTeams] = useState(['', '', '']);
  const [redTeams, setRedTeams] = useState(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isPushSuccess, setIsPushSuccess] = useState(false);
  const [eventKey, setEventKey] = useState('2021wils1'); // Default event key - replace with your actual event key

  // Use the event data hook to get match schedule
  const { eventSchedule, loading: loadingSchedule, subscribeToEventSchedule } = useEventData();

  // Subscribe to the event schedule
  useEffect(() => {
    subscribeToEventSchedule(eventKey);
  }, [eventKey, subscribeToEventSchedule]);

  // Filter and sort upcoming matches
  const upcomingMatches = useMemo(() => {
    if (!eventSchedule?.matches) return [];

    // Find matches where scores are not set
    const matches = eventSchedule.matches.filter(match => {
      // Check if match hasn't been played yet (score is -1 or not set)
      const redScore = match.alliances.red.score;
      const blueScore = match.alliances.blue.score;
      const isUpcoming = (redScore === undefined || redScore === -1) && 
                         (blueScore === undefined || blueScore === -1);
      
      return isUpcoming;
    });

    // Sort by match number
    return matches.sort((a, b) => a.match_number - b.match_number);
  }, [eventSchedule]);

  // Find the next match after the current one
  const findNextMatch = () => {
    if (!upcomingMatches.length) return;
    
    // If no match is selected, select the first upcoming match
    if (!matchNumber) {
      selectMatch(upcomingMatches[0]);
      return;
    }
    
    // Find the index of the current match
    const currentIndex = upcomingMatches.findIndex(
      match => match.match_number.toString() === matchNumber
    );
    
    // If found and not the last match, select the next one
    if (currentIndex >= 0 && currentIndex < upcomingMatches.length - 1) {
      selectMatch(upcomingMatches[currentIndex + 1]);
    } else {
      // If not found or last match, select the first match
      selectMatch(upcomingMatches[0]);
    }
  };

  // Select a match and populate the form
  const selectMatch = (match: SimplifiedMatch) => {
    // Set match number
    setMatchNumber(match.match_number.toString());
    
    // Set blue teams
    const blueTeamNumbers = match.alliances.blue.team_keys || [];
    const newBlueTeams = [...blueTeams];
    blueTeamNumbers.forEach((team, index) => {
      if (index < 3) {
        newBlueTeams[index] = team;
      }
    });
    setBlueTeams(newBlueTeams);
    
    // Set red teams
    const redTeamNumbers = match.alliances.red.team_keys || [];
    const newRedTeams = [...redTeams];
    redTeamNumbers.forEach((team, index) => {
      if (index < 3) {
        newRedTeams[index] = team;
      }
    });
    setRedTeams(newRedTeams);
  };

  const handleBlueTeamChange = (index: number, value: string) => {
    const newBlueTeams = [...blueTeams];
    newBlueTeams[index] = value;
    setBlueTeams(newBlueTeams);
  };

  const handleRedTeamChange = (index: number, value: string) => {
    const newRedTeams = [...redTeams];
    newRedTeams[index] = value;
    setRedTeams(newRedTeams);
  };

  const handleMatchNumberChange = (value: string) => {
    setMatchNumber(value);
  };

  const pushUpdates = () => {
    setIsLoading(true);

    // Send update via messaging service
    const messagingService = getMatchMessagingService();
    messagingService.updateMatchData({
      matchNumber,
      blueTeams: blueTeams.map(number => ({ number })),
      redTeams: redTeams.map(number => ({ number })),
      eventKey,
    });

    setIsPushSuccess(true);
    setTimeout(() => {
      setIsPushSuccess(false);
      setIsLoading(false);
    }, 1500);
  };

  const goToLive = () => {
    setIsLoading(true);

    // Send match data to the live page via messaging service
    const messagingService = getMatchMessagingService();
    messagingService.updateMatchData({
      matchNumber,
      blueTeams: blueTeams.map(number => ({ number })),
      redTeams: redTeams.map(number => ({ number })),
      eventKey,
    });

    // Navigate to live page
    router.push('/pages/live');
  };

  // Control functions for the live page view modes
  const showAllTeamsView = () => {
    const messagingService = getMatchMessagingService();
    messagingService.changeViewMode('all');
  };

  const showBlueAllianceView = () => {
    const messagingService = getMatchMessagingService();
    messagingService.selectAlliance('blue');
  };

  const showRedAllianceView = () => {
    const messagingService = getMatchMessagingService();
    messagingService.selectAlliance('red');
  };

  const showRobotView = (alliance: AllianceType, teamIndex: number) => {
    const messagingService = getMatchMessagingService();
    messagingService.selectRobot(alliance, teamIndex);
  };

  const showRankingsView = () => {
    const messagingService = getMatchMessagingService();
    messagingService.changeViewMode('rankings');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-red-900 p-6 rounded-lg shadow-lg mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">MROC Live Match Setup</h1>
          <p className="text-center text-gray-300">Enter match and team information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Upcoming Matches Panel */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 p-6 mb-8 rounded-lg shadow-lg h-full">
              <h2 className="text-2xl font-bold mb-4 text-center">Upcoming Matches</h2>
              
              {loadingSchedule ? (
                <div className="flex justify-center items-center h-32">
                  <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : upcomingMatches.length > 0 ? (
                <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                  {upcomingMatches.map((match) => (
                    <button
                      key={match.key}
                      onClick={() => selectMatch(match)}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        match.match_number.toString() === matchNumber
                          ? 'bg-purple-700 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                    >
                      <div className="font-bold">{getMatchName(match)}</div>
                      <div className="grid grid-cols-2 text-sm mt-1">
                        <div className="text-blue-300">
                          Blue: {match.alliances.blue.team_keys.join(', ')}
                        </div>
                        <div className="text-red-300">
                          Red: {match.alliances.red.team_keys.join(', ')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No upcoming matches found
                </div>
              )}
              
              <button
                onClick={findNextMatch}
                disabled={upcomingMatches.length === 0 || loadingSchedule}
                className="w-full mt-4 bg-green-700 hover:bg-green-600 disabled:bg-gray-600 disabled:opacity-50 text-white py-3 rounded-md font-bold flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/>
                </svg>
                NEXT MATCH
              </button>
            </div>
          </div>

          {/* Match Setup Panel */}
          <div className="md:col-span-3">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full mb-8">
              <div className="mt-0">
                <div className="flex gap-4 mb-6">
                  <div className="w-1/2">
                    <label className="block text-gray-300 mb-2 text-lg">Event Key</label>
                    <input
                      type="text"
                      value={eventKey}
                      onChange={(e) => setEventKey(e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 2023micmp"
                    />
                  </div>
                  
                  <div className="w-1/2">
                    <label className="block text-gray-300 mb-2 text-lg">Match Number</label>
                    <input
                      type="text"
                      value={matchNumber}
                      onChange={(e) => handleMatchNumberChange(e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter match number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg border border-blue-700">
                    <h2 className="text-2xl font-bold mb-4 text-blue-300 text-center">Blue Alliance</h2>
                    {blueTeams.map((team, index) => (
                      <div key={`blue-${index}`} className="mb-4">
                        <label className="block text-blue-300 mb-1">Team {index + 1}</label>
                        <input
                          type="text"
                          value={team}
                          onChange={(e) => handleBlueTeamChange(index, e.target.value)}
                          className="w-full bg-blue-800 text-white border border-blue-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Enter team ${index + 1} number`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg border border-red-700">
                    <h2 className="text-2xl font-bold mb-4 text-red-300 text-center">Red Alliance</h2>
                    {redTeams.map((team, index) => (
                      <div key={`red-${index}`} className="mb-4">
                        <label className="block text-red-300 mb-1">Team {index + 1}</label>
                        <input
                          type="text"
                          value={team}
                          onChange={(e) => handleRedTeamChange(index, e.target.value)}
                          className="w-full bg-red-800 text-white border border-red-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder={`Enter team ${index + 1} number`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <button
                    onClick={pushUpdates}
                    disabled={isLoading}
                    className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Updating...</span>
                      </>
                    ) : isPushSuccess ? (
                      <>
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Updated!</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Push Updates</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={goToLive}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Live</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-8 border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-bold mb-4 text-center">Live View Controls</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button
                      onClick={showAllTeamsView}
                      className="bg-purple-800 hover:bg-purple-700 text-white px-4 py-2 rounded-md "
                    >
                      Show All Teams
                    </button>
                    <button
                      onClick={showBlueAllianceView}
                      className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                      Show Blue Alliance
                    </button>
                    <button
                      onClick={showRedAllianceView}
                      className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                    >
                      Show Red Alliance
                    </button>
                    <button
                      onClick={showRankingsView}
                      className="bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                    >
                      Show Rankings
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-lg font-bold mb-2 text-blue-300">Blue Alliance Robots</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map((index) => (
                          <button
                            key={`blue-${index}`}
                            onClick={() => showRobotView('blue', index)}
                            className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-2 rounded-md text-sm"
                          >
                            Robot {index + 1}: {blueTeams[index] || '---'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold mb-2 text-red-300">Red Alliance Robots</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map((index) => (
                          <button
                            key={`red-${index}`}
                            onClick={() => showRobotView('red', index)}
                            className="bg-red-900 hover:bg-red-800 text-white px-3 py-2 rounded-md text-sm"
                          >
                            Robot {index + 1}: {redTeams[index] || '---'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
