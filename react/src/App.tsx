import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from './pages/HomePage';
import RacePage from './pages/RacePage';
import Battlefield from './pages/Battlefield';
import './App.css';
import { useGameStore } from './store/useGameStore';

const App = () => {
  const { view, race, setView, startGame, tickUpgradeQueue, tickProductionQueue, setBuildingLevel, addCompletedUnit } = useGameStore();

  // Timer global: upgrade queue + production queue - runs on ALL views
  useEffect(() => {
    const timer = setInterval(() => {
      // --- Upgrade completions ---
      const completedUpgrades = tickUpgradeQueue();
      completedUpgrades.forEach(item => {
        if (item.upgrade.startsWith('Level')) {
          const currentLevel = useGameStore.getState().buildingLevels[item.buildingId.toLowerCase()] ?? 0;
          setBuildingLevel(item.buildingId, currentLevel + 1);
        }
      });

      // --- Production completions ---
      const completedUnits = tickProductionQueue();
      completedUnits.forEach(item => {
        addCompletedUnit(item.unit, 1);
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-main-container" style={{ position: 'relative', height: '100vh', width: '100vw', backgroundColor: '#000' }}>
      {view === 'home' && (
        <HomePage onPlay={startGame} />
      )}
      
      {view === 'city' && (
        <RacePage 
          race={race} 
          onBattle={() => setView('battle')} 
          onExit={() => setView('home')}
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
              onExit={() => setView('city')} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
