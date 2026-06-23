const fs = require('fs');
const path = require('path');
const d = require('./src/data/data.json');

const tiers = {
    'Valdari': {
        'Obreros / Población': ['Men', 'Woman', 'Emisario', 'Obrero'],
        'Tier 1 (Infantería Ligera / Rango)': ['Centinela', 'Francotirador'],
        'Tier 2 (Soporte Mágico)': ['Cirujano', 'Arcanista'],
        'Tier 2 (Infantería Pesada / Caballería)': ['Caballero', 'Falange', 'Disruptor'],
        'Tier 3 (Unidades de Élite / Voladoras)': ['Jinetes'],
        'Héroes': ['Dawnforged', 'Arconte', 'Thane', 'Vastago']
    },
    'GorKar': {
        'Obreros / Población': ['Goblin', 'Korg', 'Korga'],
        'Tier 1 (Infantería Ligera / Rango)': ['Cazacabezas'],
        'Tier 2 (Soporte Mágico)': ['Chaman', 'Invocador'],
        'Tier 2 (Infantería Pesada / Caballería)': ['Raider', 'Berserker', 'Rompehueso'],
        'Tier 3 (Unidades de Élite / Voladoras)': ['Jinete', 'Machacador', 'Vigía'],
        'Héroes': ['Gorruk', 'Kargath', 'Urzok', 'Valka']
    },
    'Sylvaran': {
        'Obreros / Población': ['Sylron', 'Sylwen', 'Emissary'],
        'Tier 1 (Infantería Ligera / Rango)': ['Archer', 'Huntress', 'Sentinel'],
        'Tier 2 (Soporte Mágico)': ['Druid', 'SpiritWalker', 'Dryad'],
        'Tier 2 (Infantería Pesada / Caballería)': [],
        'Tier 3 (Unidades de Élite / Voladoras)': ['Hippogryph', 'Treant', 'Quimera'],
        'Héroes': ['Lunarion', 'Moonwhisper', 'Shadowleaf', 'Stormbark']
    },
    'Mortharim': {
        'Obreros / Población': ['Acolyte', 'Shade'],
        'Tier 1 (Infantería Ligera / Rango)': ['Ghoul', 'Fiend'],
        'Tier 2 (Soporte Mágico)': ['Necromancer', 'Banshee'],
        'Tier 2 (Infantería Pesada / Caballería)': ['Gargoyle', 'Abomination'],
        'Tier 3 (Unidades de Élite / Voladoras)': ['MeatWagon', 'FrostWyrm'],
        'Héroes': ['DeathKnight', 'Lich', 'Dreadlord', 'CryptLord']
    }
};

let md = `# Balance de Unidades y Héroes por Tiers

Esta tabla organiza a todas las unidades de las 4 razas en sus respectivos niveles o *Tiers*, para que puedas ver el equilibrio en tiempo real.

`;

Object.keys(tiers).forEach(raceName => {
    md += `## 🌟 ${raceName}\n\n`;
    
    Object.keys(tiers[raceName]).forEach(tierName => {
        const unitsList = tiers[raceName][tierName];
        if (unitsList.length === 0) return;
        
        md += `### ${tierName}\n`;
        md += `| Unidad | Oro | Madera | Tiempo (s) | Food | Vida (HP) | Daño | Armadura | Rango |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
        
        unitsList.forEach(unitName => {
            const u = d.Unit.find(u => u.Name === unitName && u.Race.toLowerCase() === raceName.toLowerCase());
            if (u) {
                md += `| **${u.Name}** | ${u.Gold} | ${u.Wood} | ${u.Time} | ${u.Food} | ${u['Hit Points']} | ${u.Damage} | ${u.Armor} | ${u.Range} |\n`;
            }
        });
        md += `\n`;
    });
});

fs.writeFileSync('C:\\Users\\Otto\\.gemini\\antigravity-ide\\brain\\0f34dd67-e6ce-4d45-bd6b-f194a1a60945\\unidades_y_heroes.md', md);
console.log('Artifact generated.');
