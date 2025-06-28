import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const iconSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#gradient)" stroke="white" stroke-width="4"/>
  <circle cx="64" cy="64" r="4" fill="white"/>
  <path d="M64 64 L64 28 L84 40" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="64" cy="64" r="50" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
</svg>
`;

async function createIcons() {
  try {
    const sizes = [16, 32, 48, 128];
    
    // Create SVG files
    for (const size of sizes) {
      const scaledSvg = iconSvg.replace('width="128" height="128"', `width="${size}" height="${size}"`);
      const svgPath = `icons/icon${size}.svg`;
      await writeFile(svgPath, scaledSvg);
      console.log(`Created ${svgPath}`);
      
      // Convert SVG to PNG using ImageMagick
      const pngPath = `icons/icon${size}.png`;
      try {
        await execAsync(`convert -background none ${svgPath} ${pngPath}`);
        console.log(`Converted to ${pngPath}`);
      } catch (error) {
        console.error(`Error converting ${svgPath} to PNG:`, error.message);
        console.log('SVG files were created, but PNG conversion failed. Install ImageMagick for PNG generation.');
      }
    }
    
    console.log('Icons created successfully!');
  } catch (error) {
    console.error('Error creating icons:', error);
    process.exit(1);
  }
}

createIcons();