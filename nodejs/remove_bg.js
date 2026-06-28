const Jimp = require('jimp');

async function removeBackground() {
  try {
    const image = await Jimp.read('C:\\Users\\Otto\\.gemini\\antigravity-ide\\brain\\4e2af8f7-fb2b-49d8-844a-86a38aa7939d\\market_solid_white_1782601968462.png');
    const targetColor = { r: 255, g: 255, b: 255 };
    const tolerance = 35; // increased tolerance to handle edges

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      const distance = Math.sqrt(
        Math.pow(r - targetColor.r, 2) +
        Math.pow(g - targetColor.g, 2) +
        Math.pow(b - targetColor.b, 2)
      );

      if (distance <= tolerance) {
        this.bitmap.data[idx + 3] = 0; // alpha to 0
      }
    });

    await image.writeAsync('C:\\Users\\Otto\\.gemini\\antigravity-ide\\brain\\4e2af8f7-fb2b-49d8-844a-86a38aa7939d\\market_solid_white_transparent.png');
    console.log('Background removed successfully.');
  } catch (e) {
    console.error('Error:', e);
  }
}

removeBackground();
