const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'assets', 'logo.svg');
const imagesDir = path.join(__dirname, 'assets', 'images');

async function generateIcons() {
  console.log('Generating app icons from logo.svg...\n');

  const icons = [
    { name: 'icon.png', size: 1024, bg: '#181711' },
    { name: 'android-icon-foreground.png', size: 1024, bg: 'transparent' },
    { name: 'android-icon-background.png', size: 1024, bg: '#181711', noLogo: true },
    { name: 'android-icon-monochrome.png', size: 1024, bg: 'transparent', color: '#FFFFFF' },
    { name: 'splash-icon.png', size: 400, bg: 'transparent' },
    { name: 'favicon.png', size: 48, bg: '#181711' },
  ];

  for (const icon of icons) {
    try {
      const outputPath = path.join(imagesDir, icon.name);

      if (icon.noLogo) {
        // Just create a solid color background
        await sharp({
          create: {
            width: icon.size,
            height: icon.size,
            channels: 4,
            background: icon.bg
          }
        })
        .png()
        .toFile(outputPath);
      } else {
        // Read SVG and apply color if specified
        let svgBuffer = fs.readFileSync(svgPath);

        if (icon.color) {
          // Replace color for monochrome version
          svgBuffer = Buffer.from(
            svgBuffer.toString().replace(/#ecc813/g, icon.color)
          );
        }

        await sharp(svgBuffer)
          .resize(icon.size, icon.size, {
            fit: 'contain',
            background: icon.bg === 'transparent' ? { r: 0, g: 0, b: 0, alpha: 0 } : icon.bg
          })
          .png()
          .toFile(outputPath);
      }

      console.log(`✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`✗ Error generating ${icon.name}:`, error.message);
    }
  }

  console.log('\n✓ All icons generated successfully!');
  console.log('\nYou can now run: eas build --platform android --profile preview');
}

generateIcons().catch(console.error);
