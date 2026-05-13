import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes, createGlobalStyle, css } from 'styled-components';
import { raceColors } from '../types/raceColors';
import { savedFormations, buildingsData } from '../types/jsonResponse';

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

const raceBackgrounds: Record<string, string> = {
  valdari: '/images/battlefields/download.png',
  gorkar: '/images/battlefields/download.png',
  sylvaran: '/images/battlefields/download.png',
  mortharim: '/images/battlefields/download.png'
};

// --- ANIMATION KEYFRAMES ---
const gemPulse = keyframes`
  0%, 100% { filter: brightness(1) drop-shadow(0 0 2px rgba(255,255,255,0.2)); }
  50% { filter: brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,0.6)); }
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

// --- GLOBAL STYLES ---
const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body, #root {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #050510;
  }
`;

// --- STYLED COMPONENTS ---
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
  padding: 0;
  margin: 0;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    /* Viñeta oscura para enfocar la acción en el centro */
    background: radial-gradient(circle at center, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.85) 100%);
    backdrop-filter: blur(2px);
    z-index: 0;
  }
`;

const BattleContent = styled.div`
  width: 100%;
  max-width: 500px; /* Tamaño ideal para un match 3 vertical */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Más aire entre el tablero y las cartas */
  z-index: 10;
  position: relative;
`;

const UnitRow = styled.div<{ $side: 'top' | 'bottom' }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  z-index: 10;
  animation: ${props => props.$side === 'top' ? slideDown : slideUp} 0.8s cubic-bezier(0.2, 0.9, 0.3, 1.3);
`;

const UnitCard = styled.div<{ $race: Race; $isEnemy: boolean; $isHero?: boolean }>`
  width: ${props => props.$isHero ? '19%' : '18%'};
  aspect-ratio: 3.5/5;
  background: #111;
  /* Marco dorado para héroes, metálico oscuro para el resto */
  border: ${props => props.$isHero ? '2px solid #ffd700' : '2px solid #4a4a5a'};
  border-radius: 8px;
  position: relative;
  overflow: visible;
  /* Sombra agresiva para que resalte del tablero */
  box-shadow: ${props => props.$isHero
    ? '0 8px 25px rgba(255, 215, 0, 0.3), inset 0 0 10px rgba(255, 215, 0, 0.2)'
    : '0 8px 20px rgba(0,0,0,0.8)'};
  transition: all 0.2s ease-out;
  cursor: pointer;
  z-index: ${props => props.$isHero ? 2 : 1};
  transform: ${props => props.$isHero ? 'scale(1.05)' : 'scale(1)'}; /* Héroe un poco más grande */

  &:hover {
    border-color: #fff;
    transform: translateY(-5px) scale(${props => props.$isHero ? '1.1' : '1.05'});
    box-shadow: 0 12px 30px rgba(0,0,0,0.9), 0 0 15px ${props => raceColors[props.$race].accent};
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
    object-fit: cover;
    display: block;
  }

  /* Efecto Viñeta Interna (oscurece bordes de la foto) */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.9);
    pointer-events: none;
  }
`;

const StatusBar = styled.div<{ $color: string; $width: number; $position: 'top' | 'bottom' }>`
  position: absolute;
  ${props => props.$position === 'top' ? 'top: -6px;' : 'bottom: -6px;'}
  left: 5%;
  width: 90%;
  height: 6px;
  background: #000;
  border: 1px solid #333;
  border-radius: 3px;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.8);
  
  &::after {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: ${props => props.$width}%;
    background: linear-gradient(90deg, ${props => props.$color}, #fff); /* Destello en la barra */
    box-shadow: 0 0 5px ${props => props.$color};
    border-radius: 2px;
  }
`;

const HeroLabel = styled.div`
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, #fff8cc, #ffd700, #b8860b);
  border: 1px solid #fff;
  color: #331100;
  padding: 2px 14px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  z-index: 20;
  box-shadow: 0 4px 10px rgba(0,0,0,0.8);
  text-shadow: 0 1px 0 rgba(255,255,255,0.4);
  white-space: nowrap;
`;

// --- HUD STYLES ---
/*
201: const BattleHUD = styled.div`
202:   position: absolute;
203:   top: 20px;
204:   left: 50%;
205:   transform: translateX(-50%);
206:   background: linear-gradient(180deg, rgba(20,20,30,0.9), rgba(0,0,0,0.9));
207:   padding: 10px 40px;
208:   border-radius: 4px;
209:   border-top: 2px solid #ffd700;
210:   border-bottom: 2px solid #ffd700;
211:   border-left: 1px solid rgba(255, 215, 0, 0.5);
212:   border-right: 1px solid rgba(255, 215, 0, 0.5);
213:   color: #ffd700;
214:   font-weight: 900;
215:   font-size: 1.1rem;
216:   text-transform: uppercase;
217:   letter-spacing: 3px;
218:   z-index: 100;
219:   box-shadow: 0 10px 20px rgba(0,0,0,0.8), inset 0 0 15px rgba(255,215,0,0.1);
220:   text-shadow: 0 2px 4px rgba(0,0,0,1);
221: `;
*/

const ExitButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: linear-gradient(to bottom, #444, #111);
  color: #ddd;
  border: 2px solid #555;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 110;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0,0,0,0.6);
  transition: all 0.2s;
  
  &:hover {
    background: linear-gradient(to bottom, #ff5555, #aa0000);
    border-color: #ffaaaa;
    color: #fff;
    box-shadow: 0 0 15px rgba(255,0,0,0.5);
  }
`;

// --- BOARD STYLES ---
const BoardSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 10px;
`;

const BoardOuterFrame = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1.05; /* Un poco mas alto que ancho para que las gemas tengan espacio */
  padding: 10px;
  /* Fondo estilo tablero mágico / piedra tallada */
  background: rgba(10, 15, 25, 0.85); 
  border-radius: 12px;
  border: 3px solid #3a3a4a;
  border-top-color: #5a5a6a;
  border-bottom-color: #1a1a2a;
  box-shadow: 
    0 15px 35px rgba(0,0,0,0.9), 
    inset 0 0 40px rgba(0,0,0,1);
  backdrop-filter: blur(10px);
`;

const GemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 5px; /* Más espacio entre gemas */
  width: 100%;
  height: 100%;
  padding: 4px;
  background: rgba(0,0,0,0.4); /* Foso oscuro para las gemas */
  border-radius: 8px;
  box-shadow: inset 0 5px 15px rgba(0,0,0,0.8);
`;

const GemItem = styled.div<{ $race: Race; $isSelected?: boolean; $isMatched?: boolean; $isFalling?: boolean }>`
  width: 100%;
  height: 100%;
  border-radius: 50%; /* Convertimos en orbe circular */
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: clamp(1rem, 2.5vw, 1.8rem);
  cursor: pointer;
  position: relative;
  
  /* ESTILO 3D (Reflejo superior y sombra inferior) */
  background: radial-gradient(
    circle at 35% 30%, 
    rgba(255, 255, 255, 0.4) 0%, 
    ${props => raceColors[props.$race].background || '#000'} 40%, 
    #000 100%
  );
  box-shadow: 
    inset 0 -4px 6px rgba(0,0,0,0.7), /* Sombra abajo */
    inset 0 2px 4px rgba(255,255,255,0.4), /* Luz arriba */
    0 3px 5px rgba(0,0,0,0.5); /* Sombra de caída */
  
  border: 1px solid ${props => raceColors[props.$race].accent}66;
  
  animation: ${gemPulse} 3s infinite alternate ease-in-out;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  ${props => props.$isSelected && css`
    outline: 2px solid #fff;
    outline-offset: 2px;
    box-shadow: 0 0 20px #fff, inset 0 0 10px #fff;
    z-index: 5;
    transform: scale(1.15);
  `}

  ${props => props.$isMatched && css`
    opacity: 0;
    transform: scale(0) rotate(180deg);
    transition: all 0.3s ease-in;
  `}

  ${props => props.$isFalling && css`
    animation: ${gemFall} 0.4s cubic-bezier(0.175, 0.885, 0.32, 1) forwards;
  `}

  &:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 
      0 5px 15px ${props => raceColors[props.$race].accent},
      inset 0 -4px 6px rgba(0,0,0,0.5), 
      inset 0 4px 8px rgba(255,255,255,0.6);
  }

  &::before {
    content: '${props => raceColors[props.$race].icon}';
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.8)); /* Mejora la lectura del icono */
  }
`;

// --- MAIN COMPONENT ---
const Battlefield: React.FC<BattlefieldProps> = ({ race = 'valdari', onExit }) => {
  const [gems, setGems] = useState<Gem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const gemRaces: Race[] = ['valdari', 'gorkar', 'sylvaran', 'mortharim'];

  useEffect(() => {
    const newGems: Gem[] = [];
    for (let i = 0; i < 64; i++) {
      const row = Math.floor(i / 8);
      const col = i % 8;
      
      let availableRaces = [...gemRaces];
      let selectedType: Race;
      
      while (true) {
        selectedType = availableRaces[Math.floor(Math.random() * availableRaces.length)];
        
        // Check horizontal match
        const horizontalMatch = col >= 2 && 
          newGems[i - 1].type === selectedType && 
          newGems[i - 2].type === selectedType;
          
        // Check vertical match
        const verticalMatch = row >= 2 && 
          newGems[i - 8].type === selectedType && 
          newGems[i - 16].type === selectedType;
          
        if (!horizontalMatch && !verticalMatch) {
          break;
        } else {
          // If match found, remove this type and try another
          availableRaces = availableRaces.filter(r => r !== selectedType);
          if (availableRaces.length === 0) {
            // Fallback (shouldn't happen with 4 types and 3-matches)
            break;
          }
        }
      }

      newGems.push({
        id: `gem-${i}-${Math.random()}`,
        type: selectedType
      });
    }
    setGems(newGems);
  }, []);

  const checkMatches = (currentGems: Gem[]) => {
    const matches = new Set<number>();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 6; col++) {
        const idx = row * 8 + col;
        const type = currentGems[idx]?.type;
        if (type && currentGems[idx + 1]?.type === type && currentGems[idx + 2]?.type === type) {
          matches.add(idx); matches.add(idx + 1); matches.add(idx + 2);
        }
      }
    }
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 6; row++) {
        const idx = row * 8 + col;
        const type = currentGems[idx]?.type;
        if (type && currentGems[idx + 8]?.type === type && currentGems[idx + 16]?.type === type) {
          matches.add(idx); matches.add(idx + 8); matches.add(idx + 16);
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
      const isAdjacent = Math.abs(Math.floor(index / 8) - Math.floor(selectedIndex / 8)) + Math.abs((index % 8) - (selectedIndex % 8)) === 1;
      if (isAdjacent) {
        setIsProcessing(true);
        const newGems = [...gems];
        [newGems[index], newGems[selectedIndex]] = [newGems[selectedIndex], newGems[index]];
        setGems(newGems);
        setSelectedIndex(null);
        await new Promise(r => setTimeout(r, 300));

        const matches = checkMatches(newGems);
        if (matches.length > 0) {
          processMatches(newGems);
        } else {
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
      workingGems = workingGems.map((g, i) => matches.includes(i) ? { ...g, isMatched: true } : g);
      setGems(workingGems);
      await new Promise(r => setTimeout(r, 400));

      for (let col = 0; col < 8; col++) {
        let emptySpots = 0;
        for (let row = 7; row >= 0; row--) {
          const idx = row * 8 + col;
          if (workingGems[idx].isMatched) {
            emptySpots++;
          } else if (emptySpots > 0) {
            workingGems[(row + emptySpots) * 8 + col] = { ...workingGems[idx], isFalling: true };
            workingGems[idx] = { id: '', type: 'valdari', isMatched: true };
          }
        }
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
      await new Promise(r => setTimeout(r, 400));
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
    const allUnits = Object.values(buildingsData).flatMap(b => b.unitsProduced);
    const units = savedFormations.principal.units.slice(0, 5).map(slot => {
      if (!slot) return null;
      const unit = allUnits.find(u => u.id === slot.id);
      return unit ? { name: unit.name, img: unit.image } : null;
    });
    while (units.length < 5) units.push(null);
    return units;
  }, []);

  return (
    <>
      <GlobalStyle />
      <BattlefieldContainer $race={race}>
        <ExitButton onClick={onExit}>SALIR</ExitButton>
{/* <BattleHUD>TURNO VALDARI</BattleHUD> */}

        <BattleContent>
          {/* ENEMIGOS (Arriba) */}
          <UnitRow $side="top">
            {enemyUnits.map((unit, i) => {
              const isHero = i === 2;
              return (
                <UnitCard key={`enemy-${i}`} $race="gorkar" $isEnemy={true} $isHero={isHero}>
                  {isHero && <HeroLabel>BOSS</HeroLabel>}
                  <StatusBar $position="top" $color="#ff3333" $width={100} /> {/* Vida Rojoy */}
                  <UnitImageContainer>
                    <img src={unit.img} alt={unit.name} />
                  </UnitImageContainer>
                  <StatusBar $position="bottom" $color="#aa00ff" $width={100} /> {/* Rage/Mana */}
                </UnitCard>
              );
            })}
          </UnitRow>

          {/* TABLERO (Centro) */}
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

          {/* TUS HÉROES (Abajo) */}
          <UnitRow $side="bottom">
            {heroUnits.map((unit, i) => {
              const isHero = i === 2;
              return (
                <UnitCard key={`hero-${i}`} $race={race} $isEnemy={false} $isHero={isHero}>
                  {/* {isHero && <HeroLabel>HEROE</HeroLabel>} */}
                  {unit ? (
                    <>
                      <StatusBar $position="top" $color="#33ff33" $width={100} /> {/* Vida Verde */}
                      <UnitImageContainer>
                        <img src={unit.img} alt={unit.name} />
                      </UnitImageContainer>
                      <StatusBar $position="bottom" $color="#3399ff" $width={100} /> {/* Mana Azul */}
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
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