const fs = require('fs');
const path = require('path');

const srcImg = 'C:/Users/Otto/.gemini/antigravity-ide/brain/e3fae5fd-08c9-4125-b6e8-87c58e2ddb01/gran_bazar_v2_1782432456884.png';
const destImg = 'd:/MPC/chronowar/react/public/images/Valdari/construcciones/GranBazar.png';

if (fs.existsSync(srcImg)) {
    fs.copyFileSync(srcImg, destImg);
    console.log('Successfully replaced the Gran Bazar image.');
} else {
    console.error('Source image not found!');
}
