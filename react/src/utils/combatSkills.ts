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
    case 'paladin_aura': { /* Holy Light: Cura 150 HP masiva a todos los aliados */
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead) return h;
        addFloat('+150 💛', 'heal', hPos(i).x, hPos(i).y);
        return { ...h, hp: Math.min(h.maxHp, h.hp + 150) };
      });
      break;
    }
    case 'divine_shield': { /* Divine Shield: Otorga un escudo masivo al Paladín */
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead || h.name !== hero.name) return h;
        addFloat('🛡️ Inmune +150', 'combo', hPos(i).x, hPos(i).y - 28);
        return { ...h, shield: (h.shield || 0) + 150 };
      });
      break;
    }
    case 'archmage_blizzard': { /* Blizzard: 90 de daño masivo a TODOS los enemigos */
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
    case 'arcane_blast': { /* Arcane Blast: 60 daño a 2 enemigos y reduce armadura en 2 */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      const targets = alive.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const i of targets) {
        const actual = Math.max(1, 60 - updatedEnemies[i].defense);
        updatedEnemies[i] = { 
          ...updatedEnemies[i], 
          hp: Math.max(0, updatedEnemies[i].hp - actual), 
          defense: Math.max(0, updatedEnemies[i].defense - 2), // Reduce armor by 2
          isDead: updatedEnemies[i].hp - actual <= 0, 
          isHit: true 
        };
        addFloat(`✨ ${actual} (-2 Def)`, 'crit', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }
    case 'mountain_king_avatar': { /* Storm Bolt: 150 de daño a un solo enemigo */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const wi = updatedEnemies.reduce((mi, e, i, arr) => (!e.isDead && e.hp > (arr[mi]?.hp ?? -1) ? i : mi), updatedEnemies.findIndex(e => !e.isDead));
        const actual = Math.max(1, 150 - updatedEnemies[wi].defense);
        updatedEnemies[wi] = { ...updatedEnemies[wi], hp: Math.max(0, updatedEnemies[wi].hp - actual), isDead: updatedEnemies[wi].hp - actual <= 0, isHit: true };
        addFloat(`⚡ Storm Bolt: ${actual}`, 'crit', ePos(wi).x, ePos(wi).y);
        doShake();
        setTimeout(() => setEnemies(prev => prev.map((u, i) => (i === wi ? { ...u, isHit: false } : u))), 430);
      }
      break;
    }
    case 'thunder_clap': { /* Thunder Clap: 70 daño en área a todos */
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const actual = Math.max(1, 70 - e.defense);
        addFloat(`💥 Clap: ${actual}`, 'crit', ePos(i).x, ePos(i).y);
        const hp = Math.max(0, e.hp - actual);
        updatedEnemies[i] = { ...e, hp, isDead: hp <= 0, isHit: true };
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }
    case 'bloodmage_flamestrike': { /* Flame Strike: 100 daño a 3 enemigos */
      const tgts3 = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead).sort(() => Math.random() - 0.5).slice(0, 3);
      for (const i of tgts3) {
        const actual = Math.max(1, 100 - updatedEnemies[i].defense);
        updatedEnemies[i] = { ...updatedEnemies[i], hp: Math.max(0, updatedEnemies[i].hp - actual), isDead: updatedEnemies[i].hp - actual <= 0, isHit: true };
        addFloat(`🔥 Flame: ${actual}`, 'crit', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }
    case 'banish': { /* Banish: reduce defensa y hace daño */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const target = alive[Math.floor(Math.random() * alive.length)];
        // Reduce defensa a 0 temporalmente
        addFloat(`✨ Banished! Def: 0`, 'skill', ePos(target).x, ePos(target).y - 25);
        const actual = 80; // Daño mágico puro que ignora defensa
        updatedEnemies[target] = { ...updatedEnemies[target], defense: 0, hp: Math.max(0, updatedEnemies[target].hp - actual), isDead: updatedEnemies[target].hp - actual <= 0, isHit: true };
        addFloat(`💥 ${actual}`, 'crit', ePos(target).x, ePos(target).y);
        doShake();
        setTimeout(() => setEnemies(prev => prev.map((u, i) => (i === target ? { ...u, isHit: false } : u))), 430);
      }
      break;
    }
    case 'defend': { /* Defend: Escudo defensivo de 80 al primer aliado */
      const alive = updatedHeroes.map((_, i) => i).filter(i => !updatedHeroes[i].isDead);
      if (alive.length > 0) {
        const target = alive[0];
        updatedHeroes[target] = { ...updatedHeroes[target], shield: (updatedHeroes[target].shield || 0) + 80 };
        addFloat(`🛡️ Defend +80`, 'combo', hPos(target).x, hPos(target).y - 25);
      }
      break;
    }
    case 'spell_immunity': { /* Spell Immunity: Escudo purificador */
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead) return h;
        addFloat(`🛡️ Immune +100`, 'combo', hPos(i).x, hPos(i).y - 25);
        return { ...h, shield: (h.shield || 0) + 100, poison: 0 };
      });
      break;
    }
    case 'barricade': { /* Barricade: Escudo de 80 a todos los aliados */
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead) return h;
        addFloat(`🛡️ Barricade +80`, 'combo', hPos(i).x, hPos(i).y - 25);
        return { ...h, shield: (h.shield || 0) + 80 };
      });
      break;
    }
    case 'slow': { /* Slow: reduce ataque de 2 enemigos en 30% */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      const targets = alive.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const i of targets) {
        updatedEnemies[i] = { ...updatedEnemies[i], attack: Math.max(1, Math.round(updatedEnemies[i].attack * 0.7)) };
        addFloat(`❄️ Ralentizado (-30% ATK)`, 'skill', ePos(i).x, ePos(i).y - 25);
      }
      break;
    }
    case 'feedback': { /* Feedback: drena 60 mana */
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const drained = Math.min(e.mana, 60);
        addFloat(`⚡ Feedback: -${drained} Mana`, 'skill', ePos(i).x, ePos(i).y);
        updatedEnemies[i] = { ...e, mana: Math.max(0, e.mana - 60) };
      }
      break;
    }
    case 'flare': { /* Flare: daño explosivo en cruz */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      const targets = alive.sort(() => Math.random() - 0.5).slice(0, 2);
      for (const i of targets) {
        const actual = Math.max(1, 60 - updatedEnemies[i].defense);
        updatedEnemies[i] = { ...updatedEnemies[i], hp: Math.max(0, updatedEnemies[i].hp - actual), isDead: updatedEnemies[i].hp - actual <= 0, isHit: true };
        addFloat(`💥 Flare: ${actual}`, 'crit', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }
    case 'storm_hammer': { /* Storm Hammer: daño masivo y encadenado */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const targets = alive.sort(() => Math.random() - 0.5).slice(0, 3);
        const mainTarget = targets[0];
        const actualMain = Math.max(1, 70 - updatedEnemies[mainTarget].defense);
        updatedEnemies[mainTarget] = { ...updatedEnemies[mainTarget], hp: Math.max(0, updatedEnemies[mainTarget].hp - actualMain), isDead: updatedEnemies[mainTarget].hp - actualMain <= 0, isHit: true };
        addFloat(`🔨 Hammer: ${actualMain}`, 'crit', ePos(mainTarget).x, ePos(mainTarget).y);

        for (let j = 1; j < targets.length; j++) {
            const spl = targets[j];
            const actualSpl = Math.max(1, 35 - updatedEnemies[spl].defense);
            updatedEnemies[spl] = { ...updatedEnemies[spl], hp: Math.max(0, updatedEnemies[spl].hp - actualSpl), isDead: updatedEnemies[spl].hp - actualSpl <= 0, isHit: true };
            addFloat(`⚡ Splash: ${actualSpl}`, 'dmg', ePos(spl).x, ePos(spl).y);
        }
        doShake();
        setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      }
      break;
    }    case 'heavy_strike': { /* Golpe Pesado: 65 daño a un enemigo aleatorio */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const target = alive[Math.floor(Math.random() * alive.length)];
        const actual = Math.max(1, 65 - updatedEnemies[target].defense);
        updatedEnemies[target] = { ...updatedEnemies[target], hp: Math.max(0, updatedEnemies[target].hp - actual), isDead: updatedEnemies[target].hp - actual <= 0, isHit: true };
        addFloat(`💥 Golpe Pesado: ${actual}`, 'crit', ePos(target).x, ePos(target).y);
        doShake();
        setTimeout(() => setEnemies(prev => prev.map((u, i) => (i === target ? { ...u, isHit: false } : u))), 430);
      }
      break;
    }

    case 'poison_spear': { /* Lanza Envenenada: 35 daño y aplica 30 de veneno */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const target = alive[Math.floor(Math.random() * alive.length)];
        const actual = Math.max(1, 35 - updatedEnemies[target].defense);
        updatedEnemies[target] = { 
          ...updatedEnemies[target], 
          hp: Math.max(0, updatedEnemies[target].hp - actual), 
          isDead: updatedEnemies[target].hp - actual <= 0,
          poison: (updatedEnemies[target].poison || 0) + 30,
          isHit: true 
        };
        addFloat(`💥 ${actual} 🤢 Veneno +30`, 'crit', ePos(target).x, ePos(target).y);
        doShake();
        setTimeout(() => setEnemies(prev => prev.map((u, i) => (i === target ? { ...u, isHit: false } : u))), 430);
      }
      break;
    }

    case 'bloodlust': { /* Sed de Sangre: Aumenta ataque de todos los aliados vivos en +5 permanentemente en este combate */
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead) return h;
        addFloat(`⚔️ ¡Furia! ATK +5`, 'combo', hPos(i).x, hPos(i).y - 25);
        return { ...h, attack: h.attack + 5 };
      });
      break;
    }

    case 'healing_ward': { /* Guardián Sanador: Cura 50 HP a todos los aliados */
      updatedHeroes = updatedHeroes.map((h, i) => {
        if (h.isDead) return h;
        addFloat('+50 💚', 'heal', hPos(i).x, hPos(i).y);
        return { ...h, hp: Math.min(h.maxHp, h.hp + 50) };
      });
      break;
    }

    case 'pulverize': { /* Pulverizar: Hace 50 de daño en área a todos los enemigos */
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const actual = Math.max(1, 50 - e.defense);
        addFloat(`💥 Pulverizar: ${actual}`, 'crit', ePos(i).x, ePos(i).y);
        const hp = Math.max(0, e.hp - actual);
        updatedEnemies[i] = { ...e, hp, isDead: hp <= 0, isHit: true };
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }

    case 'ensnare': { /* Atrapar: 30 dmg a un enemigo aleatorio y reduce su ataque en un 50% */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead);
      if (alive.length > 0) {
        const target = alive[Math.floor(Math.random() * alive.length)];
        const actual = Math.max(1, 30 - updatedEnemies[target].defense);
        updatedEnemies[target] = { 
          ...updatedEnemies[target], 
          hp: Math.max(0, updatedEnemies[target].hp - actual), 
          isDead: updatedEnemies[target].hp - actual <= 0,
          attack: Math.max(1, Math.round(updatedEnemies[target].attack * 0.5)),
          isHit: true 
        };
        addFloat(`🕸️ Atrapado: -50% ATK`, 'skill', ePos(target).x, ePos(target).y - 25);
        addFloat(`💥 ${actual}`, 'dmg', ePos(target).x, ePos(target).y);
        doShake();
        setTimeout(() => setEnemies(prev => prev.map((u, i) => (i === target ? { ...u, isHit: false } : u))), 430);
      }
      break;
    }

    case 'burning_oil': { /* Aceite Hirviente: Quema a 3 enemigos aleatorios por 55 de daño */
      const tgts = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead).sort(() => Math.random() - 0.5).slice(0, 3);
      for (const i of tgts) {
        const actual = Math.max(1, 55 - updatedEnemies[i].defense);
        updatedEnemies[i] = { ...updatedEnemies[i], hp: Math.max(0, updatedEnemies[i].hp - actual), isDead: updatedEnemies[i].hp - actual <= 0, isHit: true };
        addFloat(`🔥 Aceite Hirviente: ${actual}`, 'crit', ePos(i).x, ePos(i).y);
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }

    case 'bladestorm': { /* Tormenta de Espadas: 110 de daño masivo a todos los enemigos */
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const actual = Math.max(1, 110 - e.defense);
        addFloat(`⚔️ Bladestorm: ${actual}`, 'crit', ePos(i).x, ePos(i).y);
        const hp = Math.max(0, e.hp - actual);
        updatedEnemies[i] = { ...e, hp, isDead: hp <= 0, isHit: true };
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }

    case 'chain_lightning': { /* Cadena de Relámpagos: Rayo que golpea al primer enemigo por 90 dmg, al segundo por 60 dmg y al tercero por 35 dmg */
      const alive = updatedEnemies.map((_, i) => i).filter(i => !updatedEnemies[i].isDead).sort(() => Math.random() - 0.5).slice(0, 3);
      const dmgs = [90, 60, 35];
      for (let idx = 0; idx < alive.length; idx++) {
        const target = alive[idx];
        const actual = Math.max(1, dmgs[idx] - updatedEnemies[target].defense);
        updatedEnemies[target] = { ...updatedEnemies[target], hp: Math.max(0, updatedEnemies[target].hp - actual), isDead: updatedEnemies[target].hp - actual <= 0, isHit: true };
        addFloat(`⚡ Relámpago: ${actual}`, 'crit', ePos(target).x, ePos(target).y);
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }

    case 'shockwave': { /* Onda de Choque: 80 de daño a todos los enemigos */
      for (let i = 0; i < updatedEnemies.length; i++) {
        const e = updatedEnemies[i];
        if (e.isDead) continue;
        const actual = Math.max(1, 80 - e.defense);
        addFloat(`🌊 Onda de Choque: ${actual}`, 'crit', ePos(i).x, ePos(i).y);
        const hp = Math.max(0, e.hp - actual);
        updatedEnemies[i] = { ...e, hp, isDead: hp <= 0, isHit: true };
      }
      doShake();
      setTimeout(() => setEnemies(prev => prev.map(u => ({ ...u, isHit: false }))), 440);
      break;
    }

    case 'healing_wave': { /* Ola Sanadora: Cura 90 HP al primer aliado, 60 HP al segundo y 40 HP al tercero */
      const aliveAllies = updatedHeroes.map((h, i) => ({ index: i, unit: h })).filter(item => !item.unit.isDead).sort(() => Math.random() - 0.5).slice(0, 3);
      const healVals = [90, 60, 40];
      for (let idx = 0; idx < aliveAllies.length; idx++) {
        const targetIndex = aliveAllies[idx].index;
        const targetUnit = aliveAllies[idx].unit;
        const healAmt = healVals[idx];
        updatedHeroes[targetIndex] = { ...targetUnit, hp: Math.min(targetUnit.maxHp, targetUnit.hp + healAmt) };
        addFloat(`✨ Sanación: +${healAmt}`, 'heal', hPos(targetIndex).x, hPos(targetIndex).y);
      }
      break;
    }

    case 'resuscitate': { /* Revive un aliado muerto a mitad de vida; si no hay muertos, cura 60 HP a todos */
      const deadAllies = updatedHeroes.map((h, i) => ({ index: i, unit: h })).filter(item => item.unit.isDead);
      if (deadAllies.length > 0) {
        const target = deadAllies[Math.floor(Math.random() * deadAllies.length)]; // Revive un muerto aleatorio
        const targetIndex = target.index;
        const revivedHp = Math.floor(target.unit.maxHp / 2);
        updatedHeroes[targetIndex] = {
          ...target.unit,
          isDead: false,
          hp: revivedHp
        };
        addFloat(`✨ Revivido: +${revivedHp} HP`, 'heal', hPos(targetIndex).x, hPos(targetIndex).y - 25);
      } else {
        // Backup heal si no hay aliados muertos
        updatedHeroes = updatedHeroes.map((h, i) => {
          if (h.isDead) return h;
          addFloat('+60 💚', 'heal', hPos(i).x, hPos(i).y);
          return { ...h, hp: Math.min(h.maxHp, h.hp + 60) };
        });
      }
      break;
    }

    default: { /* fallback: golpe simple */
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
