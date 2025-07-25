'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import RankingsTable from '../live/components/RankingsTable';

export default function StandingsPage() {
  const [eventKey, setEventKey] = useState<string>('');
  const { teams, loading, error } = useFirestore();

  // Get event key from URL query parameter if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const eventKeyParam = params.get('event');
      if (eventKeyParam) {
        setEventKey(eventKeyParam);
      }
    }
  }, []);

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Gradient background */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'
        }}
      />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-2">
          {loading ? (
            <div className="bg-black bg-opacity-50 rounded-lg p-8 text-center text-white">
              Loading team data...
            </div>
          ) : error ? (
            <div className="bg-red-900 bg-opacity-50 rounded-lg p-8 text-center text-white">
              Error loading team data
            </div>
          ) : (
            <RankingsTable 
              teams={teams}
              itemsPerPage={10}
              autoChangePage={true}
              pageChangeInterval={15000}
              eventKey={eventKey}
            />
          )}
      </div>

      {/* Logo at bottom center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
        <img 
          src="/images/logo.png" 
          alt="Team Logo" 
          className="max-h-28 w-auto object-contain drop-shadow-[0_0_2px_rgba(0,0,0,1)] filter"
          style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,1))' }}
        />
      </div>
    </div>
  );
}
