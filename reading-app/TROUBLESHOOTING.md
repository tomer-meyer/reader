# Troubleshooting Guide

## Common Issues and Solutions

### 1. "../Utilities/Platform" Module Resolution Error

**Error**: `Cannot resolve module "../Utilities/Platform" from "node_modules/react-native/Libraries/ReactPrivate/ReactNativePrivateInterface.js"`

**Solution**: 
1. Clear Metro cache and node_modules:
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   npx expo start --clear
   ```

2. If the error persists, try using a different React Native version:
   ```bash
   npm install react-native@0.76.3 --legacy-peer-deps
   ```

### 2. Metro Bundler Issues

**Solution**:
1. Clear Metro cache:
   ```bash
   npx expo start --clear
   ```

2. Reset Expo cache:
   ```bash
   npx expo r -c
   ```

### 3. TypeScript Errors

**Solution**:
1. Check TypeScript configuration:
   ```bash
   npx tsc --noEmit
   ```

2. Update TypeScript if needed:
   ```bash
   npm install typescript@~5.8.3 --save-dev
   ```

### 4. Navigation Issues

**Solution**:
1. Ensure all navigation dependencies are installed:
   ```bash
   npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
   ```

### 5. SQLite Issues

**Solution**:
1. Ensure expo-sqlite is properly installed:
   ```bash
   npm install expo-sqlite
   ```

2. For web development, SQLite might not work. Use a different storage solution for web.

### 6. WebView Issues

**Solution**:
1. Ensure react-native-webview is installed:
   ```bash
   npm install react-native-webview
   ```

### 7. Expo Go Compatibility

**Solution**:
1. Make sure you're using the latest Expo Go app
2. Check that your Expo SDK version is compatible with Expo Go

### 8. Development Environment Setup

**For iOS**:
```bash
# Install iOS Simulator (macOS only)
npm run ios
```

**For Android**:
```bash
# Install Android Studio and set up emulator
npm run android
```

**For Web**:
```bash
npm run web
```

### 9. Performance Issues

**Solution**:
1. Enable Hermes engine (already enabled in Expo)
2. Use production builds for testing performance
3. Monitor memory usage in development

### 10. Build Issues

**Solution**:
1. Clear all caches:
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install --legacy-peer-deps
   ```

2. Reset Expo:
   ```bash
   npx expo install --fix
   ```

## Alternative Solutions

If you continue to have issues, try these alternatives:

### Option 1: Use Expo Development Build
```bash
npx expo install expo-dev-client
npx expo run:ios  # or run:android
```

### Option 2: Use React Native CLI
If Expo continues to cause issues, you can migrate to React Native CLI:
```bash
npx react-native init ReadingApp --template react-native-template-typescript
```

### Option 3: Use a Different Expo SDK
Try using an older, more stable Expo SDK version:
```bash
npx create-expo-app@latest reading-app --template blank-typescript
```

## Getting Help

1. Check the [Expo documentation](https://docs.expo.dev/)
2. Check the [React Native documentation](https://reactnative.dev/)
3. Search for similar issues on [GitHub](https://github.com/expo/expo/issues)
4. Ask for help on [Expo Discord](https://discord.gg/expo)

## Environment Information

- Node.js version: 18+
- npm version: 8+
- Expo CLI version: Latest
- React Native version: 0.76.3
- Expo SDK version: 53