'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TeamData } from '../../../models/TeamData';

interface AllTeamsViewProps {
  matchNumber: string;
  blueTeams: TeamData[];
  redTeams: TeamData[];
}

export default function AllTeamsView({ 
  matchNumber,
  blueTeams, 
  redTeams,
}: AllTeamsViewProps) {
  return (
    <motion.div 
      key={`all-teams-view-${matchNumber}-${blueTeams.map(t => t.number).join('-')}-${redTeams.map(t => t.number).join('-')}`}
      className="flex flex-col justify-between items-center h-[calc(100vh-8rem)] relative z-10 w-full px-4"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0 0)' }}
      exit={{ clipPath: 'inset(100% 0 0 0)' }}
      transition={{ duration: 0.5 }}
    >
      {/* Match Header */}
      <div className="w-full flex justify-center mb-4 mt-4">
        <motion.div 
          className="bg-white p-1 rounded-lg  w-[80%]"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-black bg-opacity-80 rounded-md p-3 flex justify-center items-center">
            <h1 className="text-4xl font-extrabold text-white text-center tracking-wider">
              MATCH {matchNumber}
            </h1>
          </div>
        </motion.div>
      </div>
      
      {/* Teams Container */}
      <div className="flex justify-between w-full h-[calc(100%-6rem)]">
        {/* Blue Alliance */}
        <motion.div 
          className="w-[45%] h-full"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-1 mb-4 rounded-md ">
            <div className="bg-blue-900 p-3">
              <h2 className="text-3xl font-bold text-center text-blue-200 tracking-wider flex items-center justify-center">
                BLUE ALLIANCE
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 h-[calc(100%-4rem)]">
            {blueTeams.map((team, index) => (
              <TeamCard 
                key={`blue-${index}`} 
                team={team} 
                position={index} 
                alliance="blue"
              />
            ))}
          </div>
        </motion.div>

        {/* VS Divider */}
        <motion.div 
          className="flex flex-col items-center justify-center w-[10%]"
          initial={{ clipPath: 'inset(50% 50% 50% 50%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-red-600 rounded-full"></div>
            <motion.div 
              className="text-6xl font-black text-white bg-black bg-opacity-70 px-6 py-3 rounded-full border-4 border-white relative z-10"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              VS
            </motion.div>
          </div>
        </motion.div>

        {/* Red Alliance */}
        <motion.div 
          className="w-[45%] h-full"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="bg-gradient-to-r from-red-500 to-red-700 p-1 mb-4 rounded-md">
            <div className="bg-red-900 p-3">
              <h2 className="text-3xl font-bold text-center text-red-200 tracking-wider flex items-center justify-center">
                RED ALLIANCE
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 h-[calc(100%-4rem)]">
            {redTeams.map((team, index) => (
              <TeamCard 
                key={`red-${index}`} 
                team={team} 
                position={index} 
                alliance="red"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Team Card Component
function TeamCard({ team, position, alliance }: { team: TeamData, position: number, alliance: 'red' | 'blue' }) {
  const isBlue = alliance === 'blue';
  const gradientBg = isBlue 
    ? 'bg-gradient-to-t from-blue-500 to-blue-900' 
    : 'bg-gradient-to-t from-red-500 to-red-900';
  const borderColor = isBlue ? 'border-blue-600' : 'border-red-600';
  const textColor = isBlue ? 'text-blue-200' : 'text-red-200';
  const statsBg = isBlue ? 'bg-blue-800/70' : 'bg-red-800/70';
  const statsBgHighlight = isBlue ? 'bg-blue-700' : 'bg-red-700';
  
  // Stagger animation based on position
  const animDelay = 0.3 + (position * 0.15);
  
  return (
    <motion.div 
      className={`flex flex-col items-center ${gradientBg} rounded-lg  border-2 ${borderColor} overflow-hidden`}
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0 0 0 0)' }}
      transition={{ duration: 0.5, delay: animDelay }}
    >
      {/* Team Number Header */}
      <div className={`w-full p-1 ${statsBg}`}>
        <div className='py-2 px-1'>
          <div className={`text-4xl font-black ${textColor} text-center`}>
            {team.number || '----'}
          </div>
          {team.name && (
            <div className="text-xs text-center text-gray-300 truncate px-1 mt-1">
              {team.name}
            </div>
          )}
        </div>
      </div>
      
      {/* Key Stats */}
      {team.number && (
        <div className={`w-full px-2 py-2 ${statsBg}`}>
          <div className="grid grid-cols-2 gap-1 text-center">
            <div className={`${statsBgHighlight} rounded p-1`}>
              <div className={`text-xs ${textColor} font-semibold`}>RANK</div>
              <div className="text-2xl font-bold text-white">
                {team.rank ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: animDelay + 0.2 }}
                  >
                    #{team.rank}
                  </motion.div>
                ) : '-'}
              </div>
            </div>
            <div className={`${statsBgHighlight} rounded p-1`}>
              <div className={`text-xs ${textColor} font-semibold`}>RP</div>
              <div className="text-2xl font-bold text-white">
                {team.ranking_data ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: animDelay + 0.4 }}
                  >
                    {team.ranking_data.ranking_score.toFixed(1)}
                  </motion.div>
                ) : '-'}
              </div>
            </div>
            
            
            
            
          </div>
          <div className="grid grid-cols-1 gap-1 py-1 text-center">
          <div className={`${statsBgHighlight} rounded p-1`}>
              <div className={`text-xs ${textColor} font-semibold`}>RECORD</div>
              <div className="text-2xl font-bold text-white ">
                {team.ranking_data ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: animDelay + 0.3 }}
                  >
                    {team.ranking_data.record.wins}-{team.ranking_data.record.losses}-{team.ranking_data.record.ties}
                  </motion.div>
                ) : '-'}
              </div>
            </div>
          </div>
          
        </div>
      )}
      
      {/* Robot Image */}
      <div className={`w-full flex-grow ${statsBg} flex items-center justify-center overflow-hidden relative`}>
        {team.number ? (
          <div className="relative w-full h-full">
            <Image 
              src={`https://firebasestorage.googleapis.com/v0/b/mroc-live-dashboard.firebasestorage.app/o/${team.number}.png?alt=media`}
              alt={`Team ${team.number} robot`}
              fill
              style={{ 
                padding: '14px',
                objectFit: 'contain',
                objectPosition: 'center center',
                transform: 'scale(1.2)',
                transformOrigin: 'center center'
              }}
              onError={(e) => {
                // Fallback to emoji if image fails to load
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
            
            {/* Team Avatar */}
            <div className="absolute bottom-0 left-0 w-full flex justify-center mb-2">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: animDelay + 0.6 }}
                className="relative"
              >
                <Image 
                  src={`https://www.thebluealliance.com/avatar/2025/frc${team.number}.png`}
                  alt={`Team ${team.number} avatar`}
                  width={60}
                  height={60}
                  className="rounded-sm mb-4"
                  onError={(e) => {
                    // Hide if avatar fails to load
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.style.display = 'none';
                  }}
                />
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="text-5xl font-bold text-gray-400 p-8">🤖</div>
        )}
      </div>
    </motion.div>
  );
}
