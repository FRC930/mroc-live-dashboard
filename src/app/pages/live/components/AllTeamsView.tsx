'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TeamData } from '../../../models/TeamData';

interface AllTeamsViewProps {
  blueTeams: TeamData[];
  redTeams: TeamData[];
}

export default function AllTeamsView({ 
  blueTeams, 
  redTeams,
}: AllTeamsViewProps) {
  // Combine all teams in order: blue teams (3) followed by red teams (3)
  const allTeams = [...blueTeams, ...redTeams];
  
  // Calculate skew angle and other styling parameters
  const blueSkewAngle = 7; // degrees (positive for blue alliance)
  const redSkewAngle = -7; // degrees (negative for red alliance)
  const columnGap = 20; // pixels
  // Use 90% of the width instead of 100% to prevent outer columns from being cut off
  const columnWidth = `calc((90% - ${(allTeams.length - 1) * columnGap}px) / ${allTeams.length})`;
  
  return (
    <motion.div 
      key="all-teams-view"
      className="h-[calc(100vh-4rem)] relative z-10 w-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main container for all slanted columns */}
      <div className="flex justify-center items-stretch h-full w-full px-8">
        {allTeams.map((team, index) => {
          const isBlue = index < 3;
          
          // Determine skew angle based on alliance
          const skewAngle = isBlue ? blueSkewAngle : redSkewAngle;
          
          // Determine vertical position offset for staggering
          // Middle positions (index 1 and 4) should be lower than outer positions
          const isMiddlePosition = index === 1 || index === 4;
          const verticalOffset = isMiddlePosition ? '200px' : '0px';
          let horizontalOffset = '0px';
          if (index === 0) {
            horizontalOffset = '-5.5%';
          } else if (index === 5) {
            horizontalOffset = '5.5%';
          }
          
          return (
            <div 
              key={`team-${index}`}
              className="relative h-full flex flex-col items-center justify-between"
              style={{
                width: columnWidth,
                marginLeft: '5px',
                marginRight: '5px',
              }}
            >
              <div 
                className="absolute inset-0 opacity-80 z-0"
                style={{
                  top: isMiddlePosition ? '10%' : '5%',
                  bottom: isMiddlePosition ? '1%' : '5%',
                  transform: `skewX(${skewAngle}deg) translateX(${horizontalOffset})`,
                  transformOrigin: 'bottom',
                  backgroundColor: isBlue ? '#1e40af' : '#991b1b', /* bg-blue-800 or bg-red-800 */
                  filter: `drop-shadow(${isBlue ? '-10px' : '10px'} 12px 5px #222)`,
                }}
              />
              
              <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-8 px-2">
                <div className="text-5xl md:text-6xl font-bold mb-4" 
                    style={{ 
                        color: isBlue ? '#bfdbfe' : '#fecaca', /* text-blue-200 or text-red-200 */
                        marginTop: isMiddlePosition ? '60%' : '20%', /* Adjust top spacing for staggered layout */
                        transform: isBlue ? `translateX(${-80 + index * 7}%)` : `translateX(${70 + (index-3) * 4}%)`,
                    }}
                >
                  {team.number || '----'}
                </div>
                
                <div 
                  className="flex-grow flex items-center justify-center w-full"
                  style={{
                    marginTop: verticalOffset,
                    transition: 'margin-top 0.5s ease-in-out'
                  }}>
                  {team.number ? (
                    <div className="relative w-full h-64 overflow-visible">
                      <Image 
                        src={`https://firebasestorage.googleapis.com/v0/b/mroc-live-dashboard.firebasestorage.app/o/${team.number}.png?alt=media`}
                        alt={`Team ${team.number} robot`}
                        fill
                        style={{ 
                          objectFit: 'contain',
                          objectPosition: 'center bottom',
                          marginTop: isMiddlePosition ? '150px' : '-30px',
                          transform: `scale(1.8) ${isBlue ? 'translateX(-10%)' : 'translateX(10%)'}`,
                          transformOrigin: 'center bottom',
                          filter: 'drop-shadow(5px 5px 5px #222)',
                        }}
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'text-7xl font-bold';
                            fallback.style.color = isBlue ? '#bfdbfe' : '#fecaca'; /* text-blue-200 or text-red-200 */
                            fallback.textContent = '🤖';
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-7xl font-bold" style={{ color: isBlue ? '#bfdbfe' : '#fecaca' }}>🤖</div>
                  )}
                </div>
              </div>
              
            </div>
          );
        })}
        
        <div className="absolute left-1/2 top-1/6 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="text-6xl font-bold text-white bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent animate-pulse">
            VS
          </div>
        </div>
      </div>
    </motion.div>
  );
}
