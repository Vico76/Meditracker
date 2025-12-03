import React, { useState, useEffect, useCallback } from 'react';
import { Pill, Clock, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { MedicationLog, MedicationType, SIX_HOURS_MS } from './types';

const App: React.FC = () => {
  const [lastTaken, setLastTaken] = useState<MedicationLog>({
    doliprane: null,
    ibuprofene: null,
  });
  const [now, setNow] = useState<number>(Date.now());

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('medi_tracker_log');
    if (saved) {
      try {
        setLastTaken(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('medi_tracker_log', JSON.stringify(lastTaken));
  }, [lastTaken]);

  // Timer loop to update "Now" every second (for countdowns)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTake = useCallback((med: MedicationType) => {
    if (confirm(`Confirmer la prise de ${med === 'doliprane' ? 'Doliprane' : 'Ibuprofène'} ?`)) {
      setLastTaken(prev => ({
        ...prev,
        [med]: Date.now()
      }));
    }
  }, []);

  const handleReset = useCallback((med: MedicationType) => {
    if (confirm(`Réinitialiser le minuteur pour ${med === 'doliprane' ? 'Doliprane' : 'Ibuprofène'} ?`)) {
      setLastTaken(prev => ({
        ...prev,
        [med]: null
      }));
    }
  }, []);

  const getStatus = (med: MedicationType) => {
    const timestamp = lastTaken[med];
    if (!timestamp) return { status: 'available', remaining: 0 };

    const diff = now - timestamp;
    if (diff < SIX_HOURS_MS) {
      return { status: 'waiting', remaining: SIX_HOURS_MS - diff };
    }
    return { status: 'available', remaining: 0 };
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const renderCard = (med: MedicationType, name: string) => {
    const { status, remaining } = getStatus(med);
    const isAvailable = status === 'available';

    return (
      <div 
        className={`
          relative w-full max-w-md p-6 rounded-3xl shadow-xl transition-all duration-500 flex flex-col items-center justify-between min-h-[220px]
          ${isAvailable ? 'bg-white border-b-8 border-green-500' : 'bg-red-50 border-b-8 border-red-500'}
        `}
      >
        <div className="absolute top-4 right-4">
          <button 
            onClick={(e) => { e.stopPropagation(); handleReset(med); }}
            className="text-gray-300 hover:text-gray-500 transition-colors p-2"
            aria-label="Reset"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 mt-2">
          <div className={`p-4 rounded-full ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <Pill size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">{name}</h2>
        </div>

        <div className="w-full mt-6">
          {isAvailable ? (
            <button
              onClick={() => handleTake(med)}
              className="w-full py-4 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-xl font-bold text-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={24} />
              PRENDRE
            </button>
          ) : (
            <div className="w-full py-4 bg-red-500 text-white rounded-xl font-bold text-xl shadow-inner flex flex-col items-center justify-center animate-pulse-slow">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={20} />
                <span>ATTENDRE</span>
              </div>
              <span className="text-2xl font-mono tracking-wider">
                {formatTime(remaining)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 gap-8 bg-gray-50 select-none pb-safe">
      <header className="absolute top-0 w-full p-6 pt-12 flex items-center justify-center bg-white shadow-sm z-10">
        <div className="flex items-center gap-2 text-blue-600">
          <AlertCircle size={24} />
          <h1 className="text-xl font-extrabold tracking-wide uppercase">MédiTracker</h1>
        </div>
      </header>
      
      <main className="w-full flex flex-col gap-6 mt-16 max-w-lg">
        {renderCard('doliprane', 'Doliprane')}
        {renderCard('ibuprofene', 'Ibuprofène')}
      </main>

      <footer className="text-gray-400 text-xs text-center mt-4">
        Données stockées localement sur votre appareil.
      </footer>
    </div>
  );
};

export default App;
