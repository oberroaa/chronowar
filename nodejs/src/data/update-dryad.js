const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'data.json');
const d = JSON.parse(fs.readFileSync(p));

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

// "en DruidsCircle pon el Dryad"
// Remove from Moonwell
removeBuild('Moonwell', 'Dryad');
// Add to DruidsCircle
addBuild('DruidsCircle', 'Dryad');
// Set Requirement
setReq('Dryad', 'DruidsCircle');

// Write back
fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('Dryad moved to DruidsCircle.');
