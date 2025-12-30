import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import DocumentScanner from 'react-native-document-scanner';
import type { ScanResult } from './types/react-native-document-scanner';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedImages, setScannedImages] = useState<ScanResult[]>([]);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [stableCounter, setStableCounter] = useState(0);
  const scannerRef = React.useRef<DocumentScanner>(null);

  const handlePictureTaken = (data: ScanResult) => {
    setScannedImages((prev) => [...prev, data]);
    setShowScanner(false);
    Alert.alert('Success', 'Document scanned successfully!');
  };

  const handleRectangleDetect = ({ stableCounter: counter }: { stableCounter: number }) => {
    setStableCounter(counter);
  };

  const capture = () => {
    if (scannerRef.current && stableCounter > 0) {
      scannerRef.current.capture();
    }
  };

  const handlePermissionsDenied = () => {
    Alert.alert('Permissions Denied', 'Camera permissions are required to scan documents.');
    setShowScanner(false);
  };

  if (showScanner) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <DocumentScanner
            ref={scannerRef}
            useBase64
            captureMultiple={true}
            onPictureTaken={handlePictureTaken}
            overlayColor="rgba(54, 120, 226, 0.28)"
            enableTorch={flashEnabled}
            onRectangleDetect={handleRectangleDetect}
            detectionCountBeforeCapture={5}
            detectionRefreshRateInMS={30}
            manualOnly={true}
            onPermissionsDenied={handlePermissionsDenied}
            style={styles.scanner}
          />

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowScanner(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setFlashEnabled(!flashEnabled)}
            >
              <Ionicons
                name={flashEnabled ? 'flash' : 'flash-off'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.statusBar}>
            <Text style={styles.statusText}>
              {stableCounter > 0
                ? '✓ Ready to capture'
                : 'Position document in frame'}
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                stableCounter > 0 && styles.captureButtonActive,
              ]}
              onPress={capture}
              disabled={stableCounter === 0}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.gradient}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>Document Scanner</Text>
            <Text style={styles.subtitle}>
              Test the react-native-document-scanner library
            </Text>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setShowScanner(true)}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </TouchableOpacity>

            {scannedImages.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>
                  Scanned Documents ({scannedImages.length})
                </Text>
                {scannedImages.map((result, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{
                        uri:
                          result.croppedImage.startsWith('data:') ||
                          result.croppedImage.startsWith('file://')
                            ? result.croppedImage
                            : `data:image/jpeg;base64,${result.croppedImage}`,
                      }}
                      style={styles.scannedImage}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        setScannedImages((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <Ionicons name="trash" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scanner: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    padding: 15,
    alignItems: 'center',
    zIndex: 10,
  },
  statusText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  captureButtonActive: {
    opacity: 1,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 40,
    textAlign: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 40,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  resultsContainer: {
    width: '100%',
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 5,
  },
  scannedImage: {
    width: '100%',
    height: 300,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

