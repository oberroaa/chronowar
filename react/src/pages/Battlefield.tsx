import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, createGlobalStyle, css } from 'styled-components';
import { raceColors } from '../types/raceColors';
import { savedFormations, buildingsData } from '../types/jsonResponse';

/* 
 * BATTLEFIELD UI - VERTICAL MATCH-3 REDESIGN
 * Focus: Top (Enemies), Center (Grid), Bottom (Heroes)
 * 5 units per side, 4 race-based gemstones
 */

// Types
type Race = 'valdari' | 'gorkar' | 'sylvaran' | 'mortharim';

interface Gem {
  id: string;
  type: Race;
  isMatched?: boolean;
  isFalling?: boolean;
}

interface BattlefieldProps {
  race: Race;
  onExit: () => void;
}

// Map backgrounds correctly based on game assets
const raceBackgrounds: Record<string, string> = {
  valdari: '/images/battlefields/download.png',
  gorkar: '/images/battlefields/download.png',
  sylvaran: '/images/battlefields/download.png',
  mortharim: '/images/battlefields/download.png'
};

// Keyframes
const gemPulse = keyframes`
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.05); filter: brightness(1.2); }
`;

const slideDown = keyframes`
  from { transform: translateY(-40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const gemFall = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; } /* <--- Esto evita que el borde mueva las cosas */
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #000;
  }
`;

// Styled Components
const BattlefieldContainer = styled.div<{ $race: Race }>`
  width: 100vw;
  height: 100vh;
  background: ${props => `url(${raceBackgrounds[props.$race]})`};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%);
    backdrop-filter: blur(1px);
    z-index: 0;
  }
`;

const UnitRow = styled.div<{ $side: 'top' | 'bottom' }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 5px;
  z-index: 10;
  animation: ${props => props.$side === 'top' ? slideDown : slideUp} 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
`;

const UnitCard = styled.div<{ $race: Race; $isEnemy: boolean; $isHero?: boolean }>`
  width: ${props => props.$isHero ? '19.5%' : '18.5%'};
  aspect-ratio: 4/5.5;
  background: ${props => raceColors[props.$race].background};
  border: ${props => props.$isHero ? '2px solid #ffd700' : `1px solid ${raceColors[props.$race].accent}`};
  border-radius: 8px;
  position: relative;
  overflow: visible;
  box-shadow: ${props => props.$isHero ? '0 0 20px rgba(255, 215, 0, 0.4)' : '0 5px 15px rgba(0,0,0,0.7)'};
  transition: all 0.2s ease-out;
  cursor: pointer;
  z-index: ${props => props.$isHero ? 2 : 1};

  &:hover {
    border-color: #fff;
    box-shadow: 0 10px 30px rgba(0,0,0,0.9), 0 0 20px ${props => raceColors[props.$race].accent};
  }
`;

const UnitImageContainer = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Imagen completa que llena el cuadro */
    display: block;
  }
`;

const ManaBarTop = styled.div<{ $color: string; $width: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0,0,0,0.5);
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: ${props => props.$width}%;
    background: ${props => props.$color};
    box-shadow: 0 0 5px ${props => props.$color};
  }
`;

const HeroLabel = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, #ffd700, #b8860b);
  color: #000;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  z-index: 20;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
  white-space: nowrap;
`;

const BattleHUD = styled.div`
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 30px;
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.5);
  color: #ffd700;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  backdrop-filter: blur(5px);
  z-index: 100;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
`;

const ExitButton = styled.button`
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 110;
  font-weight: bold;
  
  &:hover {
    background: rgba(255,0,0,0.4);
    border-color: #ff4444;
  }
`;

const BattleContent = styled.div`
  width: min(90vw, 45vh);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  z-index: 10;
  position: relative;
`;

const BoardSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0;
`;

const BoardOuterFrame = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: 8px;
  background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.3));
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 30px rgba(0,0,0,0.8);
  backdrop-filter: blur(15px);
  display: flex;
`;

const GemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 4px;
  width: 100%;
  height: 100%;
`;

const GemItem = styled.div<{ $race: Race; $isSelected?: boolean; $isMatched?: boolean; $isFalling?: boolean }>`
  width: 100%;
  height: 100%;
  background: ${props => raceColors[props.$race].background};
  border: 1px solid ${props => raceColors[props.$race].accent}88;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: clamp(0.8rem, 2vw, 1.4rem);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  box-shadow: inset 0 0 10px ${props => raceColors[props.$race].accent}22,
              0 2px 5px rgba(0,0,0,0.3);
  animation: ${gemPulse} 4s infinite ease-in-out;
  
  ${props => props.$isSelected && `
    outline: 3px solid #fff;
    outline-offset: -3px;
    box-shadow: 0 0 20px #fff;
    z-index: 5;
    transform: scale(1.1);
  `}

  ${props => props.$isMatched && `
    opacity: 0;
    transform: scale(0);
    transition: all 0.2s ease-out;
  `}

  ${props => props.$isFalling && css`
    animation: ${gemFall} 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  `}

  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: scale(1.1) rotate(3deg);
    border-color: #fff;
    box-shadow: 0 0 25px ${props => raceColors[props.$race].accent};
  }

  &::before {
    content: '${props => raceColors[props.$race].icon}';
    filter: drop-shadow(0 0 5px ${props => raceColors[props.$race].accent});
  }
`;

const Battlefield: React.FC<BattlefieldProps> = ({ race = 'valdari', onExit }) => {
  const [gems, setGems] = useState<Gem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const gemRaces: Race[] = ['valdari', 'gorkar', 'sylvaran', 'mortharim'];

  useEffect(() => {
    const newGems: Gem[] = [];
    for (let i = 0; i < 64; i++) {
      newGems.push({
        id: `gem-${i}-${Math.random()}`,
        type: gemRaces[Math.floor(Math.random() * gemRaces.length)]
      });
    }
    setGems(newGems);
  }, []);

  const checkMatches = (currentGems: Gem[]) => {
    const matches = new Set<number>();

    // Horizontal
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 6; col++) {
        const idx = row * 8 + col;
        const type = currentGems[idx]?.type;
        if (type && currentGems[idx + 1]?.type === type && currentGems[idx + 2]?.type === type) {
          matches.add(idx);
          matches.add(idx + 1);
          matches.add(idx + 2);
        }
      }
    }

    // Vertical
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 6; row++) {
        const idx = row * 8 + col;
        const type = currentGems[idx]?.type;
        if (type && currentGems[idx + 8]?.type === type && currentGems[idx + 16]?.type === type) {
          matches.add(idx);
          matches.add(idx + 8);
          matches.add(idx + 16);
        }
      }
    }

    return Array.from(matches);
  };

  const handleGemClick = async (index: number) => {
    if (isProcessing) return;

    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else {
      const isAdjacent =
        Math.abs(Math.floor(index / 8) - Math.floor(selectedIndex / 8)) +
        Math.abs((index % 8) - (selectedIndex % 8)) === 1;

      if (isAdjacent) {
        setIsProcessing(true);
        const newGems = [...gems];
        [newGems[index], newGems[selectedIndex]] = [newGems[selectedIndex], newGems[index]];

        setGems(newGems);
        setSelectedIndex(null);

        // Wait for swap animation
        await new Promise(r => setTimeout(r, 300));

        const matches = checkMatches(newGems);
        if (matches.length > 0) {
          processMatches(newGems);
        } else {
          // Swap back
          const revertedGems = [...gems];
          setGems(revertedGems);
          setIsProcessing(false);
        }
      } else {
        setSelectedIndex(index);
      }
    }
  };

  const processMatches = async (currentGems: Gem[]) => {
    let workingGems = [...currentGems];
    let hasMatches = true;

    while (hasMatches) {
      const matches = checkMatches(workingGems);
      if (matches.length === 0) {
        hasMatches = false;
        break;
      }

      // Mark matched gems
      workingGems = workingGems.map((g, i) =>
        matches.includes(i) ? { ...g, isMatched: true } : g
      );
      setGems(workingGems);
      await new Promise(r => setTimeout(r, 400));

      // Remove and fall
      for (let col = 0; col < 8; col++) {
        let emptySpots = 0;
        for (let row = 7; row >= 0; row--) {
          const idx = row * 8 + col;
          if (workingGems[idx].isMatched) {
            emptySpots++;
          } else if (emptySpots > 0) {
            workingGems[(row + emptySpots) * 8 + col] = { ...workingGems[idx], isFalling: true };
            workingGems[idx] = { id: '', type: 'valdari', isMatched: true }; // Placeholder
          }
        }

        // Fill top
        for (let row = 0; row < emptySpots; row++) {
          workingGems[row * 8 + col] = {
            id: `gem-${Date.now()}-${row}-${col}`,
            type: gemRaces[Math.floor(Math.random() * gemRaces.length)],
            isFalling: true
          };
        }
      }

      workingGems = workingGems.map(g => ({ ...g, isMatched: false }));
      setGems(workingGems);
      await new Promise(r => setTimeout(r, 500)); // Time for fall animation

      // Reset falling flag
      workingGems = workingGems.map(g => ({ ...g, isFalling: false }));
      setGems(workingGems);
    }

    setIsProcessing(false);
  };

  const enemyUnits = [
    { name: 'Berserker', img: '/images/GorKar/units/Berserker.png' },
    { name: 'Machacador', img: '/images/GorKar/units/Machacador.png' },
    { name: 'Jinete', img: '/images/GorKar/units/Jinete.png' },
    { name: 'Chaman', img: '/images/GorKar/units/Chaman.png' },
    { name: 'Raider', img: '/images/GorKar/units/Raider.png' }
  ];

  const heroUnits = useMemo(() => {
    // Extraer todas las unidades disponibles para hacer la búsqueda por ID
    const allUnits = Object.values(buildingsData).flatMap(b => b.unitsProduced);
    
    // Mapear los IDs de la formación principal a los datos reales de la unidad
    const units = savedFormations.principal.units.slice(0, 5).map(slot => {
      if (!slot) return null;
      const unit = allUnits.find(u => u.id === slot.id);
      return unit ? { name: unit.name, img: unit.image } : null;
    });

    // Asegurarse de tener siempre 5 espacios
    while (units.length < 5) {
      units.push(null);
    }
    return units;
  }, []);

  return (
    <>
      <GlobalStyle />
      <BattlefieldContainer $race={race}>
        <ExitButton onClick={onExit}>SALIR</ExitButton>
        <BattleHUD>TURNO VALDARI</BattleHUD>

        <BattleContent>
          {/* Top Section: Enemy Lineup (5 Units) */}
          <UnitRow $side="top">
            {enemyUnits.map((unit, i) => {
              const unitId = `enemy-${i}`;
              const isHero = i === 2; // Unidad central es Héroe
              return (
                <UnitCard
                  key={unitId}
                  $race="gorkar"
                  $isEnemy={true}
                  $isHero={isHero}
                >
                  {isHero && <HeroLabel>HERO</HeroLabel>}
                  <ManaBarTop $color="#ef4444" $width={100} />
                  <UnitImageContainer>
                    <img src={unit.img} alt={unit.name} />
                  </UnitImageContainer>
                </UnitCard>
              );
            })}
          </UnitRow>

          {/* Middle Section: Match-3 Gem Board */}
          <BoardSection>
            <BoardOuterFrame>
              <GemGrid>
                {gems.map((gem, index) => (
                  <GemItem
                    key={gem.id}
                    $race={gem.type}
                    $isSelected={selectedIndex === index}
                    $isMatched={gem.isMatched}
                    $isFalling={gem.isFalling}
                    onClick={() => handleGemClick(index)}
                  />
                ))}
              </GemGrid>
            </BoardOuterFrame>
          </BoardSection>

          {/* Bottom Section: Hero Lineup (5 Units) */}
          <UnitRow $side="bottom">
            {heroUnits.map((unit, i) => {
              const unitId = `hero-${i}`;
              const isHero = i === 2;
              return (
                <UnitCard
                  key={unitId}
                  $race={race}
                  $isEnemy={false}
                  $isHero={isHero}
                >
                  {isHero && <HeroLabel>HEROE</HeroLabel>}
                  {unit ? (
                    <>
                      <ManaBarTop $color="#3b82f6" $width={100} />
                      <UnitImageContainer>
                        <img src={unit.img} alt={unit.name} />
                      </UnitImageContainer>
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                      Vacío
                    </div>
                  )}
                </UnitCard>
              );
            })}
          </UnitRow>
        </BattleContent>
      </BattlefieldContainer>
    </>
  );
};

export default Battlefield;