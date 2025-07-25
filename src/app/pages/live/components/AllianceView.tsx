'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TeamData, AllianceType } from '../../../models/TeamData';

interface AllianceViewProps {
  teams: TeamData[];
  alliance: AllianceType;
}

export default function AllianceView({ teams, alliance }: AllianceViewProps) {
  const allianceColor = alliance === 'blue' ? 'blue' : 'red';
  const textColor = alliance === 'blue' ? 'text-blue-200' : 'text-red-200';
  const bgColor = alliance === 'blue' ? 'bg-blue-800' : 'bg-red-800';
  const borderColor = alliance === 'blue' ? 'border-blue-600' : 'border-red-600';

  return (
    <motion.div
      key={`alliance-view-${alliance}-${teams.map(t => t.number).join('-')}`}
      className="h-[calc(100vh-8rem)] relative z-10 w-full px-[calc(25px)] top-[10px] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full">
        <div className={`${bgColor} p-6 rounded-lg mb-4 border-2 ${borderColor}`}>
          <h2 className={`text-4xl font-bold text-center mb-2 ${textColor}`}>
            {alliance === 'blue' ? 'BLUE ALLIANCE' : 'RED ALLIANCE'}
          </h2>
        </div>

        <div className="space-y-4">
          {teams.map((team, index) => (
            <motion.div
              key={`team-${index}`}
              className={`flex items-center p-4 mb-4 rounded-lg shadow-xl border-2 ${allianceColor === 'blue' ? 'bg-blue-900 border-blue-700' : 'bg-red-900 border-red-700'}`}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-1/3 flex justify-center items-center overflow-visible">
                {team.number ? (
                  <div className="relative w-48 h-48 overflow-visible">
                    <Image
                      src={`https://firebasestorage.googleapis.com/v0/b/mroc-live-dashboard.firebasestorage.app/o/${team.number}.png?alt=media`}
                      alt={`Team ${team.number} robot`}
                      fill
                      style={{
                        objectFit: 'contain',
                        objectPosition: 'center bottom',
                        transform: 'scale(1.6)',
                        transformOrigin: 'center bottom'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className={`text-7xl ${textColor}`}>🤖</div>
                )}
              </div>
              <div className="w-2/3 pl-6">
                <h3 className={`text-3xl font-bold mb-2 ${textColor}`}>Team {team.number || '?'} | {team.name || 'Name not found'}</h3>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800 p-2 rounded border border-gray-700">
                    <div className="text-sm opacity-70">Record</div>
                    <div className="text-xl font-bold">{(team as any).record || '0-0-0'}</div>
                  </div>
                  <div className="bg-gray-800 p-2 rounded border border-gray-700">
                    <div className="text-sm opacity-70">Location</div>
                    <div className="text-xl font-bold">{(team as any).location || 'No location found'}</div>
                  </div>
                  
                  <div className="bg-gray-800 p-2 rounded border border-gray-700">
                    <div className="text-sm opacity-70">Ranking</div>
                    <div className="text-xl font-bold">{team.rank || 'Rank not found'}</div>
                  </div>
                  <div className="bg-gray-800 p-2 rounded border border-gray-700">
                    <div className="text-sm opacity-70">Robot Name</div>
                    <div className="text-xl font-bold">{(team as any).robot_name || 'No robot name found'}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
