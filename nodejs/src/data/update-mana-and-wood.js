const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'data.json');
const d = JSON.parse(fs.readFileSync(p));

const mages = ['Cirujano', 'Arcanista', 'Arconte', 'Vastago', 'Chaman', 'Invocador', 'Kargath', 'Valka', 'Druid', 'SpiritWalker', 'Dryad', 'Lunarion', 'Stormbark', 'Necromancer', 'Banshee', 'Lich', 'Dreadlord'];

d.Unit.forEach(u => {
    // Replace Range with Mana
    if ('Range' in u) {
        delete u.Range;
    }
    
    // Set Wood to 0 for all units
    u.Wood = "0";

    // Set Mana
    if (!u.skillAction || u.skillAction === 'none' || u.skillAction === 'null') {
        u.Mana = "0";
    } else if (mages.includes(u.Name)) {
        u.Mana = "200";
    } else {
        // Warriors, heroes, etc.
        u.Mana = "400";
    }
    
    // Adjust Vigía
    if (u.Name === 'Vigía' || u.Name === 'Viga') { // Handle possible encoding issues
        u['Hit Points'] = "250";
        u.Gold = "75";
    }
    
    // Rename Jinete (Gorkar) to Drak'Tharon
    if (u.Race === 'gorkar' && u.Name === 'Jinete') {
        u.Name = "Drak'Tharon";
        u.Img = "/images/GorKar/units/DrakTharon.png";
    }
});

// Write back
fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Updated Mana, Wood, Vigia, and DrakTharon successfully.');
