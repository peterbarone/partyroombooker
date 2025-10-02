const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'public', 'party-background.png');
const sizes = [1600, 1200, 800, 480];

async function generate() {
  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
  }

  for (const w of sizes) {
    const outWebp = path.join(__dirname, '..', 'public', `party-background-${w}.webp`);
    const outPng = path.join(__dirname, '..', 'public', `party-background-${w}.png`);

    console.log('Generating', outWebp);
    await sharp(inputPath)
      .resize({ width: w })
      .webp({ quality: 80 })
      .toFile(outWebp);

    console.log('Generating', outPng);
    await sharp(inputPath)
      .resize({ width: w })
      .png({ quality: 80 })
      .toFile(outPng);
  }

  console.log('Done generating responsive images');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});