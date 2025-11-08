import React from 'react';
import { View } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import Logo from '../components/Logo';

// This script generates app icons from the Logo component
// Run with: npx expo start and navigate to this component

export default function GenerateIcons() {
  const logoRef = React.useRef(null);

  const generateIcon = async (size: number, filename: string, backgroundColor: string = 'transparent') => {
    try {
      const uri = await captureRef(logoRef, {
        format: 'png',
        quality: 1,
        width: size,
        height: size,
      });

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const destPath = `${FileSystem.documentDirectory}../assets/images/${filename}`;
      await FileSystem.writeAsStringAsync(destPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log(`Generated ${filename} at ${size}x${size}px`);
    } catch (error) {
      console.error(`Error generating ${filename}:`, error);
    }
  };

  const generateAllIcons = async () => {
    await generateIcon(1024, 'icon.png', '#181711');
    await generateIcon(1024, 'android-icon-foreground.png', 'transparent');
    await generateIcon(1024, 'android-icon-background.png', '#181711');
    await generateIcon(1024, 'android-icon-monochrome.png', '#FFFFFF');
    await generateIcon(400, 'splash-icon.png', 'transparent');
    await generateIcon(48, 'favicon.png', '#181711');
    console.log('All icons generated!');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#181711' }}>
      <View ref={logoRef} collapsable={false}>
        <Logo size={1024} color="#ecc813" />
      </View>
      <Pressable
        onPress={generateAllIcons}
        style={{
          marginTop: 50,
          backgroundColor: '#ecc813',
          padding: 20,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: '#181711', fontSize: 18, fontWeight: 'bold' }}>
          Generate Icons
        </Text>
      </Pressable>
    </View>
  );
}
