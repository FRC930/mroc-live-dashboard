'use client';

import { motion } from 'framer-motion';
import { TeamData, AllianceType } from '../../../models/TeamData';

interface AllianceViewProps {
  teams: TeamData[];
  alliance: AllianceType;
}

export default function AllianceView({ teams, alliance }: AllianceViewProps) {
  const allianceColor = alliance === 'blue' ? 'blue' : 'red';
  
  return (
    <motion.div
      key="alliance-view"
      className="h-[calc(100vh-8rem)] relative z-10 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`bg-gradient-to-r from-${allianceColor}-900 to-purple-900 p-6 rounded-lg shadow-lg mb-6 border-2 border-${allianceColor}-700`}>
        <h2 className="text-4xl font-bold text-center mb-2">
          {alliance === 'blue' ? 'BLUE ALLIANCE' : 'RED ALLIANCE'}
        </h2>
      </div>
      
      <div className="space-y-4">
        {teams.map((team, index) => (
          <motion.div 
            key={`team-${index}`} 
            className={`flex items-center p-4 mb-4 rounded-lg shadow-md border ${allianceColor === 'blue' ? 'bg-blue-900 bg-opacity-50 border-blue-700' : 'bg-red-900 bg-opacity-50 border-red-700'}`}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="w-1/3 flex justify-center items-center">
              {team.imageUrl ? (
                <img src={team.imageUrl} alt={`Team ${team.number}`} className="w-32 h-32 object-contain" />
              ) : (
                <div className="text-7xl">🤖</div>
              )}
            </div>
            <div className="w-2/3 pl-6">
              <h3 className="text-3xl font-bold mb-2">Team {team.number || '?'}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 bg-opacity-50 p-2 rounded">
                  <div className="text-sm opacity-70">Wins</div>
                  <div className="text-xl font-bold">{team.stats?.wins || '0'}</div>
                </div>
                <div className="bg-gray-800 bg-opacity-50 p-2 rounded">
                  <div className="text-sm opacity-70">Losses</div>
                  <div className="text-xl font-bold">{team.stats?.losses || '0'}</div>
                </div>
                <div className="bg-gray-800 bg-opacity-50 p-2 rounded">
                  <div className="text-sm opacity-70">Ranking</div>
                  <div className="text-xl font-bold">{team.stats?.ranking || 'N/A'}</div>
                </div>
                <div className="bg-gray-800 bg-opacity-50 p-2 rounded">
                  <div className="text-sm opacity-70">Status</div>
                  <div className="text-xl font-bold">Ready</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
