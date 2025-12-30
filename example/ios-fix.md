# iOS Build Fix for expo-font Error

If you're getting the `Color` conforming to `AnyArgument` error, try these steps:

## Option 1: Clean and Reinstall Pods

```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

## Option 2: Update expo-font (if available)

```bash
cd example
npm install expo-font@latest
cd ios && pod install && cd ..
```

## Option 3: Exclude expo-font (if not using custom fonts)

If you're not using custom fonts, you can exclude expo-font by adding to Podfile:

```ruby
target 'DocumentScannerExample' do
  use_expo_modules!
  config = use_native_modules!
  
  # Exclude expo-font if not needed
  pod 'expo-font', :modular_headers => true, :inhibit_warnings => true
```

Then run:
```bash
cd ios && pod install && cd ..
```

## Option 4: Patch the Swift file (temporary workaround)

If the above don't work, you may need to patch the expo-font Swift file directly after pod install.

