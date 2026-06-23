const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'data.json');
const d = JSON.parse(fs.readFileSync(p));

const updateUnit = (name, hp, dmg, armor, time, s1, sd1, sa1, s2, sd2, sa2) => {
    const u = d.Unit.find(u => u.Name === name && u.Race === 'sylvaran');
    if (u) {
        u['Hit Points'] = String(hp);
        u.Damage = String(dmg);
        u.Armor = String(armor);
        u.Time = String(time);
        if (s1) {
            u.skillName = s1;
            u.skillDesc = sd1 || "";
            u.skillAction = sa1 || "";
        }
        if (s2) {
            u.skillName2 = s2;
            u.skillDesc2 = sd2 || "";
            u.skillAction2 = sa2 || "";
        }
    }
};

// Units
updateUnit('Archer', 245, 17, 0, 20, 'Shadowmeld', 'Invisibilidad nocturna', 'shadowmeld');
updateUnit('Huntress', 600, 17, 2, 30, 'Moon Glaive', 'Ataque con rebote', 'moon_glaive', 'Sentinel', 'Búho de visión', 'sentinel');
updateUnit('Dryad', 435, 18, 0, 28, 'Slow Poison', 'Envenena y ralentiza', 'slow_poison', 'Spell Immunity', 'Inmune a magia', 'spell_immunity');
updateUnit('Druid', 300, 15, 1, 40, 'Rejuvenation', 'Cura prolongada', 'rejuvenation', 'Roar', 'Aumenta el daño de área', 'roar');
updateUnit('SpiritWalker', 240, 12, 0, 28, 'Faerie Fire', 'Reduce armadura', 'faerie_fire', 'Cyclone', 'Levanta al enemigo', 'cyclone');
updateUnit('Hippogryph', 575, 30, 0, 30, '', '', '');
updateUnit('Quimera', 1000, 65, 0, 60, 'Corrosive Breath', 'Daño corrosivo masivo', 'corrosive_breath', 'Resistant Skin', 'Reduce efectos mágicos', 'resistant_skin');

// Custom user unit
updateUnit('Sentinel', 500, 25, 2, 35, 'Shadow Strike', 'Golpe venenoso inicial', 'shadow_strike');

// Heroes
// Priestess of the Moon
updateUnit('Lunarion', 550, 23, 1, 55, 'Starfall', 'Lluvia de estrellas en área', 'starfall', 'Searing Arrows', 'Flechas de fuego adicionales', 'searing_arrows');
// Demon Hunter
updateUnit('Moonwhisper', 675, 26, 3, 55, 'Mana Burn', 'Quema el maná del enemigo', 'mana_burn', 'Metamorphosis', 'Transformación demoníaca', 'metamorphosis');
// Warden
updateUnit('Shadowleaf', 600, 26, 3, 55, 'Fan of Knives', 'Cuchillos a múltiples blancos', 'fan_of_knives', 'Blink', 'Teletransportación corta', 'blink');
// Keeper of the Grove
updateUnit('Stormbark', 625, 24, 1, 55, 'Force of Nature', 'Invoca Treants', 'force_of_nature', 'Entangling Roots', 'Raíces que atrapan y dañan', 'entangling_roots');

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Sylvaran stats updated successfully.');
