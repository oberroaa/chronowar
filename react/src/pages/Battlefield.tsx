import React, {
  useState, useEffect,
  useCallback, useRef
} from 'react';
import styled, { keyframes, createGlobalStyle, css } from 'styled-components';
import { raceColors } from '../types/raceColors';
import { savedFormations, buildingsData } from '../types/jsonResponse';
import { executeHeroSkill } from '../utils/combatSkills';
import { useGameStore } from '../store/useGameStore';
import { getUpgradedUnits } from '../utils/unitStats';


/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type Race = 'valdari' | 'gorkar' | 'sylvaran' | 'mortharim';
type GamePhase = 'playerTurn' | 'processing' | 'enemyThinking' | 'enemyTurn' | 'victory' | 'defeat';
type FloatKind = 'dmg' | 'heal' | 'crit' | 'combo' | 'skill';
type Side = 'player' | 'enemy';

interface Gem {
  id: string;
  type: Race;
  special: 'none' | 'power' | 'lightning';
  isMatched?: boolean;
  isFalling?: boolean;
}
export interface Unit {
  name: string;
  img: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  isDead: boolean;
  isAttacking: boolean;
  isHit: boolean;
  isSkillReady: boolean;
  skillName: string;
  skillDesc: string;
  skillAction?: string;
  poison?: number;
  shield?: number;
  attackBonus?: number;
  armorBonus?: number;
}
interface FloatNum { id: string; text: string; x: number; y: number; kind: FloatKind; }
interface MatchGroup { indices: number[]; type: Race; centerIdx: number; length: number; }
interface CascadeResult { gems: Gem[]; enemies: Unit[]; heroes: Unit[]; ended: boolean; }
interface SkillResult { E: Unit[]; H: Unit[]; ended: boolean; }
interface BattlefieldProps { race: Race; onExit: () => void; }

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const SLEEP = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const RACES: Race[] = ['valdari', 'gorkar', 'sylvaran', 'mortharim'];

const GEM_FX: Record<Race, { dmg: number; valdariDmg: number; manaGain: number; heal: number; poison: number; shield: number }> = {
  valdari: { dmg: 0, valdariDmg: 1, manaGain: 3, heal: 0, poison: 0, shield: 0 },
  gorkar: { dmg: 5, valdariDmg: 0, manaGain: 0, heal: 0, poison: 0, shield: 1 },
  sylvaran: { dmg: 0, valdariDmg: 0, manaGain: 1, heal: 3, poison: 0, shield: 0 },
  mortharim: { dmg: 2, valdariDmg: 0, manaGain: 0, heal: 0, poison: 1, shield: 0 },
};

const AI_PREF: Record<Race, number> = {
  gorkar: 3.5,
  sylvaran: 2.8,
  mortharim: 2.3,
  valdari: 1.6,
};

// ← Each enemy now has mana cap + full skill definition
const ENEMY_DEFS = [
  {
    name: 'Berserker', img: '/images/GorKar/units/Berserker.png',
    maxHp: 300, atk: 24, def: 5, maxMana: 90,
    skillName: 'Furia Berserker',
    skillDesc: 'Golpea 2 héroes aleatorios con 1.5× daño',
  },
  {
    name: 'Machacador', img: '/images/GorKar/units/Machacador.png',
    maxHp: 250, atk: 28, def: 3, maxMana: 100,
    skillName: 'Aplastamiento',
    skillDesc: '90 de daño al héroe con más HP',
  },
  {
    name: 'JEFE', img: '/images/GorKar/units/Jinete.png',
    maxHp: 600, atk: 45, def: 15, maxMana: 120,
    skillName: 'Grito de Guerra',
    skillDesc: '40 de daño a TODOS los héroes',
  },
  {
    name: 'Chamán', img: '/images/GorKar/units/Chaman.png',
    maxHp: 200, atk: 18, def: 8, maxMana: 80,
    skillName: 'Curación Tribal',
    skillDesc: 'Cura 60 HP a todos los enemigos vivos',
  },
  {
    name: 'Raider', img: '/images/GorKar/units/Raider.png',
    maxHp: 180, atk: 32, def: 2, maxMana: 100,
    skillName: 'Emboscada',
    skillDesc: '3 golpes de 25 daño a héroes aleatorios',
  },
];

const HERO_SKILLS = [
  { skillName: 'Golpe Crítico', skillDesc: '3× daño al enemigo con menos HP', skillAction: 'single_heavy' },
  { skillName: 'Escudo Divino', skillDesc: 'Cura 80 HP a todos los aliados', skillAction: 'heal_all_mid' },
  { skillName: 'Devastación', skillDesc: '60 daño a TODOS los enemigos', skillAction: 'aoe_mid' },
  { skillName: 'Lluvia de Flechas', skillDesc: '45 daño a 3 enemigos aleatorios', skillAction: 'random_3_mid' },
  { skillName: 'Sanación Mayor', skillDesc: 'Restaura 120 HP al aliado más herido', skillAction: 'heal_single_heavy' },
];
const HERO_DEFS = [
  { maxHp: 280, atk: 22, def: 8 },
  { maxHp: 320, atk: 18, def: 15 },
  { maxHp: 420, atk: 35, def: 10 },
  { maxHp: 260, atk: 28, def: 6 },
  { maxHp: 240, atk: 15, def: 5 },
];
const BG: Record<Race, string> = {
  valdari: '/images/battlefields/download.png', gorkar: '/images/battlefields/download.png',
  sylvaran: '/images/battlefields/download.png', mortharim: '/images/battlefields/download.png',
};

/* ══════════════════════════════════════════════════════════════
   KEYFRAMES
══════════════════════════════════════════════════════════════ */
const gemPulse = keyframes`
  0%,100%{ filter:brightness(1) drop-shadow(0 0 2px rgba(255,255,255,.2)); }
  50%    { filter:brightness(1.3) drop-shadow(0 0 8px rgba(255,255,255,.6)); }
`;
const powerPulse = keyframes`
  0%,100%{ box-shadow:0 0 8px  #ff8800,inset 0 0 5px  rgba(255,136,0,.5); }
  50%    { box-shadow:0 0 22px #ff8800,inset 0 0 14px rgba(255,136,0,.9); }
`;
const lightPulse = keyframes`
  0%,100%{ box-shadow:0 0 8px  #fff,inset 0 0 5px  rgba(255,255,255,.5); }
  50%    { box-shadow:0 0 26px #fff,inset 0 0 16px rgba(255,255,255,.95); }
`;
const enemySelect = keyframes`
  0%,100%{
    box-shadow:0 0 12px #f44,0 0 28px rgba(255,0,0,.6),inset 0 0 10px rgba(255,50,50,.7);
    border-color:#ff5555; transform:scale(1.1);
  }
  50%{
    box-shadow:0 0 26px #f44,0 0 55px rgba(255,0,0,.9),inset 0 0 20px rgba(255,80,80,.95);
    border-color:#ffaaaa; transform:scale(1.18);
  }
`;
const gemFall = keyframes`from{transform:translateY(-120%);opacity:0;}to{transform:translateY(0);opacity:1;}`;
const matchPop = keyframes`0%{transform:scale(1) rotate(0);opacity:1;}50%{transform:scale(1.5) rotate(90deg);opacity:.7;}100%{transform:scale(0) rotate(180deg);opacity:0;}`;
const floatUp = keyframes`0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1);}40%{opacity:1;transform:translateX(-50%) translateY(-32px) scale(1.25);}100%{opacity:0;transform:translateX(-50%) translateY(-75px) scale(.8);}`;
const hitFlash = keyframes`0%,100%{filter:brightness(1);}25%{filter:brightness(5) saturate(0);}60%{filter:brightness(2.5);}`;
const attackBounce = keyframes`0%{transform:translateY(0) scale(1.05);}35%{transform:translateY(-20px) scale(1.12);}65%{transform:translateY(12px) scale(.96);}100%{transform:translateY(0) scale(1.05);}`;
const screenShake = keyframes`0%,100%{transform:translate(0,0);}15%{transform:translate(-8px,3px);}30%{transform:translate(8px,-3px);}50%{transform:translate(-6px,6px);}70%{transform:translate(6px,-6px);}85%{transform:translate(-3px,2px);}`;
const slideDown = keyframes`from{transform:translateY(-70px);opacity:0;}to{transform:translateY(0);opacity:1;}`;
const slideUp = keyframes`from{transform:translateY(70px);opacity:0;}to{transform:translateY(0);opacity:1;}`;
const victoryGlow = keyframes`0%,100%{text-shadow:0 0 20px #ffd700,0 0 50px #ffd700;}50%{text-shadow:0 0 50px #fff,0 0 100px #ffd700;}`;
const defeatGlow = keyframes`0%,100%{text-shadow:0 0 20px #f00,0 0 50px #f00;}50%{text-shadow:0 0 50px #fff,0 0 100px #f00;}`;
// ← Gold glow for hero skills
const heroSkillAnim = keyframes`
  0%,100%{box-shadow:0 0 10px #ffd700,inset 0 0 10px rgba(255,215,0,.3);border-color:#ffd700;}
  50%    {box-shadow:0 0 28px #ffd700,inset 0 0 22px rgba(255,215,0,.7);border-color:#fff;}
`;
// ← Red glow for enemy skills
const enemySkillAnim = keyframes`
  0%,100%{box-shadow:0 0 10px #f44,inset 0 0 10px rgba(255,68,68,.3);border-color:#f44;}
  50%    {box-shadow:0 0 28px #f44,inset 0 0 22px rgba(255,68,68,.7);border-color:#faa;}
`;
const popIn = keyframes`0%{opacity:0;transform:translateX(-50%) scale(.4);}70%{transform:translateX(-50%) scale(1.2);}100%{opacity:1;transform:translateX(-50%) scale(1);}`;
const overlayIn = keyframes`from{opacity:0;transform:scale(.92);}to{opacity:1;transform:scale(1);}`;
const thinkBlink = keyframes`0%,100%{opacity:.35;}50%{opacity:1;}`;
// ← Brief flash when a skill fires
const skillCastFlash = keyframes`
  0%  {box-shadow:0 0 0   rgba(255,255,255,0);}
  30% {box-shadow:0 0 60px rgba(255,255,255,.9),inset 0 0 30px rgba(255,255,255,.6);}
  100%{box-shadow:0 0 0   rgba(255,255,255,0);}
`;

/* ══════════════════════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════════════════════ */
const GlobalStyle = createGlobalStyle`
  *{box-sizing:border-box;}
  html,body,#root{
    margin:0;padding:0;width:100%;height:100%;
    overflow:hidden;background:#050510;
    font-family:'Cinzel Decorative','Palatino Linotype',serif;
  }
`;

/* ══════════════════════════════════════════════════════════════
   STYLED COMPONENTS — LAYOUT
══════════════════════════════════════════════════════════════ */
const BattlefieldWrap = styled.div<{ $race: Race; $shaking: boolean }>`
  width:100vw;height:100vh;
  background:url(${p => BG[p.$race]}) center/cover no-repeat;
  display:flex;flex-direction:column;justify-content:center;
  overflow:hidden;position:relative;
  ${p => p.$shaking && css`animation:${screenShake} .5s cubic-bezier(.36,.07,.19,.97);`}
  &::before{
    content:'';position:absolute;inset:0;
    background:radial-gradient(circle at center,rgba(0,0,0,.08) 20%,rgba(0,0,0,.86) 100%);
    backdrop-filter:blur(2px);z-index:0;
  }
`;
const BattleContent = styled.div`
  width:100%;max-width:500px;margin:0 auto;
  display:flex;flex-direction:column;align-items:center;
  gap:14px;z-index:10;position:relative;
`;

/* ══════════════════════════════════════════════════════════════
   STYLED COMPONENTS — HUD
══════════════════════════════════════════════════════════════ */
const HUDBar = styled.div`
  position:absolute;top:14px;left:50%;transform:translateX(-50%);
  display:flex;align-items:center;gap:12px;z-index:200;
`;
const TurnTag = styled.div<{ $enemy: boolean }>`
  background:linear-gradient(180deg,rgba(20,20,30,.96),rgba(0,0,0,.96));
  padding:7px 24px;border-radius:4px;
  border-top:2px solid    ${p => p.$enemy ? '#f44' : '#ffd700'};
  border-bottom:2px solid ${p => p.$enemy ? '#f44' : '#ffd700'};
  border-left:1px solid   ${p => p.$enemy ? 'rgba(255,68,68,.4)' : 'rgba(255,215,0,.4)'};
  border-right:1px solid  ${p => p.$enemy ? 'rgba(255,68,68,.4)' : 'rgba(255,215,0,.4)'};
  color:${p => p.$enemy ? '#f77' : '#ffd700'};
  font-weight:900;font-size:.82rem;letter-spacing:3px;text-transform:uppercase;
  box-shadow:0 8px 20px rgba(0,0,0,.8),inset 0 0 12px rgba(0,0,0,.4);
  text-shadow:0 2px 4px rgba(0,0,0,1);white-space:nowrap;
`;
const ThinkingTag = styled.div`
  background:linear-gradient(180deg,rgba(35,5,5,.97),rgba(0,0,0,.97));
  padding:7px 24px;border-radius:4px;
  border:2px solid #f44;color:#f99;
  font-weight:900;font-size:.82rem;letter-spacing:3px;text-transform:uppercase;
  animation:${thinkBlink} .75s ease-in-out infinite;white-space:nowrap;
`;
const ComboTag = styled.div<{ $enemy: boolean }>`
  background:${p => p.$enemy
    ? 'linear-gradient(to right,#cc2222,#ff4444)'
    : 'linear-gradient(to right,#ff8800,#ffcc00)'};
  color:${p => p.$enemy ? '#fff' : '#000'};
  padding:6px 18px;border-radius:20px;
  font-weight:900;font-size:.9rem;letter-spacing:2px;
  box-shadow:0 0 20px ${p => p.$enemy ? 'rgba(255,50,50,.8)' : 'rgba(255,180,0,.8)'};
  animation:${popIn} .3s ease-out;white-space:nowrap;
`;
const ExitBtn = styled.button`
  position:absolute;top:20px;left:20px;
  background:linear-gradient(to bottom,#444,#111);
  color:#ddd;border:2px solid #555;padding:8px 20px;border-radius:4px;
  cursor:pointer;z-index:300;font-weight:bold;
  box-shadow:0 4px 6px rgba(0,0,0,.6);transition:all .2s;
  &:hover{background:linear-gradient(to bottom,#f55,#a00);border-color:#faa;color:#fff;box-shadow:0 0 16px rgba(255,0,0,.5);}
`;

/* ══════════════════════════════════════════════════════════════
   STYLED COMPONENTS — UNIT CARDS
══════════════════════════════════════════════════════════════ */
const UnitRow = styled.div<{ $side: 'top' | 'bottom' }>`
  width:100%;display:flex;justify-content:space-between;padding:0 10px;
  animation:${p => p.$side === 'top' ? slideDown : slideUp} .8s cubic-bezier(.2,.9,.3,1.3);
`;

// ← $isEnemyUnit controls which colour the skill-ready glow uses
const UnitCard = styled.div<{
  $race: Race; $isHero: boolean; $isDead: boolean;
  $attacking: boolean; $hit: boolean; $skillReady: boolean;
  $isEnemyUnit: boolean; $casting: boolean;
}>`
  width:${p => p.$isHero ? '19%' : '18%'};aspect-ratio:3.5/5;
  background:#111;
  border:2px solid ${p =>
    p.$skillReady && !p.$isDead
      ? (p.$isEnemyUnit ? '#f44' : '#ffd700')
      : p.$isHero ? '#ffd700' : '#4a4a5a'
  };
  border-radius:8px;position:relative;overflow:visible;
  box-shadow:${p => p.$isHero
    ? '0 8px 25px rgba(255,215,0,.3),inset 0 0 10px rgba(255,215,0,.2)'
    : '0 8px 20px rgba(0,0,0,.8)'};
  cursor:pointer;transition:opacity .3s,filter .3s;
  z-index:${p => p.$isHero ? 2 : 1};
  transform:${p => p.$isHero ? 'scale(1.05)' : 'scale(1)'};
  opacity:${p => p.$isDead ? .22 : 1};
  filter:${p => p.$isDead ? 'grayscale(1)' : 'none'};

  ${p => p.$attacking && css`animation:${attackBounce}   .52s ease-in-out;`}
  ${p => p.$hit && css`animation:${hitFlash}       .42s ease-out;`}
  ${p => p.$casting && css`animation:${skillCastFlash} .6s  ease-out;`}
  ${p => p.$skillReady && !p.$isDead && !p.$attacking && !p.$hit && !p.$casting && css`
    animation:${p.$isEnemyUnit ? enemySkillAnim : heroSkillAnim} 1.6s ease-in-out infinite;
  `}

  &:hover{
    ${p => !p.$isDead && css`
      border-color:#fff;
      transform:translateY(-5px) scale(${p.$isHero ? 1.1 : 1.05});
      box-shadow:0 12px 30px rgba(0,0,0,.9),
        0 0 15px ${(raceColors as any)[p.$race]?.accent || '#fff'};
    `}
  }
`;
const UnitImgWrap = styled.div`
  width:100%;height:100%;border-radius:6px;overflow:hidden;position:relative;
  img{width:100%;height:100%;object-fit:cover;display:block;}
  &::after{content:'';position:absolute;inset:0;box-shadow:inset 0 0 22px rgba(0,0,0,.92);pointer-events:none;}
`;
const DeadMask = styled.div`
  position:absolute;inset:0;background:rgba(0,0,0,.6);border-radius:6px;
  display:flex;align-items:center;justify-content:center;font-size:1.8rem;z-index:5;
`;
const HPBar = styled.div<{ $pct: number; $clr: string; $pos: 'top' | 'bot' }>`
  position:absolute;${p => p.$pos === 'top' ? 'top:-6px;' : 'bottom:-6px;'}
  left:5%;width:90%;height:6px;
  background:#000;border:1px solid #222;border-radius:3px;z-index:10;overflow:hidden;
  &::after{
    content:'';position:absolute;left:0;top:0;bottom:0;
    width:${p => Math.max(0, Math.min(100, p.$pct))}%;
    background:linear-gradient(90deg,${p => p.$clr},rgba(255,255,255,.65));
    box-shadow:0 0 6px ${p => p.$clr};border-radius:2px;transition:width .4s ease-out;
  }
`;
const BossLabel = styled.div`
  position:absolute;top:-17px;left:50%;transform:translateX(-50%);
  background:linear-gradient(to bottom,#ff7777,#cc0000,#880000);
  border:1px solid #ff8888;color:#fff;padding:2px 10px;border-radius:12px;
  font-size:.62rem;font-weight:900;text-transform:uppercase;z-index:20;
  box-shadow:0 4px 10px rgba(0,0,0,.85);white-space:nowrap;
`;
// Gold badge for hero skills
const HeroSkillBadge = styled.div`
  position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);
  background:linear-gradient(to bottom,#ffd700,#ff8800);
  border:1px solid rgba(255,255,255,.8);color:#000;
  padding:1px 9px;border-radius:10px;
  font-size:.54rem;font-weight:900;text-transform:uppercase;z-index:20;
  box-shadow:0 0 10px rgba(255,215,0,.9);white-space:nowrap;
  animation:${popIn} .35s ease-out;
`;
// Red badge for enemy skills
const EnemySkillBadge = styled.div`
  position:absolute;top:-16px;left:50%;transform:translateX(-50%);
  background:linear-gradient(to bottom,#ff5555,#aa0000);
  border:1px solid rgba(255,200,200,.8);color:#fff;
  padding:1px 9px;border-radius:10px;
  font-size:.52rem;font-weight:900;text-transform:uppercase;z-index:20;
  box-shadow:0 0 12px rgba(255,68,68,.95);white-space:nowrap;
  animation:${popIn} .35s ease-out;
`;
const badgePopIn = keyframes`
  0% { opacity: 0; transform: scale(0.4); }
  70% { transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
`;
const BadgesRow = styled.div`
  position:absolute;bottom:10px;left:6px;right:6px;
  display:flex;align-items:center;
  pointer-events:none;z-index:20;
  gap:4px;
`;
const PoisonBadge = styled.div`
  background:linear-gradient(to bottom,#11ff11,#008800);
  border:1px solid #5f5;color:#fff;
  padding:2px 6px;border-radius:8px;
  font-size:.56rem;font-weight:900;
  box-shadow:0 0 8px rgba(0,255,0,.7);white-space:nowrap;
  pointer-events:none;
  animation:${badgePopIn} .3s ease-out;
`;
const ShieldBadge = styled.div`
  background:linear-gradient(to bottom,#00ccff,#0044cc);
  border:1px solid #5cf;color:#fff;
  padding:2px 6px;border-radius:8px;
  font-size:.56rem;font-weight:900;
  box-shadow:0 0 8px rgba(0,200,255,.7);white-space:nowrap;
  pointer-events:none;
  animation:${badgePopIn} .3s ease-out;
  margin-left:auto;
`;
// Tooltip for hero skills (gold)
const HeroTip = styled.div`
  position:absolute;bottom:calc(100% + 14px);left:50%;transform:translateX(-50%);
  background:rgba(12,12,30,.98);border:1px solid #ffd700;border-radius:8px;
  padding:10px 14px;font-size:.6rem;color:#fff;width:190px;text-align:left;
  z-index:400;box-shadow:0 8px 24px rgba(0,0,0,.95);line-height:1.6;
  &::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);
    border:6px solid transparent;border-top-color:#ffd700;}
`;
// Tooltip for enemy skills (red)
const EnemyTip = styled.div`
  position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);
  background:rgba(25,10,10,.98);border:1px solid #f44;border-radius:8px;
  padding:10px 14px;font-size:.6rem;color:#fff;width:190px;text-align:left;
  z-index:400;box-shadow:0 8px 24px rgba(0,0,0,.95);line-height:1.6;
  &::after{content:'';position:absolute;bottom:100%;left:50%;transform:translateX(-50%);
    border:6px solid transparent;border-bottom-color:#f44;}
`;

/* ══════════════════════════════════════════════════════════════
   STYLED COMPONENTS — BOARD
══════════════════════════════════════════════════════════════ */
const BoardWrap = styled.div`width:100%;display:flex;justify-content:center;padding:0 10px;`;
const BoardFrame = styled.div`
  width:100%;aspect-ratio:1/1.05;padding:10px;
  background:rgba(10,15,25,.86);border-radius:12px;
  border:3px solid #3a3a4a;border-top-color:#5a5a6a;border-bottom-color:#1a1a2a;
  box-shadow:0 15px 35px rgba(0,0,0,.92),inset 0 0 40px rgba(0,0,0,1);
  backdrop-filter:blur(10px);
`;
const GemGrid = styled.div`
  display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);
  gap:5px;width:100%;height:100%;padding:4px;
  background:rgba(0,0,0,.42);border-radius:8px;box-shadow:inset 0 5px 15px rgba(0,0,0,.85);
`;
const GemEl = styled.div<{
  $race: Race; $special: 'none' | 'power' | 'lightning';
  $sel: boolean; $matched: boolean; $falling: boolean; $enemyTarget: boolean;
}>`
  width:100%;height:100%;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:clamp(.75rem,2.1vw,1.5rem);cursor:pointer;position:relative;
  background:radial-gradient(
    circle at 35% 30%,
    rgba(255,255,255,.42) 0%,
    ${p => (raceColors as any)[p.$race]?.background || '#111'} 40%,
    #000 100%
  );
  box-shadow:inset 0 -4px 7px rgba(0,0,0,.72),inset 0 2px 4px rgba(255,255,255,.42),0 3px 5px rgba(0,0,0,.55);
  border:${p =>
    p.$special === 'power' ? '2px solid #ff8800' :
      p.$special === 'lightning' ? '2px solid #ffffff' :
        `1px solid ${(raceColors as any)[p.$race]?.accent || '#fff'}55`};
  transition:transform .18s cubic-bezier(.175,.885,.32,1.275);
  animation:${p =>
    p.$enemyTarget ? css`${enemySelect}  .65s ease-in-out infinite` :
      p.$special === 'power' ? css`${powerPulse}   1s   infinite alternate` :
        p.$special === 'lightning' ? css`${lightPulse}   .8s  infinite alternate` :
          css`${gemPulse} 3s infinite alternate ease-in-out`
  };
  ${p => p.$sel && css`outline:2.5px solid #fff;outline-offset:2px;box-shadow:0 0 22px #fff,inset 0 0 12px #fff;z-index:5;transform:scale(1.18);`}
  ${p => p.$matched && css`animation:${matchPop} .38s ease-in forwards;`}
  ${p => p.$falling && css`animation:${gemFall}  .42s cubic-bezier(.175,.885,.32,1) forwards;`}
  &:hover{
    transform:scale(1.12) translateY(-2px);
    box-shadow:0 5px 18px ${p => (raceColors as any)[p.$race]?.accent || '#fff'},
      inset 0 -4px 7px rgba(0,0,0,.5),inset 0 4px 9px rgba(255,255,255,.65);
  }
  &::before{
    content:'${p => p.$special === 'power' ? '💥' : p.$special === 'lightning' ? '🌀' : (raceColors as any)[p.$race]?.icon || '?'}';
    filter:drop-shadow(0 2px 3px rgba(0,0,0,.9));
  }
`;

/* ══════════════════════════════════════════════════════════════
   STYLED COMPONENTS — FLOATS & OVERLAYS
══════════════════════════════════════════════════════════════ */
const FloatEl = styled.div<{ $kind: FloatKind; $x: number; $y: number }>`
  position:absolute;left:${p => p.$x}px;top:${p => p.$y}px;
  color:${p =>
    p.$kind === 'crit' ? '#ff9900' :
      p.$kind === 'heal' ? '#33ff77' :
        p.$kind === 'combo' ? '#ffd700' :
          p.$kind === 'skill' ? '#dd88ff' :
            '#ff4444'};
  font-size:${p => ['crit', 'combo', 'skill'].includes(p.$kind) ? '1.4rem' : '1.1rem'};
  font-weight:900;text-shadow:0 2px 5px rgba(0,0,0,1),0 0 10px currentColor;
  animation:${floatUp} 1.35s ease-out forwards;pointer-events:none;z-index:500;white-space:nowrap;
`;
const OverlayWrap = styled.div<{ $win: boolean }>`
  position:absolute;inset:0;
  background:${p => p.$win
    ? 'radial-gradient(circle at center,rgba(0,50,10,.94),rgba(0,0,0,.97))'
    : 'radial-gradient(circle at center,rgba(80,0,0,.94),rgba(0,0,0,.97))'};
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:20px;z-index:1000;animation:${overlayIn} .7s ease-out;
`;
const OverlayTitle = styled.h1<{ $win: boolean }>`
  font-size:3.8rem;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:6px;
  color:${p => p.$win ? '#ffd700' : '#ff4444'};
  animation:${p => p.$win ? css`${victoryGlow} 1.5s infinite` : css`${defeatGlow} 1.5s infinite`};
`;
const OverlayBtn = styled.button<{ $primary?: boolean }>`
  padding:13px 38px;
  background:${p => p.$primary ? 'linear-gradient(to bottom,#ffd700,#b8860b)' : 'linear-gradient(to bottom,#444,#111)'};
  color:${p => p.$primary ? '#000' : '#ddd'};
  border:2px solid ${p => p.$primary ? '#ffd700' : '#555'};
  border-radius:6px;font-size:.9rem;font-weight:900;letter-spacing:2px;text-transform:uppercase;
  cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.6);transition:all .2s;font-family:inherit;
  &:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(0,0,0,.8),
    0 0 18px ${p => p.$primary ? 'rgba(255,215,0,.5)' : 'rgba(255,255,255,.2)'};}
`;

/* ══════════════════════════════════════════════════════════════
   PURE HELPERS (outside component — no closure issues)
══════════════════════════════════════════════════════════════ */
function findMatchGroups(gems: Gem[]): MatchGroup[] {
  const groups: MatchGroup[] = [];
  for (let row = 0; row < 8; row++) {
    let c = 0; while (c < 8) {
      const type = gems[row * 8 + c]?.type; if (!type) { c++; continue; }
      let len = 1; while (c + len < 8 && gems[row * 8 + c + len]?.type === type) len++;
      if (len >= 3) { const idx = Array.from({ length: len }, (_, k) => row * 8 + c + k); groups.push({ indices: idx, type, centerIdx: idx[Math.floor(len / 2)], length: len }); }
      c += len;
    }
  }
  for (let col = 0; col < 8; col++) {
    let r = 0; while (r < 8) {
      const type = gems[r * 8 + col]?.type; if (!type) { r++; continue; }
      let len = 1; while (r + len < 8 && gems[(r + len) * 8 + col]?.type === type) len++;
      if (len >= 3) { const idx = Array.from({ length: len }, (_, k) => (r + k) * 8 + col); groups.push({ indices: idx, type, centerIdx: idx[Math.floor(len / 2)], length: len }); }
      r += len;
    }
  }
  return groups;
}

function expandForSpecials(allIdx: number[], gems: Gem[], attackingRace: Race): number[] {
  const set = new Set(allIdx);
  for (const idx of allIdx) {
    const g = gems[idx]; if (!g) continue;
    const row = Math.floor(idx / 8), col = idx % 8;
    if (g.special === 'power') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr, nc = col + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) set.add(nr * 8 + nc);
        }
      }
    }
    if (g.special === 'lightning') {
      for (let i = 0; i < 64; i++) {
        if (gems[i] && gems[i].type === attackingRace) {
          set.add(i);
        }
      }
    }
  }
  return Array.from(set);
}

function findBestEnemySwap(gems: Gem[]): [number, number] | null {
  const candidates: { i: number; j: number; score: number }[] = [];
  for (let i = 0; i < 64; i++) {
    const neighbors: number[] = [];
    if (i % 8 < 7) neighbors.push(i + 1);
    if (i < 56) neighbors.push(i + 8);
    for (const j of neighbors) {
      const test = [...gems];[test[i], test[j]] = [test[j], test[i]];
      const groups = findMatchGroups(test); if (!groups.length) continue;
      let score = 0; for (const g of groups) score += g.length * g.length * AI_PREF[g.type];
      candidates.push({ i, j, score });
    }
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  const pool = candidates.slice(0, Math.min(3, candidates.length));
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return [pick.i, pick.j];
}

function makeInitialGems(): Gem[] {
  const gems: Gem[] = [];
  for (let i = 0; i < 64; i++) {
    const row = Math.floor(i / 8), col = i % 8;
    let pool = [...RACES], type: Race = pool[0];
    while (pool.length) {
      type = pool[Math.floor(Math.random() * pool.length)];
      const hm = col >= 2 && gems[i - 1]?.type === type && gems[i - 2]?.type === type;
      const vm = row >= 2 && gems[i - 8]?.type === type && gems[i - 16]?.type === type;
      if (!hm && !vm) break;
      pool = pool.filter(r => r !== type);
    }
    gems.push({ id: `g${i}-${Math.random()}`, type, special: 'none' });
  }
  return gems;
}

function spawnGem(): Gem {
  return { id: `g${Date.now()}-${Math.random()}`, type: RACES[Math.floor(Math.random() * RACES.length)], special: 'none', isFalling: true };
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
const Battlefield: React.FC<BattlefieldProps> = ({ race = 'valdari', onExit }) => {
  const { buildingLevels } = useGameStore();
  const [gems, setGems] = useState<Gem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>('playerTurn');
  const [enemies, setEnemies] = useState<Unit[]>([]);
  const [heroes, setHeroes] = useState<Unit[]>([]);
  const [floats, setFloats] = useState<FloatNum[]>([]);
  const [combo, setCombo] = useState(0);
  const [comboIsEnemy, setComboIsEnemy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [hovHero, setHovHero] = useState<number | null>(null);
  const [hovEnemy, setHovEnemy] = useState<number | null>(null);
  const [enemyHighlight, setEnemyHighlight] = useState<Set<number>>(new Set());
  // ← tracks which unit is mid-cast for the flash animation
  const [castingHero, setCastingHero] = useState<number | null>(null);
  const [castingEnemy, setCastingEnemy] = useState<number | null>(null);

  const busyRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── init ── */
  useEffect(() => {
    setGems(makeInitialGems());
    setEnemies(ENEMY_DEFS.map(d => ({
      name: d.name, img: d.img,
      hp: d.maxHp, maxHp: d.maxHp, mana: 0, maxMana: d.maxMana,
      attack: d.atk, defense: d.def,
      isDead: false, isAttacking: false, isHit: false, isSkillReady: false,
      skillName: d.skillName, skillDesc: d.skillDesc,
      poison: 0,
    })));

    // Load active heroes dynamically from selected formation units in barracks/altar
    const allUnits = getUpgradedUnits(buildingLevels);
    const loadedHeroes = HERO_DEFS.map((fallback, i) => {
      const slot = (savedFormations as any).principal.units[i];
      const fallbackSkill = HERO_SKILLS[i] || {
        skillName: 'Golpe Crítico',
        skillDesc: '3× daño al enemigo con menos HP',
        skillAction: 'single_heavy'
      };
      if (!slot) {
        // Empty slot starts as dead
        return {
          name: `Slot Vacío ${i + 1}`, img: '',
          hp: fallback.maxHp, maxHp: fallback.maxHp, mana: 0, maxMana: 100,
          attack: fallback.atk, defense: fallback.def,
          isDead: true, isAttacking: false, isHit: false, isSkillReady: false,
          skillName: fallbackSkill.skillName,
          skillDesc: fallbackSkill.skillDesc,
          skillAction: fallbackSkill.skillAction,
          poison: 0,
        };
      }
      const u = allUnits.find((u: any) => u.id === slot.id) as any;
      if (!u) {
        return {
          name: `Desconocido ${i + 1}`, img: '',
          hp: fallback.maxHp, maxHp: fallback.maxHp, mana: 0, maxMana: 100,
          attack: fallback.atk, defense: fallback.def,
          isDead: false, isAttacking: false, isHit: false, isSkillReady: false,
          skillName: fallbackSkill.skillName,
          skillDesc: fallbackSkill.skillDesc,
          skillAction: fallbackSkill.skillAction,
          poison: 0,
        };
      }
      return {
        name: u.name, img: u.image || '',
        hp: u.hp || fallback.maxHp, maxHp: u.hp || fallback.maxHp, mana: 0, maxMana: 100,
        attack: Math.round(u.attack) || fallback.atk, defense: u.armor || fallback.def,
        isDead: false, isAttacking: false, isHit: false, isSkillReady: false,
        skillName: u.skillName || fallbackSkill.skillName,
        skillDesc: u.skillDesc || fallbackSkill.skillDesc,
        skillAction: u.skillAction || fallbackSkill.skillAction,
        poison: 0,
        attackBonus: u.attackBonus,
        armorBonus: u.armorBonus,
      };
    });
    setHeroes(loadedHeroes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── position helpers ── */
  const ePos = useCallback((idx: number) => {
    const r = containerRef.current?.getBoundingClientRect();
    return r ? { x: r.width * (.12 + idx * .175), y: r.height * .11 } : { x: 250, y: 70 };
  }, []);
  const hPos = useCallback((idx: number) => {
    const r = containerRef.current?.getBoundingClientRect();
    return r ? { x: r.width * (.12 + idx * .175), y: r.height * .80 } : { x: 250, y: 560 };
  }, []);
  const cPos = useCallback(() => {
    const r = containerRef.current?.getBoundingClientRect();
    return r ? { x: r.width / 2, y: r.height * .44 } : { x: 250, y: 290 };
  }, []);

  const doShake = useCallback(() => { setShaking(true); setTimeout(() => setShaking(false), 530); }, []);

  const addFloat = useCallback((text: string, kind: FloatKind, x: number, y: number) => {
    const id = `f${Date.now()}-${Math.random()}`;

    // Determine targeted card lane based on initial x position
    const r = containerRef.current?.getBoundingClientRect();
    const width = r ? r.width : 500;
    const laneIdx = Math.round(((x / width) - 0.12) / 0.175);

    let adjustedX = x;
    if (laneIdx >= 0 && laneIdx <= 4) {
      if (laneIdx === 0) {
        adjustedX = x - 65; // Far left margin space
      } else if (laneIdx === 1) {
        adjustedX = x - 55; // Left margin space
      } else if (laneIdx === 3) {
        adjustedX = x + 55; // Right margin space
      } else if (laneIdx === 4) {
        adjustedX = x + 65; // Far right margin space
      } else {
        adjustedX = x - 45; // Center margin space (between lane 1 and 2)
      }
    }

    setFloats(p => {
      // Find how many floats are already near this target position
      const nearCount = p.filter(f => Math.abs(f.x - adjustedX) < 40 && Math.abs(f.y - y) < 45).length;

      // Stack vertically upward to prevent overlapping
      const adjustedY = y - nearCount * 26;

      // Slight horizontal jitter to alternate stacked elements
      const jitteredX = adjustedX + (nearCount % 2 === 0 ? 8 : -8) * Math.min(nearCount, 2);

      return [...p, { id, text, kind, x: jitteredX, y: adjustedY }];
    });

    setTimeout(() => setFloats(p => p.filter(f => f.id !== id)), 1450);
  }, []);

  /* ══════════════════════════════════════════════════════════
     CORE CASCADE
     side='player' → dmg→enemies,  heal→heroes,  mana→heroes
                     rage mana builds on HIT enemies
     side='enemy'  → dmg→heroes,   heal→enemies (sylvaran!),
                     mana gain for all alive enemies
  ══════════════════════════════════════════════════════════ */
  const runCascade = useCallback(async (
    G0: Gem[], E0: Unit[], H0: Unit[], side: Side, initialExplosionIdx?: number
  ): Promise<CascadeResult> => {
    let G = G0.map(g => ({ ...g }));
    let E = E0.map(u => ({ ...u }));
    let H = H0.map(u => ({ ...u }));
    let comboLvl = 0;
    let isInitialExplosion = initialExplosionIdx !== undefined;

    const findOutsideInTarget = (units: Unit[]): number => {
      const tier1 = [0, 4].filter(idx => units[idx] && !units[idx].isDead);
      if (tier1.length > 0) return tier1[Math.floor(Math.random() * tier1.length)];
      const tier2 = [1, 3].filter(idx => units[idx] && !units[idx].isDead);
      if (tier2.length > 0) return tier2[Math.floor(Math.random() * tier2.length)];
      if (units[2] && !units[2].isDead) return 2;
      return -1;
    };

    const getLaneAttacker = (units: Unit[]): Unit | null => {
      // Find all alive units
      const aliveUnits = units.filter(u => u && !u.isDead);
      if (aliveUnits.length === 0) return null;
      // Randomly select one alive unit to attack
      const randIdx = Math.floor(Math.random() * aliveUnits.length);
      return aliveUnits[randIdx];
    };

    while (true) {
      let groups: MatchGroup[] = [];
      if (isInitialExplosion && initialExplosionIdx !== undefined) {
        const g = G[initialExplosionIdx];
        if (g) {
          groups = [{
            indices: [initialExplosionIdx],
            type: g.type,
            centerIdx: initialExplosionIdx,
            length: 1
          }];
        }
        isInitialExplosion = false;
      } else {
        groups = findMatchGroups(G);
      }
      
      if (!groups.length) break;

      let totalAtk = 0, totalValdariDmg = 0, totalHeal = 0, totalMana = 0, totalPoison = 0, totalShield = 0;
      const matchedSet = new Set<number>();
      const originalMatchedIndices = new Set<number>();
      const specials: { idx: number; special: 'power' | 'lightning' }[] = [];

      for (const g of groups) {
        const fx = GEM_FX[g.type], n = g.length;
        const multSize = n >= 5 ? 2.2 : n >= 4 ? 1.5 : 1;
        totalAtk += fx.dmg * n * multSize;
        totalValdariDmg += fx.valdariDmg * n * multSize;
        totalHeal += fx.heal * n;
        totalMana += fx.manaGain * n * (n >= 4 ? 1.6 : 1);
        totalPoison += fx.poison * n;
        totalShield += fx.shield * n;
        if (n === 4) specials.push({ idx: g.centerIdx, special: 'power' });
        if (n >= 5) specials.push({ idx: g.centerIdx, special: 'lightning' });

        g.indices.forEach(i => originalMatchedIndices.add(i));
        expandForSpecials(g.indices, G, side === 'player' ? race : 'gorkar').forEach(i => matchedSet.add(i));
      }

      // Add extra damage, heal, and mana from gems exploded by special gems
      for (const i of matchedSet) {
        if (!originalMatchedIndices.has(i)) {
          const extraGem = G[i];
          if (extraGem) {
            const fx = GEM_FX[extraGem.type];
            totalAtk += fx.dmg;
            totalValdariDmg += fx.valdariDmg;
            totalHeal += fx.heal;
            totalMana += fx.manaGain;
            totalPoison += fx.poison;
            totalShield += fx.shield;
          }
        }
      }
      const mult = 1 + comboLvl * .32;
      totalAtk = Math.round(totalAtk * mult);
      totalValdariDmg = Math.round(totalValdariDmg * mult);
      totalHeal = Math.round(totalHeal * mult);
      totalMana = Math.min(40, Math.round(totalMana));
      totalPoison = Math.round(totalPoison * mult);
      totalShield = Math.round(totalShield * mult);

      G = G.map((g, i) => matchedSet.has(i) ? { ...g, isMatched: true } : g);
      setGems([...G]);
      await SLEEP(380);

      if (side === 'player') {
        /* ── damage → outside-to-inside target ── */
        let appliedDmg = totalAtk;
        const ti = findOutsideInTarget(E);
        if (ti >= 0) {
          // Add player troop base attack starting from the targeted side if the lane hero is dead
          const laneAttacker = getLaneAttacker(H);
          const extraAtk = laneAttacker ? laneAttacker.attack : 0;
          appliedDmg = totalAtk + extraAtk;

          const actual = Math.max(1, appliedDmg - (E[ti].defense + (E[ti].shield || 0)));
          E[ti] = { ...E[ti], hp: Math.max(0, E[ti].hp - actual), isDead: E[ti].hp - actual <= 0, isHit: true };
          const isCrit = mult >= 1.62 || actual > 80;
          addFloat(isCrit ? `💥 ${actual}` : `${actual}`, isCrit ? 'crit' : 'dmg', ePos(ti).x, ePos(ti).y);
          if (extraAtk > 0 && laneAttacker) {
            addFloat(`⚔️ +${extraAtk} ${laneAttacker.name}`, 'combo', ePos(ti).x, ePos(ti).y - 25);
          }
          if (isCrit || actual > 80) doShake();
        }
        /* ← rage mana: enemies build fury when attacked */
        const rage = Math.min(18, Math.floor(appliedDmg / 7));
        if (rage > 0) {
          E = E.map((e, i) => {
            if (e.isDead) return e;
            const newMana = Math.min(e.maxMana, e.mana + rage);
            const wasReady = e.isSkillReady;
            const isReady = newMana >= e.maxMana;
            if (isReady && !wasReady)
              addFloat(`⚡ ${e.skillName}!`, 'skill', ePos(i).x, ePos(i).y - 26);
            return { ...e, mana: newMana, isSkillReady: isReady };
          });
        }
        setEnemies([...E]);
        setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 430);
        /* ── valdari magic damage → all alive enemies ── */
        if (totalValdariDmg > 0) {
          E = E.map((e, i) => {
            if (e.isDead) return e;
            const actual = Math.max(1, totalValdariDmg - (e.defense + (e.shield || 0)));
            const isCrit = mult >= 1.62 || actual > 80;
            addFloat(isCrit ? `⚡ ${actual}` : `${actual}`, isCrit ? 'crit' : 'dmg', ePos(i).x, ePos(i).y);
            return { ...e, hp: Math.max(0, e.hp - actual), isDead: e.hp - actual <= 0, isHit: true };
          });
          setEnemies([...E]);
          if (mult >= 1.62 || totalValdariDmg > 80) doShake();
          setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 430);
        }
        /* ── poison → all alive enemies ── */
        if (totalPoison > 0) {
          E = E.map((e, i) => {
            if (e.isDead) return e;
            addFloat(`🤢 Veneno +${totalPoison}`, 'skill', ePos(i).x, ePos(i).y - 28);
            return { ...e, poison: (e.poison || 0) + totalPoison };
          });
          setEnemies([...E]);
        }
        /* ── shield/defense → all alive heroes ── */
        if (totalShield > 0) {
          H = H.map((h, i) => {
            if (h.isDead) return h;
            addFloat(`🛡️ Escudo +${totalShield}`, 'combo', hPos(i).x, hPos(i).y - 28);
            return { ...h, shield: (h.shield || 0) + totalShield };
          });
        }
        /* ── heal → all alive heroes ── */
        if (totalHeal > 0) {
          H = H.map((h, i) => {
            if (h.isDead) return h;
            addFloat(`+${totalHeal}`, 'heal', hPos(i).x, hPos(i).y);
            return { ...h, hp: Math.min(h.maxHp, h.hp + totalHeal) };
          });
        }
        /* ── mana → heroes ── */
        if (totalMana > 0) {
          H = H.map((h, i) => {
            if (h.isDead) return h;
            const newMana = Math.min(h.maxMana, h.mana + totalMana);
            const skillReady = newMana >= h.maxMana;
            if (skillReady && !h.isSkillReady)
              addFloat('✨ SKILL!', 'skill', hPos(i).x, hPos(i).y - 24);
            return { ...h, mana: newMana, isSkillReady: skillReady };
          });
        }
        setHeroes([...H]);

      } else {
        /* ── ENEMY SIDE ── */
        /* damage → outside-to-inside target */
        const ti = findOutsideInTarget(H);
        if (ti >= 0) {
          // Add enemy troop base attack starting from the targeted side if the lane unit is dead
          const laneAttacker = getLaneAttacker(E);
          const extraAtk = laneAttacker ? laneAttacker.attack : 0;
          const finalDmg = totalAtk + extraAtk;

          const actual = Math.max(1, finalDmg - (H[ti].defense + (H[ti].shield || 0)));
          H[ti] = { ...H[ti], hp: Math.max(0, H[ti].hp - actual), isDead: H[ti].hp - actual <= 0, isHit: true };
          const isCrit = mult >= 1.62 || actual > 80;
          addFloat(isCrit ? `💥 ${actual}` : `${actual}`, isCrit ? 'crit' : 'dmg', hPos(ti).x, hPos(ti).y);
          if (extraAtk > 0 && laneAttacker) {
            addFloat(`⚔️ +${extraAtk} ${laneAttacker.name}`, 'combo', hPos(ti).x, hPos(ti).y - 25);
          }
          if (isCrit || actual > 80) doShake();
          setHeroes([...H]);
          setTimeout(() => setHeroes(prev => prev.map((u, i) => i === ti ? { ...u, isHit: false } : u)), 430);
        }
        /* valdari damage → all alive heroes ── */
        if (totalValdariDmg > 0) {
          H = H.map((h, i) => {
            if (h.isDead) return h;
            const actual = Math.max(1, totalValdariDmg - (h.defense + (h.shield || 0)));
            const isCrit = mult >= 1.62 || actual > 80;
            addFloat(isCrit ? `⚡ ${actual}` : `${actual}`, isCrit ? 'crit' : 'dmg', hPos(i).x, hPos(i).y);
            return { ...h, hp: Math.max(0, h.hp - actual), isDead: h.hp - actual <= 0, isHit: true };
          });
          setHeroes([...H]);
          if (mult >= 1.62 || totalValdariDmg > 80) doShake();
          setTimeout(() => setHeroes(prev => prev.map(u => ({ ...u, isHit: false }))), 430);
        }
        /* poison → all alive heroes ── */
        if (totalPoison > 0) {
          H = H.map((h, i) => {
            if (h.isDead) return h;
            addFloat(`🤢 Veneno +${totalPoison}`, 'skill', hPos(i).x, hPos(i).y - 28);
            return { ...h, poison: (h.poison || 0) + totalPoison };
          });
          setHeroes([...H]);
        }
        /* shield/defense → all alive enemies ── */
        if (totalShield > 0) {
          E = E.map((e, i) => {
            if (e.isDead) return e;
            addFloat(`🛡️ Escudo +${totalShield}`, 'combo', ePos(i).x, ePos(i).y - 28);
            return { ...e, shield: (e.shield || 0) + totalShield };
          });
        }
        /* sylvaran gems → heal all alive ENEMIES */
        if (totalHeal > 0) {
          E = E.map((e, i) => {
            if (e.isDead) return e;
            addFloat(`+${totalHeal}`, 'heal', ePos(i).x, ePos(i).y);
            return { ...e, hp: Math.min(e.maxHp, e.hp + totalHeal) };
          });
        }
        /* ← enemies gain mana from their own matches */
        if (totalMana > 0) {
          const share = Math.floor(totalMana * .65);
          E = E.map((e, i) => {
            if (e.isDead) return e;
            const newMana = Math.min(e.maxMana, e.mana + share);
            const wasReady = e.isSkillReady;
            const isReady = newMana >= e.maxMana;
            if (isReady && !wasReady)
              addFloat(`⚡ ${e.skillName}!`, 'skill', ePos(i).x, ePos(i).y - 26);
            return { ...e, mana: newMana, isSkillReady: isReady };
          });
        }
        setEnemies([...E]);
        setHeroes([...H]);
      }

      /* combo banner */
      comboLvl++;
      setCombo(comboLvl); setComboIsEnemy(side === 'enemy');
      if (comboLvl >= 2) {
        const cp = cPos();
        addFloat(`${side === 'enemy' ? '☠️' : '🔥'} COMBO ×${comboLvl}`, 'combo', cp.x, cp.y);
      }

      if (E.every(e => e.isDead)) { setPhase('victory'); return { gems: G, enemies: E, heroes: H, ended: true }; }
      if (H.every(h => h.isDead)) { setPhase('defeat'); return { gems: G, enemies: E, heroes: H, ended: true }; }

      /* drop gems */
      const NG = [...G];
      for (let col = 0; col < 8; col++) {
        let empty = 0;
        for (let row = 7; row >= 0; row--) {
          const idx = row * 8 + col;
          if (NG[idx].isMatched) { empty++; }
          else if (empty > 0) { NG[(row + empty) * 8 + col] = { ...NG[idx], isFalling: true }; NG[idx] = { id: '', type: 'valdari', special: 'none', isMatched: true }; }
        }
        for (let row = 0; row < empty; row++)NG[row * 8 + col] = spawnGem();
      }
      for (const sc of specials) NG[sc.idx] = { ...NG[sc.idx], special: sc.special };

      G = NG.map(g => ({ ...g, isMatched: false }));
      setGems([...G]); await SLEEP(430);
      G = G.map(g => ({ ...g, isFalling: false }));
      setGems([...G]); await SLEEP(90);
    }

    setCombo(0);
    return { gems: G, enemies: E, heroes: H, ended: false };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addFloat, doShake, ePos, hPos, cPos]);

  /* ══════════════════════════════════════════════════════════
     FIRE ENEMY SKILLS
     Called at the start of the enemy phase (before board move).
     Each enemy with full mana casts their skill in sequence.
  ══════════════════════════════════════════════════════════ */
  const fireEnemySkills = useCallback(async (
    E: Unit[], H: Unit[]
  ): Promise<SkillResult> => {
    for (let i = 0; i < E.length; i++) {
      if (E[i].isDead || !E[i].isSkillReady) continue;

      // ── cast flash + attack animation ──
      setCastingEnemy(i);
      E[i] = { ...E[i], isAttacking: true };
      setEnemies([...E]);
      addFloat(`☠️ ${E[i].skillName}!`, 'skill', ePos(i).x, ePos(i).y - 32);
      await SLEEP(550);

      switch (i) {
        case 0: { /* Berserker: 2 random heroes × 1.5× atk */
          const targets = H.map((_, hi) => hi).filter(hi => !H[hi].isDead)
            .sort(() => Math.random() - .5).slice(0, 2);
          for (const ti of targets) {
            const dmg = Math.max(1, Math.round(E[i].attack * 1.5) - H[ti].defense);
            H[ti] = { ...H[ti], hp: Math.max(0, H[ti].hp - dmg), isDead: H[ti].hp - dmg <= 0, isHit: true };
            addFloat(`💥 ${dmg}`, 'crit', hPos(ti).x, hPos(ti).y);
          }
          doShake();
          setHeroes([...H]);
          setTimeout(() => setHeroes(prev => prev.map(u => ({ ...u, isHit: false }))), 430);
          break;
        }
        case 1: { /* Machacador: 90 dmg to hero with most HP */
          const ti = H.reduce((mi, h, hi, arr) =>
            !h.isDead && h.hp > (arr[mi]?.hp ?? -1) ? hi : mi, H.findIndex(h => !h.isDead));
          if (ti >= 0) {
            const dmg = Math.max(1, 90 - H[ti].defense);
            H[ti] = { ...H[ti], hp: Math.max(0, H[ti].hp - dmg), isDead: H[ti].hp - dmg <= 0, isHit: true };
            addFloat(`💥 ${dmg}`, 'crit', hPos(ti).x, hPos(ti).y);
            doShake();
            setHeroes([...H]);
            setTimeout(() => setHeroes(prev => prev.map((u, j) => j === ti ? { ...u, isHit: false } : u)), 430);
          }
          break;
        }
        case 2: { /* JEFE: 40 dmg to ALL heroes */
          H = H.map((h, hi) => {
            if (h.isDead) return h;
            const dmg = Math.max(1, 40 - h.defense);
            addFloat(`${dmg}`, 'dmg', hPos(hi).x, hPos(hi).y);
            const hp = Math.max(0, h.hp - dmg);
            return { ...h, hp, isDead: hp <= 0, isHit: true };
          });
          doShake();
          setHeroes([...H]);
          setTimeout(() => setHeroes(prev => prev.map(u => ({ ...u, isHit: false }))), 430);
          break;
        }
        case 3: { /* Chamán: heal all alive enemies +60 HP */
          E = E.map((e, ei) => {
            if (e.isDead) return e;
            addFloat('+60', 'heal', ePos(ei).x, ePos(ei).y);
            return { ...e, hp: Math.min(e.maxHp, e.hp + 60) };
          });
          setEnemies([...E]);
          break;
        }
        case 4: { /* Raider: 3 rapid hits of 25 to random heroes */
          for (let hit = 0; hit < 3; hit++) {
            const alive = H.map((_, hi) => hi).filter(hi => !H[hi].isDead);
            if (!alive.length) break;
            const ti = alive[Math.floor(Math.random() * alive.length)];
            const dmg = Math.max(1, 25 - H[ti].defense);
            H[ti] = { ...H[ti], hp: Math.max(0, H[ti].hp - dmg), isDead: H[ti].hp - dmg <= 0, isHit: true };
            addFloat(`${dmg}`, 'dmg', hPos(ti).x, hPos(ti).y);
            setHeroes([...H]);
            await SLEEP(210);
            H[ti] = { ...H[ti], isHit: false };
            setHeroes([...H]);
            await SLEEP(110);
          }
          break;
        }
      }

      /* reset skill */
      E[i] = { ...E[i], mana: 0, isSkillReady: false, isAttacking: false };
      setCastingEnemy(null);
      setEnemies([...E]);
      setHeroes([...H]);
      await SLEEP(320);

      if (H.every(h => h.isDead)) { setPhase('defeat'); return { E, H, ended: true }; }
    }
    return { E, H, ended: false };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addFloat, doShake, ePos, hPos]);

  /* ══════════════════════════════════════════════════════════
     FULL TURN FLOW
  ══════════════════════════════════════════════════════════ */
  const runFullTurn = useCallback(async (G: Gem[], E: Unit[], H: Unit[], initialExplosionIdx?: number) => {
    setPhase('processing');
    const pr = await runCascade(G, E, H, 'player', initialExplosionIdx);
    if (pr.ended) { busyRef.current = false; return; }

    let currentEnemies = pr.enemies;
    let currentHeroes = pr.heroes;

    /* Tick enemy poison */
    let tickPoisonEnemies = false;
    let nextEnemies = currentEnemies.map((e, ei) => {
      let nextE = { ...e, shield: 0 };
      if (!nextE.isDead && nextE.poison && nextE.poison > 0) {
        tickPoisonEnemies = true;
        const dmg = nextE.poison;
        const newHp = Math.max(0, nextE.hp - dmg);
        addFloat(`🤢 ${dmg}`, 'dmg', ePos(ei).x, ePos(ei).y);
        return { ...nextE, hp: newHp, isDead: newHp <= 0, poison: 0, isHit: true };
      }
      return nextE;
    });
    if (tickPoisonEnemies) {
      setEnemies([...nextEnemies]);
      doShake();
      await SLEEP(430);
      nextEnemies = nextEnemies.map(u => ({ ...u, isHit: false }));
      setEnemies([...nextEnemies]);
      await SLEEP(200);
      currentEnemies = nextEnemies;
      if (currentEnemies.every(e => e.isDead)) { setPhase('victory'); busyRef.current = false; return; }
    }

    /* enemy phase start */
    setPhase('enemyThinking');
    await SLEEP(550);

    /* 1 — fire enemy skills BEFORE board move */
    const sr = await fireEnemySkills(currentEnemies, currentHeroes);
    if (sr.ended) { busyRef.current = false; return; }

    let nextHeroes = sr.H;
    let nextEnemiesAfterSkills = sr.E;

    /* 2 — board move */
    const swap = findBestEnemySwap(pr.gems);
    if (swap) {
      const [ei, ej] = swap;
      setEnemyHighlight(new Set([ei, ej]));
      await SLEEP(900);
      setEnemyHighlight(new Set());
      await SLEEP(80);

      const swapped = pr.gems.map(g => ({ ...g }));
      [swapped[ei], swapped[ej]] = [swapped[ej], swapped[ei]];
      setGems([...swapped]);
      await SLEEP(280);

      setPhase('enemyTurn');
      const er = await runCascade(swapped, nextEnemiesAfterSkills, nextHeroes, 'enemy');
      if (er.ended) { busyRef.current = false; return; }
      nextHeroes = er.heroes;
      nextEnemiesAfterSkills = er.enemies;
    } else {
      const cp = cPos();
      addFloat('☠️ SIN MOVIMIENTO', 'combo', cp.x, cp.y);
      await SLEEP(700);
    }

    /* Tick hero poison */
    let tickPoisonHeroes = false;
    let finalHeroes = nextHeroes.map((h, hi) => {
      let nextH = { ...h, shield: 0 };
      if (!nextH.isDead && nextH.poison && nextH.poison > 0) {
        tickPoisonHeroes = true;
        const dmg = nextH.poison;
        const newHp = Math.max(0, nextH.hp - dmg);
        addFloat(`🤢 ${dmg}`, 'dmg', hPos(hi).x, hPos(hi).y);
        return { ...nextH, hp: newHp, isDead: newHp <= 0, poison: 0, isHit: true };
      }
      return nextH;
    });
    if (tickPoisonHeroes) {
      setHeroes([...finalHeroes]);
      doShake();
      await SLEEP(430);
      finalHeroes = finalHeroes.map(u => ({ ...u, isHit: false }));
      setHeroes([...finalHeroes]);
      await SLEEP(200);
      if (finalHeroes.every(h => h.isDead)) { setPhase('defeat'); busyRef.current = false; return; }
    }

    setPhase('playerTurn');
    busyRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runCascade, fireEnemySkills, addFloat, cPos, ePos, hPos, doShake]);

  /* ── gem click ── */
  const onGemClick = useCallback(async (index: number) => {
    if (busyRef.current || phase !== 'playerTurn') return;
    const clickedGem = gems[index];
    if (clickedGem && (clickedGem.special === 'power' || clickedGem.special === 'lightning')) {
      setSelected(null);
      busyRef.current = true;
      await runFullTurn(gems, enemies, heroes, index);
      return;
    }
    if (selected === null) { setSelected(index); return; }
    const r1 = Math.floor(index / 8), c1 = index % 8;
    const r2 = Math.floor(selected / 8), c2 = selected % 8;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) { setSelected(index); return; }
    setSelected(null);
    busyRef.current = true;
    const swapped = [...gems];
    [swapped[index], swapped[selected]] = [swapped[selected], swapped[index]];
    setGems(swapped);
    await SLEEP(220);
    if (!findMatchGroups(swapped).length) {
      setGems([...gems]); await SLEEP(190); busyRef.current = false; return;
    }
    await runFullTurn(swapped, enemies, heroes);
  }, [phase, selected, gems, enemies, heroes, runFullTurn]);

  /* ══════════════════════════════════════════════════════════
     HERO SKILL — does NOT end the player's turn!
     Player fires skill → effects apply → back to playerTurn
     so they can still make a board move.
  ══════════════════════════════════════════════════════════ */
  const onHeroClick = useCallback(async (hi: number) => {
    if (busyRef.current || phase !== 'playerTurn') return;
    const hero = heroes[hi];
    if (!hero || hero.isDead || !hero.isSkillReady) return;
    busyRef.current = true;
    setPhase('processing');

    let E = enemies.map(u => ({ ...u }));
    let H = heroes.map(u => ({ ...u }));

    /* cast animation */
    setCastingHero(hi);
    H[hi] = { ...H[hi], mana: 0, isSkillReady: false, isAttacking: true };
    setHeroes([...H]);
    addFloat(`✨ ${hero.skillName}!`, 'skill', hPos(hi).x, hPos(hi).y - 32);
    await SLEEP(320);

    const { E: nextE, H: nextH } = executeHeroSkill({
      action: hero.skillAction || 'single_heavy',
      hero,
      E,
      H,
      addFloat,
      doShake,
      ePos,
      hPos,
      setEnemies,
    });
    E = nextE;
    H = nextH;

    H[hi] = { ...H[hi], isAttacking: false };
    setCastingHero(null);
    setEnemies([...E]);
    setHeroes([...H]);

    if (E.every(e => e.isDead)) { setPhase('victory'); busyRef.current = false; return; }
    if (H.every(h => h.isDead)) { setPhase('defeat'); busyRef.current = false; return; }

    // ← KEY: skill is a FREE ACTION — player keeps their turn!
    setPhase('playerTurn');
    busyRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, heroes, enemies, addFloat, doShake, ePos, hPos]);

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  const isEnemyActive = phase === 'enemyTurn' || phase === 'enemyThinking';

  return (
    <>
      <GlobalStyle />
      <BattlefieldWrap ref={containerRef} $race={race} $shaking={shaking}>
        <ExitBtn onClick={onExit}>SALIR</ExitBtn>

        {/* HUD */}
        <HUDBar>
          {phase === 'enemyThinking'
            ? <ThinkingTag>☠️ ENEMIGO PIENSA…</ThinkingTag>
            : <TurnTag $enemy={isEnemyActive}>
              {phase === 'enemyTurn' ? '☠️ TURNO ENEMIGO' :
                phase === 'processing' ? '⚙️ PROCESANDO…' :
                  '🎮 TU TURNO — Mueve o usa skill'}
            </TurnTag>
          }
          {combo >= 2 && (
            <ComboTag $enemy={comboIsEnemy}>
              {comboIsEnemy ? '☠️' : '🔥'} COMBO ×{combo}!
            </ComboTag>
          )}
        </HUDBar>

        {/* Floating damage / heal / skill numbers */}
        {floats.map(f => (
          <FloatEl key={f.id} $kind={f.kind} $x={f.x} $y={f.y}>{f.text}</FloatEl>
        ))}

        <BattleContent>

          {/* ── ENEMIES (top) ── */}
          <UnitRow $side="top">
            {enemies.map((unit, i) => (
              <UnitCard key={`e${i}`}
                $race="gorkar" $isHero={i === 2} $isDead={unit.isDead}
                $attacking={unit.isAttacking} $hit={unit.isHit}
                $skillReady={unit.isSkillReady}
                $isEnemyUnit={true}
                $casting={castingEnemy === i}
                onMouseEnter={() => setHovEnemy(i)}
                onMouseLeave={() => setHovEnemy(null)}
              >
                {i === 2 && <BossLabel>BOSS</BossLabel>}
                {((unit.poison !== undefined && unit.poison > 0) || (unit.shield !== undefined && unit.shield > 0)) && !unit.isDead && (
                  <BadgesRow>
                    {unit.poison !== undefined && unit.poison > 0 && (
                      <PoisonBadge>🤢 {unit.poison}</PoisonBadge>
                    )}
                    {unit.shield !== undefined && unit.shield > 0 && (
                      <ShieldBadge>🛡️ {unit.shield}</ShieldBadge>
                    )}
                  </BadgesRow>
                )}
                {/* ← red "HABILIDAD" badge when enemy skill is ready */}
                {unit.isSkillReady && !unit.isDead && <EnemySkillBadge>☠️ HABILIDAD</EnemySkillBadge>}
                {/* ← red tooltip on hover */}
                {hovEnemy === i && !unit.isDead && (
                  <EnemyTip>
                    <div style={{ fontWeight: 900, fontSize: '.72rem', color: '#ff4444', marginBottom: '3px', textTransform: 'uppercase' }}>
                      {unit.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '.58rem', color: '#ddd', marginBottom: '6px' }}>
                      <span>❤️ HP: <strong style={{ color: '#fff' }}>{unit.hp}/{unit.maxHp}</strong></span>
                      <span>⚡ MANA: <strong style={{ color: '#fff' }}>{unit.mana}/{unit.maxMana}</strong></span>
                      <span>⚔️ ATK: <strong style={{ color: '#fff' }}>{unit.attack}</strong></span>
                      <span>🛡️ DEF: <strong style={{ color: '#fff' }}>{unit.defense}{unit.shield ? ` (+${unit.shield})` : ''}</strong></span>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '4px', whiteSpace: 'normal', color: '#fdd' }}>
                      <strong style={{ color: '#ffaa00' }}>Skill:</strong> {unit.skillDesc}
                    </div>
                  </EnemyTip>
                )}
                <HPBar $pct={(unit.hp / unit.maxHp) * 100} $clr="#ff3333" $pos="top" />
                <UnitImgWrap><img src={unit.img} alt={unit.name} /></UnitImgWrap>
                {/* purple mana bar — now functional! */}
                <HPBar $pct={(unit.mana / unit.maxMana) * 100} $clr="#aa00ff" $pos="bot" />
                {unit.isDead && <DeadMask>💀</DeadMask>}
              </UnitCard>
            ))}
          </UnitRow>

          {/* ── BOARD (center) ── */}
          <BoardWrap>
            <BoardFrame>
              <GemGrid>
                {gems.map((gem, idx) => (
                  <GemEl
                    key={gem.id || `k${idx}`}
                    $race={gem.type} $special={gem.special}
                    $sel={selected === idx}
                    $matched={!!gem.isMatched}
                    $falling={!!gem.isFalling}
                    $enemyTarget={enemyHighlight.has(idx)}
                    onClick={() => onGemClick(idx)}
                  />
                ))}
              </GemGrid>
            </BoardFrame>
          </BoardWrap>

          {/* ── HEROES (bottom) ── */}
          <UnitRow $side="bottom">
            {heroes.map((unit, i) => (
              <UnitCard key={`h${i}`}
                $race={race} $isHero={i === 2} $isDead={unit.isDead}
                $attacking={unit.isAttacking} $hit={unit.isHit}
                $skillReady={unit.isSkillReady}
                $isEnemyUnit={false}
                $casting={castingHero === i}
                onClick={() => onHeroClick(i)}
                onMouseEnter={() => setHovHero(i)}
                onMouseLeave={() => setHovHero(null)}
              >
                {((unit.poison !== undefined && unit.poison > 0) || (unit.shield !== undefined && unit.shield > 0)) && !unit.isDead && (
                  <BadgesRow>
                    {unit.poison !== undefined && unit.poison > 0 && (
                      <PoisonBadge>🤢 {unit.poison}</PoisonBadge>
                    )}
                    {unit.shield !== undefined && unit.shield > 0 && (
                      <ShieldBadge>🛡️ {unit.shield}</ShieldBadge>
                    )}
                  </BadgesRow>
                )}
                {unit.isSkillReady && !unit.isDead && <HeroSkillBadge>✨ SKILL</HeroSkillBadge>}
                {hovHero === i && !unit.isDead && (
                  <HeroTip>
                    <div style={{ fontWeight: 900, fontSize: '.72rem', color: '#ffd700', marginBottom: '3px', textTransform: 'uppercase' }}>
                      {unit.name}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '.58rem', color: '#ddd', marginBottom: '6px' }}>
                      <span>❤️ HP: <strong style={{ color: '#fff' }}>{unit.hp}/{unit.maxHp}</strong></span>
                      <span>⚡ MANA: <strong style={{ color: '#fff' }}>{unit.mana}/{unit.maxMana}</strong></span>
                      <span>⚔️ ATK: <strong style={{ color: '#fff' }}>{unit.attack}</strong>{unit.attackBonus ? <span style={{color:'#ffd700',marginLeft:'3px'}}>(+{unit.attackBonus})</span> : null}</span>
                      <span>🛡️ DEF: <strong style={{ color: '#fff' }}>{unit.defense}{unit.shield ? ` (+${unit.shield})` : ''}</strong>{unit.armorBonus ? <span style={{color:'#ffd700',marginLeft:'3px'}}>(+{unit.armorBonus})</span> : null}</span>
                    </div>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '4px', whiteSpace: 'normal', color: '#dfd' }}>
                      <strong style={{ color: '#00ffcc' }}>{unit.skillName || 'Skill'}:</strong> {unit.skillDesc}
                    </div>
                  </HeroTip>
                )}
                <HPBar $pct={(unit.hp / unit.maxHp) * 100} $clr="#33ff66" $pos="top" />
                {unit.img
                  ? <UnitImgWrap><img src={unit.img} alt={unit.name} /></UnitImgWrap>
                  : <div style={{
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', opacity: .2, color: '#fff',
                    fontSize: '.7rem', fontFamily: 'sans-serif'
                  }}>Vacío</div>
                }
                <HPBar $pct={(unit.mana / unit.maxMana) * 100} $clr="#3399ff" $pos="bot" />
                {unit.isDead && <DeadMask>💀</DeadMask>}
              </UnitCard>
            ))}
          </UnitRow>

        </BattleContent>

        {/* GAME OVER */}
        {(phase === 'victory' || phase === 'defeat') && (
          <OverlayWrap $win={phase === 'victory'}>
            <OverlayTitle $win={phase === 'victory'}>
              {phase === 'victory' ? '¡VICTORIA!' : '¡DERROTA!'}
            </OverlayTitle>
            <p style={{
              color: '#777', fontSize: '.88rem', letterSpacing: '2px', margin: 0,
              fontFamily: 'sans-serif', textTransform: 'uppercase'
            }}>
              {phase === 'victory' ? 'Los enemigos han sido derrotados' : 'Tus héroes han caído en batalla'}
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {phase === 'victory' && (
                <OverlayBtn $primary onClick={() => {/* TODO: next level */ }}>Siguiente Nivel</OverlayBtn>
              )}
              <OverlayBtn onClick={onExit}>Salir</OverlayBtn>
            </div>
          </OverlayWrap>
        )}

      </BattlefieldWrap>
    </>
  );
};

export default Battlefield;