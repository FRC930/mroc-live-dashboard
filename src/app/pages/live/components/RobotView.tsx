'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TeamData, AllianceType } from '../../../models/TeamData';
import { useEventData } from '../../../hooks/useEventData';
import { useEffect, useMemo } from 'react';
import { SimplifiedMatch, getMatchName } from '../../../models/EventSchedule';

interface RobotViewProps {
  team: TeamData;
  alliance: AllianceType;
}

export default function RobotView({ team, alliance }: RobotViewProps) {
  const bgColor = alliance === 'blue' ? 'bg-blue-900' : 'bg-red-900';
  const borderColor = alliance === 'blue' ? 'border-blue-700' : 'border-red-700';
  const textColor = alliance === 'blue' ? 'text-blue-200' : 'text-red-200';

  const recordData = team.ranking_data?.record;
  let record = 'Unknown';
  if (recordData) {
    record = `${recordData.wins}-${recordData.losses}-${recordData.ties}`;
  }

  // Use the event data hook to get match schedule
  const { eventSchedule, loading, subscribeToEventSchedule } = useEventData();

  // Subscribe to the event schedule if we have a team with ranking data
  useEffect(() => {
    subscribeToEventSchedule('2021wils1');
  }, [subscribeToEventSchedule]);

  // Filter and sort upcoming matches for this team
  const upcomingMatches = useMemo(() => {
    if (!eventSchedule?.matches || !team.number) return [];

    // Find matches where this team is playing and scores are not set
    const teamMatches = eventSchedule.matches.filter(match => {
      // Check if team is in red or blue alliance
      const redTeams = match.alliances.red.team_keys || [];
      const blueTeams = match.alliances.blue.team_keys || [];
      const isTeamInMatch = redTeams.includes(team.number) || blueTeams.includes(team.number);

      // Check if match hasn't been played yet (score is -1 or not set)
      const redScore = match.alliances.red.score;
      const blueScore = match.alliances.blue.score;
      const isUpcoming = (redScore === undefined || redScore === -1) &&
        (blueScore === undefined || blueScore === -1);

      return isTeamInMatch && isUpcoming;
    });

    // Sort by match number
    return teamMatches.sort((a, b) => a.match_number - b.match_number);
  }, [eventSchedule, team.number]);

  // Get the alliance and opponents for a match
  const getMatchDetails = (match: SimplifiedMatch) => {
    const redTeams = match.alliances.red.team_keys || [];
    const blueTeams = match.alliances.blue.team_keys || [];

    // Determine which alliance the team is on
    const teamAlliance = redTeams.includes(team.number) ? 'red' : 'blue';

    // Get the teammates and opponents
    const teammates = teamAlliance === 'red'
      ? redTeams.filter(t => t !== team.number)
      : blueTeams.filter(t => t !== team.number);

    const opponents = teamAlliance === 'red' ? blueTeams : redTeams;

    return {
      alliance: teamAlliance,
      teammates,
      opponents
    };
  };

  return (
    <motion.div
      key="robot-view"
      className="h-[45vh] absolute top-0 z-2 w-full p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`${bgColor} rounded-lg shadow-xl p-6 border-2 ${borderColor}`}
        style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)' }}>
        <h2 className={`text-4xl font-bold text-center mb-6 ${textColor}`}>Team {team.number || '?'} | {(team).name || '?'} </h2>

        <div className="flex flex-col md:flex-row gap-8">
          <motion.div
            className="w-full md:w-1/3 flex justify-center items-start"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {team.number ? (
              <div className="relative w-96 h-96 overflow-visible">
                <Image
                  src={`https://firebasestorage.googleapis.com/v0/b/mroc-live-dashboard.firebasestorage.app/o/${team.number}.png?alt=media`}
                  alt={`Team ${team.number} robot`}
                  fill
                  style={{
                    objectFit: 'contain',
                    transform: 'scale(1.2)',
                    transformOrigin: 'center bottom'
                  }}
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = `text-9xl ${textColor}`;
                      fallback.textContent = '🤖';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
            ) : (
              <div className={`text-9xl ${textColor}`}>🤖</div>
            )}
          </motion.div>

          <div className="w-full md:w-2/3">
            <motion.div
              className="grid grid-cols-1 md:col-span gap-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-gray-800 p-4 rounded md:col-span-2 border border-gray-700">
                <h3 className="text-xl font-bold mb-2">Team Stats</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm opacity-70">Record</div>
                    <div className="text-xl font-bold">{record}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">Location</div>
                    <div className="text-xl font-bold">{(team as any).location || 'Location not found'}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">Ranking</div>
                    <div className="text-xl font-bold">{team.rank || 'Rank not found'}</div>
                  </div>

                  <div>
                    <div className="text-sm opacity-70">Robot Name</div>
                    <div className="text-xl font-bold">{team.robot_name || 'Robot name not found'}</div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded md:col-span-2 border border-gray-700">
                <h3 className="text-xl font-bold mb-2">Notes</h3>
                <div className="text-md">
                  {(team as any).notes || 'No notes available for this team.'}
                </div>
              </div>  
              <div className="bg-gray-800 p-4 rounded md:col-span-2 border border-gray-700">
                <h3 className="text-xl font-bold mb-2">Upcoming Matches</h3>
                {loading ? (
                  <div className="text-center py-4">Loading match schedule...</div>
                ) : upcomingMatches.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-1xl">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2">Match</th>
                          <th className="text-left py-2">Partners</th>
                          <th className="text-left py-2">Against</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingMatches.map((match) => {
                          const details = getMatchDetails(match);
                          return (
                            <tr key={match.key} className="border-b border-gray-700">
                              <td className="py-2">{getMatchName(match)}</td>
                              <td className="py-2">{details.teammates.join(', ')}</td>
                              <td className="py-2">{details.opponents.join(', ')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">No upcoming matches found</div>
                )}
              </div>


            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
