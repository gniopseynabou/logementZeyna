import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = path.join(process.cwd(), 'src/assets');

async function optimizeImages() {
  console.log('Optimisation des images en cours...');
  
  const files = fs.readdirSync(assetsDir);
  let totalSaved = 0;

  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.png')) {
      const inputPath = path.join(assetsDir, file);
      const outputFilename = file.replace(/\.(jpg|png)$/, '.webp');
      const outputPath = path.join(assetsDir, outputFilename);
      
      const inputStats = fs.statSync(inputPath);
      const originalSize = inputStats.size;

      try {
        let pipeline = sharp(inputPath);
        
        // Resize hero-bg which is huge
        if (file === 'hero-bg.jpg') {
          pipeline = pipeline.resize(1920, null, { withoutEnlargement: true });
        }
        
        // Resize logo-zeyna which is unnecessarily large for a logo
        if (file === 'logo-zeyna.png') {
          pipeline = pipeline.resize(400, null, { withoutEnlargement: true });
        }

        await pipeline
          .webp({ quality: 80, effort: 6 }) // Convert to webp with good compression
          .toFile(outputPath);
          
        const outputStats = fs.statSync(outputPath);
        const newSize = outputStats.size;
        
        const saved = originalSize - newSize;
        totalSaved += saved;
        
        console.log(`✅ ${file} -> ${outputFilename} | ${(originalSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB (-${Math.round((saved/originalSize)*100)}%)`);
        
        // Optionally delete the old file
        // fs.unlinkSync(inputPath);
        
      } catch (err) {
        console.error(`❌ Erreur avec ${file}:`, err);
      }
    }
  }
  
  console.log(`\n🎉 Terminé ! Espace total économisé : ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

optimizeImages();
