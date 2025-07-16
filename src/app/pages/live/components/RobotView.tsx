'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TeamData, AllianceType } from '../../../models/TeamData';

interface RobotViewProps {
  team: TeamData;
  alliance: AllianceType;
}

export default function RobotView({ team, alliance }: RobotViewProps) {
  return (
    <motion.div
      key="robot-view"
      className="h-[calc(100vh-8rem)] relative z-10 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`${alliance === 'blue' ? 'bg-blue-900' : 'bg-red-900'} bg-opacity-70 rounded-lg shadow-lg p-6 border-2 ${alliance === 'blue' ? 'border-blue-700' : 'border-red-700'}`}>
        <h2 className="text-4xl font-bold text-center mb-6">Team {team.number || '?'} | {(team).name || '?'} </h2>

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
                    objectPosition: 'center bottom',
                    transform: 'scale(1.8)',
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
                      fallback.className = 'text-9xl';
                      fallback.textContent = '🤖';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="text-9xl">🤖</div>
            )}
          </motion.div>

          <div className="w-full md:w-2/3">
            <motion.div
              className="grid grid-cols-1 md:col-span gap-4 "

              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-gray-800 bg-opacity-50 p-4 rounded md:col-span-2">
                <h3 className="text-xl font-bold mb-2">Team Stats</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm opacity-70">Record</div>
                    <div className="text-xl font-bold">{(team as any).record || '0-0-0'}</div>
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

              {/* <div className="bg-gray-800 bg-opacity-50 p-4 rounded grid ">
                <h3 className="text-xl font-bold mb-2 ">Robot Info</h3>
                <div className="space-y-2 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm opacity-70">Weight</div>
                    <div className="text-xl font-bold">120 lbs</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">Height</div>
                    <div className="text-xl font-bold">4 ft</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">Drive Train</div>
                    <div className="text-xl font-bold">Swerve</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-70">Robot Name</div>
                    <div className="text-xl font-bold">Bearaccuda</div>
                  </div>
                </div>
              </div> */}

              <div className="bg-gray-800 bg-opacity-50 p-4 rounded md:col-span-2">
                <h3 className="text-xl font-bold mb-2">Notes</h3>
                <div className="text-md">
                  {(team as any).notes || 'No notes available for this team.'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
