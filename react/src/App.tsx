import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from './pages/HomePage';
import RacePage from './pages/RacePage';
import Battlefield from './pages/Battlefield';
import './App.css';
import { type RaceType } from './types/gameData';

const App = () => {
  const [view, setView] = useState<'home' | 'city' | 'battle'>('home');
  const [race, setRace] = useState<RaceType>('valdari');

  const handleStartGame = (selectedRace: RaceType) => {
    setRace(selectedRace);
    setView('city');
  };

  const handleEnterBattle = () => {
    setView('battle');
  };

  const handleBackToCity = () => {
    setView('city');
  };

  const handleBackToHome = () => {
    setView('home');
  };

  return (
    <div className="app-main-container" style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: '#000' }}>
      {view === 'home' && (
        <HomePage onPlay={handleStartGame} />
      )}
      
      {view === 'city' && (
        <RacePage 
          race={race} 
          onBattle={handleEnterBattle} 
          onExit={handleBackToHome}
        />
      )}
      
      <AnimatePresence>
        {view === 'battle' && (
          <motion.div
            key="battle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              zIndex: 1000 
            }}
          >
            <Battlefield 
              race={race} 
              onExit={handleBackToCity} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
