const fs = require('fs');
const d = require('./src/data/data.json');
let md = '# Unit Stats\n';
['valdari', 'gorkar', 'sylvaran'].forEach(r => {
    md += '## ' + r + '\n';
    d.Unit.filter(u => u.Race === r).forEach(u => {
        md += `- ${u.Name}: Type=${u.Type}, HP=${u['Hit Points']}, Dmg=${u.Damage}, Armor=${u.Armor}, Gold=${u.Gold}, Wood=${u.Wood}, Time=${u.Time}, Food=${u.Food}\n`;
    });
});
fs.writeFileSync('stats.md', md);
