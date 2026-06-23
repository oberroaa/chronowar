const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'data.json');
const d = JSON.parse(fs.readFileSync(p));

// Find the Emissary unit and change its Requisito
const emissary = d.Unit.find(u => u.Name === 'Emissary' && u.Race === 'sylvaran');
if (emissary) {
    emissary.Requisito = 'AncientWonder';
}

// Find TreeOfLife and remove Emissary from Builds
const treeOfLife = d.building.find(b => b.Name === 'TreeOfLife' && b.Race === 'sylvaran');
if (treeOfLife) {
    // "Sylron, Sylwen, Emissary" -> "Sylron, Sylwen"
    treeOfLife.Builds = treeOfLife.Builds.replace(', Emissary', '').replace('Emissary, ', '').replace('Emissary', '');
}

// Find AncientWonder and add Emissary to Builds
const ancientWonder = d.building.find(b => b.Name === 'AncientWonder' && b.Race === 'sylvaran');
if (ancientWonder) {
    if (ancientWonder.Builds === 'null' || !ancientWonder.Builds) {
        ancientWonder.Builds = 'Emissary';
    } else {
        ancientWonder.Builds = ancientWonder.Builds + ', Emissary';
    }
}

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log('TreeOfLife Builds:', treeOfLife.Builds);
console.log('AncientWonder Builds:', ancientWonder.Builds);
console.log('Emissary Requisito:', emissary.Requisito);
