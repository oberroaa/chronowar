const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'data.json');
const d = JSON.parse(fs.readFileSync(p));

// Helper functions
const removeBuild = (buildingName, unitName) => {
    const b = d.building.find(b => b.Name === buildingName && b.Race === 'sylvaran');
    if (b && b.Builds) {
        let arr = b.Builds.split(',').map(s => s.trim()).filter(s => s !== 'null' && s !== '');
        arr = arr.filter(s => s !== unitName);
        b.Builds = arr.length > 0 ? arr.join(', ') : 'null';
    }
};

const addBuild = (buildingName, unitName) => {
    const b = d.building.find(b => b.Name === buildingName && b.Race === 'sylvaran');
    if (b) {
        let arr = b.Builds ? b.Builds.split(',').map(s => s.trim()).filter(s => s !== 'null' && s !== '') : [];
        if (!arr.includes(unitName)) {
            arr.push(unitName);
        }
        b.Builds = arr.join(', ');
    }
};

const setReq = (unitName, reqName) => {
    const u = d.Unit.find(u => u.Name === unitName && u.Race === 'sylvaran');
    if (u) {
        u.Requisito = reqName;
    }
};

// 1. "en SentinelPost va el sentinel"
// Sentinel was in HuntersLodge
removeBuild('HuntersLodge', 'Sentinel');
addBuild('SentinelPost', 'Sentinel');
setReq('Sentinel', 'SentinelPost');

// 2. "en Moonwell va trehnt y quimera"
// Treant and Quimera were in AncientWonder
removeBuild('AncientWonder', 'Treant');
removeBuild('AncientWonder', 'Quimera');
addBuild('Moonwell', 'Treant');
addBuild('Moonwell', 'Quimera');
setReq('Treant', 'Moonwell');
setReq('Quimera', 'Moonwell');

// Write back
fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Update completed successfully.');
