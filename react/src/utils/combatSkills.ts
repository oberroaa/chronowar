import React from 'react';
import type { Unit } from '../pages/Battlefield';

interface SkillExecutionParams {
  action: string;
  hero: Unit;
  E: Unit[];
  H: Unit[];
  addFloat: (text: string, kind: 'dmg' | 'heal' | 'crit' | 'combo' | 'skill', x: number, y: number) => void;
  doShake: () => void;
  ePos: (idx: number) => { x: number; y: number };
  hPos: (idx: number) => { x: number; y: number };
  setEnemies: React.Dispatch<React.SetStateAction<Unit[]>>;
}

/**
 * Ejecuta los efectos lógicos y visuales de la habilidad de un héroe.
 * Devuelve el estado actualizado de héroes y enemigos.
 */
export const executeHeroSkill = ({
  action,
  hero,
  E,
  H,
  addFloat,
  doShake,
  ePos,
  hPos,
  setEnemies,
}: SkillExecutionParams): { E: Unit[]; H: Unit[] } => {
  const updatedEnemies = E.map(u => ({ ...u }));
  let updatedHeroes = H.map(u => ({ ...u }));

  switch (action) {
    // Habilidad de daño ligero a objetivo único: elige un enemigo vivo al azar.
    case 'single_light': { /* 40 dmg a un enemigo aleatorio */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const target = alive[Math.floor(Math.random() * alive.length)];
        const actual = Math.max(1, 40 - updatedEnemies[target].defense);
        updatedEnemies[target] = {
          ...updatedEnemies[target],
          hp: Math.max(0, updatedEnemies[target].hp - actual),
          isDead: updatedEnemies[target].hp - actual <= 0,
          isHit: true,
        };
        addFloat(`💥 ${actual}`, 'dmg', ePos(target).x, ePos(target).y);
        doShake();
        setTimeout(
          () => setEnemies(prev => prev.map((u, i) => (i === target ? { ...u, isHit: false } : u))),
          430
        );
      }
      break;
    }

    case 'heal_all_light': { /* Cura 60 HP a todos los aliados */
      // Habilidad de curación que restaura una cantidad moderada de HP a cada héroe vivo.
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead) return h;
        addFloat('+60', 'heal', hPos(i).x, hPos(i).y);
        return { ...h, hp: Math.min(h.maxHp, h.hp + 60) };
      });
      break;
    }

    case 'heal_all_mid': { /* Cura 80 HP a todos los aliados */
      // Curación de área más fuerte para todos los aliados vivos.
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead) return h;
        addFloat('+80', 'heal', hPos(i).x, hPos(i).y);
        return { ...h, hp: Math.min(h.maxHp, h.hp + 80) };
      });
      break;
    }

    case 'single_heavy': { /* Golpe Critico: 3x dmg al enemigo con menos HP */
      // Habilidad de daño alto a un solo objetivo: golpea al enemigo con menos HP.
      const wi = updatedEnemies.reduce(
        (mi, e, i, arr) => (!e.isDead && e.hp < (arr[mi]?.hp ?? Infinity) ? i : mi),
        updatedEnemies.findIndex(e => !e.isDead)
      );
      if (wi >= 0) {
        const d = hero.attack * 3;
        const actual = Math.max(1, d - updatedEnemies[wi].defense);
        updatedEnemies[wi] = {
          ...updatedEnemies[wi],
          hp: Math.max(0, updatedEnemies[wi].hp - actual),
          isDead: updatedEnemies[wi].hp - actual <= 0,
          isHit: true,
        };
        addFloat(`💥 ${actual}`, 'crit', ePos(wi).x, ePos(wi).y);
        doShake();
        setTimeout(
          () => setEnemies(prev => prev.map((u, i) => (i === wi ? { ...u, isHit: false } : u))),
          430
        );
      }
      break;
    }

    case 'aoe_mid': { /* Devastacion: 60 dmg a TODOS los enemigos */
      // Daño de área: inflige una cantidad fija a cada enemigo vivo.
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const actual = Math.max(1, 60 - e.defense);
        addFloat(`💥 ${actual}`, 'crit', ePos(i).x, ePos(i).y);
        const hp = Math.max(0, e.hp - actual);
        updatedEnemies[i] = { ...e, hp, isDead: hp <= 0, isHit: true };
      }
      doShake();
      setTimeout(
        () => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))),
        440
      );
      break;
    }

    case 'heal_single_heavy': { /* Sanacion Mayor: +120 HP al heroe mas herido */
      // Curación poderosa al aliado con menor porcentaje de HP.
      const mi = updatedHeroes.reduce(
        (minI, h, i) =>
          !h.isDead && h.hp / h.maxHp < (updatedHeroes[minI]?.hp ?? 1) / (updatedHeroes[minI]?.maxHp || 1) ? i : minI,
        updatedHeroes.findIndex(h => !h.isDead)
      );
      if (mi >= 0) {
        updatedHeroes[mi] = { ...updatedHeroes[mi], hp: Math.min(updatedHeroes[mi].maxHp, updatedHeroes[mi].hp + 120) };
        addFloat('+120 💚', 'heal', hPos(mi).x, hPos(mi).y);
      }
      break;
    }

    case 'random_3_mid': { /* Lluvia de Flechas: 45 dmg a 3 enemigos aleatorios */
      // Ataque aleatorio a varios objetivos: golpea hasta 3 enemigos vivos diferentes.
      const targets = updatedEnemies
        .map((_, i) => i)
        .filter(i => !updatedEnemies[i].isDead)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      for (const i of targets) {
        const actual = Math.max(1, 45 - updatedEnemies[i].defense);
        updatedEnemies[i] = {
          ...updatedEnemies[i],
          hp: Math.max(0, updatedEnemies[i].hp - actual),
          isDead: updatedEnemies[i].hp - actual <= 0,
          isHit: true,
        };
        addFloat(`🏹 ${actual}`, 'dmg', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(
        () => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))),
        440
      );
      break;
    }

    case 'mana_drain': { /* Drenar 40 de mana a todos los enemigos */
      // Habilidad de drenaje de maná: quita maná a todos los enemigos vivos, retrasando su próxima habilidad.
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const drained = Math.min(e.mana, 40);
        addFloat(`⚡ -${drained} Mana`, 'skill', ePos(i).x, ePos(i).y);
        updatedEnemies[i] = { ...e, mana: Math.max(0, e.mana - 40) };
      }
      break;
    }

    case 'random_2_mid': { /* 40 dmg a 2 enemigos aleatorios */
      // Habilidad aleatoria a varios objetivos: golpea 2 enemigos vivos con daño moderado.
      const tgts2 = updatedEnemies
        .map((_, i) => i)
        .filter(i => !updatedEnemies[i].isDead)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      for (const i of tgts2) {
        const actual = Math.max(1, 40 - updatedEnemies[i].defense);
        updatedEnemies[i] = {
          ...updatedEnemies[i],
          hp: Math.max(0, updatedEnemies[i].hp - actual),
          isDead: updatedEnemies[i].hp - actual <= 0,
          isHit: true,
        };
        addFloat(`🏹 ${actual}`, 'dmg', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(
        () => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))),
        440
      );
      break;
    }

    case 'random_3_heavy': { /* 50 dmg a 3 enemigos aleatorios */
      // Golpe aleatorio más fuerte: ataca 3 enemigos con daño mayor.
      const tgts3 = updatedEnemies
        .map((_, i) => i)
        .filter(i => !updatedEnemies[i].isDead)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      for (const i of tgts3) {
        const actual = Math.max(1, 50 - updatedEnemies[i].defense);
        updatedEnemies[i] = {
          ...updatedEnemies[i],
          hp: Math.max(0, updatedEnemies[i].hp - actual),
          isDead: updatedEnemies[i].hp - actual <= 0,
          isHit: true,
        };
        addFloat(`💥 ${actual}`, 'crit', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(
        () => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))),
        440
      );
      break;
    }

    case 'single_divine': { /* Golpe Divino: 4x dmg al enemigo con menos HP */
      // Finalizador de un solo objetivo: inflige daño masivo al enemigo con menos HP.
      const wid = updatedEnemies.reduce(
        (mi, e, i, arr) => (!e.isDead && e.hp < (arr[mi]?.hp ?? Infinity) ? i : mi),
        updatedEnemies.findIndex(e => !e.isDead)
      );
      if (wid >= 0) {
        const d = hero.attack * 4;
        const actual = Math.max(1, d - updatedEnemies[wid].defense);
        updatedEnemies[wid] = {
          ...updatedEnemies[wid],
          hp: Math.max(0, updatedEnemies[wid].hp - actual),
          isDead: updatedEnemies[wid].hp - actual <= 0,
          isHit: true,
        };
        addFloat(`💥 ${actual}`, 'crit', ePos(wid).x, ePos(wid).y);
        doShake();
        setTimeout(
          () => setEnemies(prev => prev.map((u, i) => (i === wid ? { ...u, isHit: false } : u))),
          430
        );
      }
      break;
    }

    case 'aoe_heavy': { /* Maestria Arcana: 80 dmg a TODOS los enemigos */
      // Daño de área pesado: golpea a cada enemigo vivo con daño fijo alto.
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const actual = Math.max(1, 80 - e.defense);
        addFloat(`💥 ${actual}`, 'crit', ePos(i).x, ePos(i).y);
        const hp = Math.max(0, e.hp - actual);
        updatedEnemies[i] = { ...e, hp, isDead: hp <= 0, isHit: true };
      }
      doShake();
      setTimeout(
        () => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))),
        440
      );
      break;
    }

    case 'obrero_strike': { /* 45 dmg a un enemigo aleatorio */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const target = alive[Math.floor(Math.random() * alive.length)];
        const actual = Math.max(1, 45 - updatedEnemies[target].defense);
        updatedEnemies[target] = { ...updatedEnemies[target], hp: Math.max(0, updatedEnemies[target].hp - actual), isDead: updatedEnemies[target].hp - actual <= 0, isHit: true };
        addFloat(`💥 ${actual}`, 'dmg', ePos(target).x, ePos(target).y);
        doShake();
        setTimeout(() => setEnemies(prev => prev.map((u, i) => (i === target ? { ...u, isHit: false } : u))), 430);
      }
      break;
    }
    case 'centinela_bash': { /* 60 dmg al enemigo más débil */
      const wi = updatedEnemies.reduce((mi, e, i, arr) => (!e.isDead && e.hp < (arr[mi]?.hp ?? Infinity) ? i : mi), updatedEnemies.findIndex(e => !e.isDead));
      if (wi >= 0) {
        const actual = Math.max(1, 60 - updatedEnemies[wi].defense);
        updatedEnemies[wi] = { ...updatedEnemies[wi], hp: Math.max(0, updatedEnemies[wi].hp - actual), isDead: updatedEnemies[wi].hp - actual <= 0, isHit: true };
        addFloat(`💥 ${actual}`, 'crit', ePos(wi).x, ePos(wi).y);
        doShake();
        setTimeout(() => setEnemies(prev => prev.map((u, i) => (i === wi ? { ...u, isHit: false } : u))), 430);
      }
      break;
    }
    case 'sniper_shot': { /* 80 de daño crítico al enemigo con menos HP */
      const wi = updatedEnemies.reduce((mi, e, i, arr) => (!e.isDead && e.hp < (arr[mi]?.hp ?? Infinity) ? i : mi), updatedEnemies.findIndex(e => !e.isDead));
      if (wi >= 0) {
        const actual = Math.max(1, 80 - updatedEnemies[wi].defense);
        updatedEnemies[wi] = { ...updatedEnemies[wi], hp: Math.max(0, updatedEnemies[wi].hp - actual), isDead: updatedEnemies[wi].hp - actual <= 0, isHit: true };
        addFloat(`🎯 ${actual}`, 'crit', ePos(wi).x, ePos(wi).y);
        doShake();
        setTimeout(() => setEnemies(prev => prev.map((u, i) => (i === wi ? { ...u, isHit: false } : u))), 430);
      }
      break;
    }
    case 'knight_charge': { /* 50 de daño a 2 enemigos */
      const tgts2 = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead).sort(() => Math.random() - 0.5).slice(0, 2);
      for (const i of tgts2) {
        const actual = Math.max(1, 50 - updatedEnemies[i].defense);
        updatedEnemies[i] = { ...updatedEnemies[i], hp: Math.max(0, updatedEnemies[i].hp - actual), isDead: updatedEnemies[i].hp - actual <= 0, isHit: true };
        addFloat(`🐎 ${actual}`, 'dmg', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }
    case 'priest_heal': { /* Cura 80 HP a todos los aliados */
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead) return h;
        addFloat('+80 💚', 'heal', hPos(i).x, hPos(i).y);
        return { ...h, hp: Math.min(h.maxHp, h.hp + 80) };
      });
      break;
    }
    case 'sorceress_blizzard': { /* 60 de daño mágico a TODOS los enemigos y los congela */
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const actual = Math.max(1, 60 - e.defense);
        addFloat(`❄️ ${actual}`, 'crit', ePos(i).x, ePos(i).y);
        const hp = Math.max(0, e.hp - actual);
        updatedEnemies[i] = { ...e, hp, isDead: hp <= 0, isHit: true };
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }
    case 'spellbreaker_drain': { /* Drena 60 de Maná a todos los enemigos */
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const drained = Math.min(e.mana, 60);
        addFloat(`⚡ -${drained} Mana`, 'skill', ePos(i).x, ePos(i).y);
        updatedEnemies[i] = { ...e, mana: Math.max(0, e.mana - 60) };
      }
      break;
    }
    case 'dragonhawk_shackles': { /* 45 daño y silencia a 2 enemigos aleatorios */
      const tgts2 = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead).sort(() => Math.random() - 0.5).slice(0, 2);
      for (const i of tgts2) {
        const actual = Math.max(1, 45 - updatedEnemies[i].defense);
        updatedEnemies[i] = { ...updatedEnemies[i], hp: Math.max(0, updatedEnemies[i].hp - actual), isDead: updatedEnemies[i].hp - actual <= 0, isHit: true };
        addFloat(`🔇 ${actual}`, 'dmg', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }
    case 'gryphon_hammer': { /* 70 daño al objetivo principal y 35 a otros 2 */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const targets = alive.sort(() => Math.random() - 0.5).slice(0, 3);
        const mainTarget = targets[0];
        const actualMain = Math.max(1, 70 - updatedEnemies[mainTarget].defense);
        updatedEnemies[mainTarget] = { ...updatedEnemies[mainTarget], hp: Math.max(0, updatedEnemies[mainTarget].hp - actualMain), isDead: updatedEnemies[mainTarget].hp - actualMain <= 0, isHit: true };
        addFloat(`🔨 ${actualMain}`, 'crit', ePos(mainTarget).x, ePos(mainTarget).y);

        for (let j = 1; j < targets.length; j++) {
            const spl = targets[j];
            const actualSpl = Math.max(1, 35 - updatedEnemies[spl].defense);
            updatedEnemies[spl] = { ...updatedEnemies[spl], hp: Math.max(0, updatedEnemies[spl].hp - actualSpl), isDead: updatedEnemies[spl].hp - actualSpl <= 0, isHit: true };
            addFloat(`⚡ ${actualSpl}`, 'dmg', ePos(spl).x, ePos(spl).y);
        }
        doShake();
        setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      }
      break;
    }
    case 'paladin_aura': { /* Cura 150 HP masiva a todos los aliados */
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead) return h;
        addFloat('+150 💛', 'heal', hPos(i).x, hPos(i).y);
        return { ...h, hp: Math.min(h.maxHp, h.hp + 150) };
      });
      break;
    }
    case 'archmage_blizzard': { /* 90 de daño masivo a TODOS los enemigos */
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const actual = Math.max(1, 90 - e.defense);
        addFloat(`❄️ ${actual}`, 'crit', ePos(i).x, ePos(i).y);
        const hp = Math.max(0, e.hp - actual);
        updatedEnemies[i] = { ...e, hp, isDead: hp <= 0, isHit: true };
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }
    case 'mountain_king_avatar': { /* 150 de daño devastador a un solo enemigo */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const wi = updatedEnemies.reduce((mi, e, i, arr) => (!e.isDead && e.hp > (arr[mi]?.hp ?? -1) ? i : mi), updatedEnemies.findIndex(e => !e.isDead));
        const actual = Math.max(1, 150 - updatedEnemies[wi].defense);
        updatedEnemies[wi] = { ...updatedEnemies[wi], hp: Math.max(0, updatedEnemies[wi].hp - actual), isDead: updatedEnemies[wi].hp - actual <= 0, isHit: true };
        addFloat(`⚡ ${actual}`, 'crit', ePos(wi).x, ePos(wi).y);
        doShake();
        setTimeout(() => setEnemies(prev => prev.map((u, i) => (i === wi ? { ...u, isHit: false } : u))), 430);
      }
      break;
    }
    case 'bloodmage_flamestrike': { /* 100 de daño de fuego a 3 enemigos aleatorios */
      const tgts3 = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead).sort(() => Math.random() - 0.5).slice(0, 3);
      for (const i of tgts3) {
        const actual = Math.max(1, 100 - updatedEnemies[i].defense);
        updatedEnemies[i] = { ...updatedEnemies[i], hp: Math.max(0, updatedEnemies[i].hp - actual), isDead: updatedEnemies[i].hp - actual <= 0, isHit: true };
        addFloat(`🔥 ${actual}`, 'crit', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }

    default: { /* fallback: golpe simple */
      // Habilidad predeterminada de respaldo: realiza un golpe fuerte cuando no hay skillAction específica.
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const target = alive[0];
        const actual = Math.max(1, hero.attack * 2 - updatedEnemies[target].defense);
        updatedEnemies[target] = {
          ...updatedEnemies[target],
          hp: Math.max(0, updatedEnemies[target].hp - actual),
          isDead: updatedEnemies[target].hp - actual <= 0,
          isHit: true,
        };
        addFloat(`💥 ${actual}`, 'dmg', ePos(target).x, ePos(target).y);
        doShake();
        setTimeout(
          () => setEnemies(prev => prev.map((u, i) => (i === target ? { ...u, isHit: false } : u))),
          430
        );
      }
      break;
    }
  }

  return { E: updatedEnemies, H: updatedHeroes };
};
