# Document Scanner Example App

This is an **Expo bare workflow TypeScript example app** for testing the `react-native-document-scanner` library.

## Quick Start

1. **Navigate to example directory:**
   ```bash
   cd example
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Generate native projects:**
   ```bash
   npx expo prebuild
   ```

4. **Configure Android (if needed):**
   - Update `android/settings.gradle` to include OpenCV library
   - Update `android/app/src/main/AndroidManifest.xml` with camera permissions
   - See Android setup section below

5. **Install iOS pods:**
   ```bash
   cd ios && pod install && cd ..
   ```

6. **Run the app:**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Android Setup

After running `expo prebuild`, update the following:

### 1. Update `android/settings.gradle`

Add the OpenCV library:
```gradle
include ':openCVLibrary310'
project(':openCVLibrary310').projectDir = new File(rootProject.projectDir,'../android/openCVLibrary310')
```

### 2. Update `android/app/src/main/AndroidManifest.xml`

Add `xmlns:tools` to manifest tag:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android" 
         package="com.documentscannerexample" 
         xmlns:tools="http://schemas.android.com/tools">
```

Add `tools:replace="android:allowBackup"` to application tag:
```xml
<application 
    tools:replace="android:allowBackup"
    ...>
```

Add camera permission:
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### 3. Update `android/app/build.gradle`

Add OpenCV dependency:
```gradle
dependencies {
    implementation project(':openCVLibrary310')
    // ... other dependencies
}
```

## iOS Setup

The library should be automatically linked via CocoaPods. Make sure:

1. Camera permission is in `Info.plist` (should be auto-added from `app.json`)
2. Minimum iOS version is 15.1+

## Features

- ✅ Document scanning with automatic border detection
- ✅ Manual capture mode
- ✅ Flash toggle
- ✅ View scanned documents gallery
- ✅ Delete scanned documents
- ✅ TypeScript support with full type definitions
- ✅ Modern UI with gradient backgrounds

## Requirements

- Node.js v16+
- React Native 0.74+
- Expo SDK 51+
- iOS 15.1+ / Android API 21+

## Notes

- ⚠️ **Test on a real device** - The library requires actual camera hardware (simulators won't work)
- 📱 Camera permissions are required for both iOS and Android
- 🔗 The library is linked from parent directory (`file:..`)

