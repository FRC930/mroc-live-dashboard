'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamData } from '../../../models/TeamData';

interface RankingsTableProps {
  teams: TeamData[];
  itemsPerPage?: number;
  autoChangePage?: boolean;
  pageChangeInterval?: number; // in milliseconds
  eventKey?: string; // Optional event key to filter teams
}

const RankingsTable = ({
  teams,
  itemsPerPage = 10,
  autoChangePage = true,
  pageChangeInterval = 2500, // 15 seconds
  eventKey,
}: RankingsTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Filter teams by event key and sort by rank
  const sortedTeams = useMemo(() => {
    // First filter by event key if provided
    const filteredTeams = eventKey 
      ? teams.filter(team => team.ranking_data?.event_key === eventKey)
      : teams;
    
    // Then sort by rank
    return [...filteredTeams].sort((a, b) => {
      // Sort by rank if available
      if (a.rank !== undefined && b.rank !== undefined) {
        return a.rank - b.rank;
      }
      // Fall back to team number if rank is not available
      return a.number.localeCompare(b.number);
    });
  }, [teams, eventKey]);
  
  // Calculate total pages
  const totalPages = Math.ceil(sortedTeams.length / itemsPerPage);
  
  // Get current page items
  const currentTeams = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return sortedTeams.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTeams, currentPage, itemsPerPage]);

  // Calculate empty rows needed to maintain consistent table height
  const emptyRowsCount = useMemo(() => {
    if (currentPage === Math.floor(sortedTeams.length / itemsPerPage)) {
      // If we're on the last page, calculate how many empty rows we need
      return itemsPerPage - currentTeams.length;
    }
    return 0;
  }, [currentPage, currentTeams.length, itemsPerPage, sortedTeams.length]);

  console.log(currentTeams[0]);
  
  // Define sort order info based on the provided documentation
  const sortOrderInfo = [
    { name: "Ranking Score", precision: 2 },
    { name: "Avg Coop", precision: 2 },
    { name: "Avg Match", precision: 2 },
    { name: "Avg Auto", precision: 2 },
    { name: "Avg Barge", precision: 2 }
  ];
  
  // Auto-change page
  useEffect(() => {
    if (!autoChangePage || totalPages <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, pageChangeInterval);
    
    return () => clearInterval(interval);
  }, [autoChangePage, totalPages, pageChangeInterval]);
  
  // Reset to first page when event key changes
  useEffect(() => {
    setCurrentPage(0);
  }, [eventKey]);
  
  // Handle manual page change
  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Format record as W-L-T
  const formatRecord = (team: TeamData) => {
    if (!team.ranking_data?.record) return 'N/A';
    
    const { wins, losses, ties } = team.ranking_data.record;
    return `${wins}-${losses}-${ties}`;
  };

  // Format a number value with appropriate precision
  const formatValue = (value: number | undefined, precision: number = 2) => {
    if (value === undefined) return 'N/A';
    
    // If it's a whole number, don't show decimal places
    if (Number.isInteger(value)) return value.toString();
    
    // Otherwise show with specified precision
    return value.toFixed(precision);
  };

  // If no teams match the filter, show a message
  if (sortedTeams.length === 0) {
    return (
      <motion.div
        className="bg-black rounded-lg shadow-xl overflow-hidden p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.91)' }}
      >
        <h2 className="text-2xl font-bold mb-4">Team Rankings</h2>
        <p className="text-gray-300">
          {eventKey 
            ? `No team rankings available for event: ${eventKey}` 
            : 'No team rankings available'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-black rounded-lg shadow-xl overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backgroundColor: 'rgba(0, 0, 0, .95)' }}>
      <div className="p-6 bg-blue-900 border-b-2 border-blue-700">
        <h2 className="text-3xl font-bold text-center text-white">
          Team Rankings {eventKey && `- Event: ${eventKey}`}
        </h2>
      </div>
      
      <div className="overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 p-3 bg-gray-900 border-b border-gray-700 font-bold text-gray-300">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-2">Team</div>
          <div className="col-span-2 text-center">Record (W-L-T)</div>
          <div className="col-span-2 text-center">Ranking Score</div>
          {/* Dynamic columns for sort orders */}
          {sortOrderInfo.slice(1).map((info, index) => (
            <div key={index} className="col-span-1 text-center">
              {info.name}
            </div>
          ))}
        </div>
        
        {/* Table Body with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.5 }}
          >
            {currentTeams.map((team) => (
              <div 
                key={team.number}
                className="grid grid-cols-12 gap-2 p-3 border-b border-gray-700 items-center text-xl hover:bg-gray-700"
              >
                <div className="col-span-1 text-center font-bold text-xl">
                  {team.rank || 'N/A'}
                </div>
                <div className="col-span-2 font-semibold">
                  <div>{team.number}</div>
                  <div className="text-sm text-gray-300 truncate whitespace-nowrap overflow-hidden">{team.name || 'team name'}</div>
                </div>
                <div className="col-span-2 text-center">
                  {formatRecord(team)}
                </div>
                <div className="col-span-2 text-center">
                  {formatValue(team.ranking_data?.ranking_score, 2)}
                </div>
                {/* Dynamic columns for sort orders using the array */}
                {sortOrderInfo.slice(1).map((info, index) => (
                  <div key={index} className="col-span-1 text-center">
                    {formatValue(team.ranking_data?.sort_orders?.[index + 1], info.precision)}
                  </div>
                ))}
              </div>
            ))}
            
            {/* Empty rows to maintain consistent table height */}
            {Array.from({ length: emptyRowsCount }).map((_, index) => (
              <div 
                key={`empty-${index}`}
                className="grid grid-cols-12 gap-2 p-3 border-b border-gray-700 items-center text-xl"
              >
                <div className="col-span-1 text-center font-bold text-xl opacity-0">-</div>
                <div className="col-span-2 font-semibold opacity-0">
                    <div>-</div>
                    <div className='text-sm'>-</div>
                </div>
                <div className="col-span-2 text-center opacity-0">-</div>
                <div className="col-span-2 text-center opacity-0">-</div>
                {sortOrderInfo.slice(1).map((_, colIndex) => (
                  <div key={colIndex} className="col-span-1 text-center opacity-0">-</div>
                ))}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RankingsTable;
