// Simple script to use Expo's icon generation
// Run with: node generate-icons.js

const { execSync } = require('child_process');

console.log('To generate app icons from your Logo component:');
console.log('');
console.log('1. First, we need to create a PNG version of your logo');
console.log('2. You can use an online SVG to PNG converter');
console.log('3. Or use this command after creating a logo.svg file:');
console.log('');
console.log('For now, let me update the app.json to use better colors for your brand...');

// Update app.json adaptive icon background to match your brand
const fs = require('fs');
const appJsonPath = './app.json';
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Update background color to match your dark theme
appJson.expo.android.adaptiveIcon.backgroundColor = '#181711';

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log('');
console.log('✓ Updated app.json with your brand color (#181711) for the icon background');
console.log('');
console.log('Next steps:');
console.log('1. Save your logo as a 1024x1024 PNG file');
console.log('2. Replace the files in assets/images/ with your logo');
console.log('3. Or use: npx @expo/cli customize:generate-icons');
