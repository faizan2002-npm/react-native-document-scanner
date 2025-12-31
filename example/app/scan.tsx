import DocumentScanner from 'react-native-painting-scanner';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert, NativeModules } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Test TurboModule availability
let TurboModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  TurboModule = require('../../src/NativeRNPdfScannerManager').default;
} catch {
  TurboModule = null;
}

export default function Scan() {
  const router = useRouter();
  const scannerRef = useRef<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [stableCounter, setStableCounter] = useState(0);
  const [lastDetectionType, setLastDetectionType] = useState<number | null>(null);

  // Test module on mount
  useEffect(() => {
    const testModule = () => {
      const oldModule = NativeModules.RNPdfScannerManager;
      const newModule = TurboModule;
      
      console.log('=== TurboModule Test ===');
      console.log('Old API (NativeModules):', oldModule ? '✓ Available' : '✗ Not found');
      console.log('New API (TurboModule):', newModule ? '✓ Available' : '✗ Not found (codegen may not have run)');
      
      const activeModule = newModule || oldModule;
      if (activeModule) {
        console.log('Active module methods:', Object.keys(activeModule));
        console.log('✓ Module is ready to use');
      } else {
        console.log('✗ No module available');
      }
    };
    
    testModule();
  }, []);

  const handlePictureTaken = async (data: {
    croppedImage: string;
    initialImage: string;
    rectangleCoordinates: any;
  }) => {
    if (isCapturing) return;

    try {
      setIsCapturing(true);
      console.log("Picture taken:", {
        croppedImage: data.croppedImage?.substring(0, 50),
        hasInitialImage: !!data.initialImage,
        hasCoordinates: !!data.rectangleCoordinates,
      });
      
      // Show success message
      Alert.alert(
        "Scan Successful",
        "Document captured successfully!",
        [{ text: "OK", onPress: () => setIsCapturing(false) }]
      );
    } catch (err) {
      console.error("Capture error", err);
      Alert.alert("Error", "Failed to capture image");
      setIsCapturing(false);
    }
  };

  const handleRectangleDetect = ({ stableCounter, lastDetectionType }: { stableCounter: number; lastDetectionType: number }) => {
    setStableCounter(stableCounter);
    setLastDetectionType(lastDetectionType);
  };

  const handleCapture = () => {
    if (scannerRef.current && stableCounter > 0) {
      scannerRef.current.capture();
    }
  };

  const getDetectionMessage = () => {
    if (stableCounter > 0) {
      return `✓ Ready to capture`;
    }
    
    switch (lastDetectionType) {
      case 1:
        return '⚠ Adjust angle';
      case 2:
        return '⚠ Move closer';
      default:
        return 'Position document in frame';
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <DocumentScanner
          ref={scannerRef}
          useBase64
          captureMultiple={false}
          onPictureTaken={handlePictureTaken}
          overlayColor="rgba(54, 120, 226, 0.28)"
          enableTorch={flashOn}
          onRectangleDetect={handleRectangleDetect}
          detectionCountBeforeCapture={1}
          manualOnly={true}
          style={styles.scanner}
        />
      </SafeAreaView>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={25} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Ionicons
              name={flashOn ? "flash" : "flash-off"}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Detection Status */}
      <View style={styles.detectionStatus}>
        <Text style={styles.detectionText}>
          {getDetectionMessage()}
        </Text>
      </View>

      {/* Bottom Section - Capture Button */}
      <View style={styles.bottomSection}>
        <View style={styles.captureButtonContainer}>
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: isCapturing ? 0.9 : 1 }}
            transition={{ type: "timing", duration: 160 }}
          >
            <TouchableOpacity
              onPress={handleCapture}
              activeOpacity={0.8}
              disabled={stableCounter === 0 || isCapturing}
              style={[
                styles.captureButton,
                { opacity: stableCounter > 0 ? 1 : 0.5 }
              ]}
            >
              <View style={styles.captureButtonInner}>
                <View style={styles.captureButtonCenter} />
              </View>
            </TouchableOpacity>
          </MotiView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  scanner: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectionStatus: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  detectionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButtonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 79,
    height: 79,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 39.5,
    backgroundColor: '#fff',
  },
  captureButtonCenter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
});

