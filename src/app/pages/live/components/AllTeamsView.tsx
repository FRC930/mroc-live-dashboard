'use client';

import { motion } from 'framer-motion';
import { TeamData } from '../../../models/TeamData';

interface AllTeamsViewProps {
  blueTeams: TeamData[];
  redTeams: TeamData[];
}

export default function AllTeamsView({ 
  blueTeams, 
  redTeams,
}: AllTeamsViewProps) {
  return (
    <motion.div 
      key="all-teams-view"
      className="flex justify-between items-center h-[calc(100vh-8rem)] relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-[45%] h-full">
        <div className="bg-blue-800 bg-opacity-80 p-3 mb-4 rounded-md shadow-lg border-2 border-blue-700">
          <h2 className="text-3xl font-bold text-center text-blue-200 tracking-wider">BLUE ALLIANCE</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 h-[calc(100%-4rem)]">
          {blueTeams.map((team, index) => (
            <div 
              key={`blue-${index}`} 
              className="flex flex-col items-center bg-blue-900 bg-opacity-50 p-3 rounded-lg shadow-md border border-blue-700"
            >
              <div className="text-4xl md:text-5xl font-bold mb-3 text-blue-200 flex items-center justify-center bg-blue-800 w-full py-2 rounded-md">
                {team.number || '----'}
              </div>
              <div className="w-full flex-grow bg-blue-800 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="text-5xl font-bold text-blue-300 mb-2">🤖</div>
                  <div className="text-xl text-blue-300">Team {team.number}</div>
                  <div className="text-sm text-blue-400 mt-2">Robot image coming soon</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-[10%]">
        <div className="text-4xl font-bold text-white animate-pulse">VS</div>
      </div>

      <div className="w-[45%] h-full">
        <div className="bg-red-800 bg-opacity-80 p-3 mb-4 rounded-md shadow-lg border-2 border-red-700">
          <h2 className="text-3xl font-bold text-center text-red-200 tracking-wider">RED ALLIANCE</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 h-[calc(100%-4rem)]">
          {redTeams.map((team, index) => (
            <div 
              key={`red-${index}`} 
              className="flex flex-col items-center bg-red-900 bg-opacity-50 p-3 rounded-lg shadow-md border border-red-700"
            >
              <div className="text-4xl md:text-5xl font-bold mb-3 text-red-200 flex items-center justify-center bg-red-800 w-full py-2 rounded-md">
                {team.number || '----'}
              </div>
              <div className="w-full flex-grow bg-red-800 rounded-lg flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <div className="text-5xl font-bold text-red-300 mb-2">🤖</div>
                  <div className="text-xl text-red-300">Team {team.number}</div>
                  <div className="text-sm text-red-400 mt-2">Robot image coming soon</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
