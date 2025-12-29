import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Image,
  Animated,
  ActivityIndicator,
  Platform,
  NativeModules,
  Dimensions
} from 'react-native';
import DocumentScanner from '../index';
import { Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default class ScannerScreen extends Component {
  constructor(props) {
    super(props);
    this.scannerRef = null;
    this.state = {
      flashEnabled: false,
      stableCounter: 0,
      lastDetectionType: null,
      capturedImage: null,
      originalImage: null,
      rectangleCoordinates: null,
      showResult: false,
      isProcessing: false,
      overlayOpacity: new Animated.Value(0),
      captureButtonScale: new Animated.Value(1)
    };
  }

  handlePictureTaken = (data) => {
    // Store both cropped and original images with coordinates
    this.setState({
      capturedImage: data.croppedImage,
      originalImage: data.initialImage,
      rectangleCoordinates: data.rectangleCoordinates,
      showResult: true
    }, () => {
      // Animate result overlay - use the state value after setState
      Animated.timing(this.state.overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.bezier(0.42, 0, 0.58, 1)
      }).start();
    });
  };

  handleRectangleDetect = ({ stableCounter, lastDetectionType }) => {
    this.setState({ stableCounter, lastDetectionType });
  };

  capture = () => {
    if (this.scannerRef && this.state.stableCounter > 0) {
      // Animate button press
      Animated.sequence([
        Animated.timing(this.state.captureButtonScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(this.state.captureButtonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
      
      this.scannerRef.capture();
    }
  };

  retake = () => {
    // Animate overlay out
    Animated.timing(this.state.overlayOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.bezier(0.42, 0, 0.58, 1)
    }).start(() => {
      // Reset all state
      this.setState({
        showResult: false,
        capturedImage: null,
        originalImage: null,
        rectangleCoordinates: null,
        stableCounter: 0,
        lastDetectionType: null,
        isProcessing: false
      });
    });
  };

  editAgain = async () => {
    const { originalImage, rectangleCoordinates, isProcessing } = this.state;
    
    // Prevent multiple simultaneous edits
    if (isProcessing || !originalImage || !rectangleCoordinates) {
      console.warn('Cannot edit: missing data', { 
        isProcessing, 
        hasOriginalImage: !!originalImage, 
        hasCoordinates: !!rectangleCoordinates 
      });
      return;
    }

    try {
      // Show loading state
      this.setState({ isProcessing: true });

      // Call native module to re-apply perspective crop
      const { RNPdfScannerManager } = NativeModules;
      
      if (!RNPdfScannerManager) {
        throw new Error('RNPdfScannerManager not available');
      }

      if (!RNPdfScannerManager.reapplyPerspectiveCrop) {
        throw new Error('reapplyPerspectiveCrop method not available');
      }

      // Get quality from scanner ref if available, otherwise use default
      const quality = this.scannerRef?.props?.quality || 0.8;
      
      // Prepare image input - handle both base64 (iOS) and file paths (Android)
      let imageInput = originalImage;
      
      // Remove data URI prefix if present (iOS base64 format)
      if (imageInput.startsWith('data:image')) {
        imageInput = imageInput.split(',')[1];
      }
      // Android returns file:// paths, which the native module now handles
      
      console.log('Calling reapplyPerspectiveCrop with:', {
        imageInputType: typeof imageInput,
        imageInputLength: imageInput?.length,
        hasCoordinates: !!rectangleCoordinates,
        quality
      });
      
      const croppedImage = await RNPdfScannerManager.reapplyPerspectiveCrop(
        imageInput,
        rectangleCoordinates,
        quality
      );

      if (!croppedImage) {
        throw new Error('Native module returned null/undefined result');
      }

      // Format result based on platform
      // iOS returns base64 string, Android returns base64 string or file path
      let formattedImage = croppedImage;
      if (Platform.OS === 'ios' && !croppedImage.startsWith('data:') && !croppedImage.startsWith('file://')) {
        // iOS returns base64 without prefix, add it for Image component
        formattedImage = `data:image/jpeg;base64,${croppedImage}`;
      }

      // Update captured image
      this.setState({
        capturedImage: formattedImage,
        isProcessing: false
      });

    } catch (error) {
      console.error('Error re-applying crop:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        originalImage: originalImage?.substring(0, 50),
        hasCoordinates: !!rectangleCoordinates
      });
      // Show error message to user (optional)
      this.setState({ isProcessing: false });
    }
  };

  keepScan = () => {
    const { capturedImage, originalImage, rectangleCoordinates } = this.state;
    const { onScanComplete } = this.props;
    
    if (!capturedImage) {
      return; // Don't proceed if no image
    }
    
    if (onScanComplete) {
      onScanComplete({
        croppedImage: capturedImage,
        initialImage: originalImage,
        rectangleCoordinates: rectangleCoordinates
      });
    }
  };

  getDetectionMessage = () => {
    const { lastDetectionType, stableCounter } = this.state;
    
    if (stableCounter > 0) {
      return `✓ Ready to capture`;
    }
    
    switch (lastDetectionType) {
      case 1:
        return '⚠ Adjust angle';
      case 2:
        return '⚠ Move closer';
      default:
        return 'Position painting in frame';
    }
  };

  render() {
    const { 
      flashEnabled, 
      stableCounter, 
      capturedImage, 
      showResult,
      overlayOpacity,
      isProcessing
    } = this.state;

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          
          {/* Scanner - Always visible in background */}
          <DocumentScanner
            ref={(ref) => { this.scannerRef = ref; }}
            useBase64
            captureMultiple={true}
            onPictureTaken={this.handlePictureTaken}
            overlayColor="rgba(54, 120, 226, 0.28)"
            enableTorch={flashEnabled}
            // brightness={1}
            // saturation={1}
            // contrast={1.1}
            // quality={0.8}
            onRectangleDetect={this.handleRectangleDetect}
            detectionCountBeforeCapture={5}
            detectionRefreshRateInMS={30}
            manualOnly={true}
            style={styles.scanner}
          />

          {/* Header - Only show when not showing result */}
          {!showResult && (
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  if (this.props.onBack) {
                    this.props.onBack();
                  }
                }}
              >
                <View style={styles.glassmorphicButton}>
                  <Ionicons name="close" size={25} color="#fff" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.headerRight}>
                <TouchableOpacity 
                  style={styles.glassmorphicButton}
                  onPress={() => this.setState({ flashEnabled: !flashEnabled })}
                >
                  <Ionicons
                    name={flashEnabled ? "flash" : "flash-off"}
                    size={22}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Detection Status - Only show when not showing result */}
          {!showResult && (
            <View style={styles.statusBar}>
              <Text style={styles.statusText}>
                {this.getDetectionMessage()}
              </Text>
            </View>
          )}

          {/* Capture Button - Only show when not showing result */}
          {!showResult && (
            <View style={styles.controls}>
              <Animated.View
                style={[
                  styles.captureButtonContainer,
                  { transform: [{ scale: this.state.captureButtonScale }] }
                ]}
              >
                <TouchableOpacity 
                  style={[
                    styles.captureButton,
                    stableCounter > 0 && styles.captureButtonActive
                  ]}
                  onPress={this.capture}
                  disabled={stableCounter === 0}
                  activeOpacity={0.8}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {/* Result Overlay - Slides in from bottom with gradient */}
          {showResult && (
            <Animated.View 
              style={[
                styles.resultOverlay,
                { 
                  opacity: overlayOpacity,
                  transform: [{
                    translateY: overlayOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height, 0]
                    })
                  }]
                }
              ]}
            >
              <LinearGradient
                colors={["#404040", "#555", "#6B6B6B"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              
              <View style={styles.resultContainer}>
                {/* Top Controls */}
                <View style={styles.resultHeader}>
                  <TouchableOpacity 
                    style={styles.glassmorphicButton}
                    onPress={this.retake}
                  >
                    <Ionicons name="chevron-back" size={22} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.glassmorphicButton,
                      isProcessing && styles.editButtonDisabled
                    ]}
                    onPress={this.editAgain}
                    disabled={isProcessing}
                  >
                    <Ionicons name="create-outline" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Title + Result Image */}
                <View style={styles.resultContent}>
                  <Text style={styles.resultTitle}>Looks good?</Text>

                  {/* Result Image */}
                  <View style={styles.resultImageContainer}>
                    <Image 
                      source={{ 
                        uri: capturedImage.startsWith('data:') || capturedImage.startsWith('file://') 
                          ? capturedImage 
                          : `data:image/jpeg;base64,${capturedImage}`
                      }}
                      style={styles.resultImage}
                      resizeMode="contain"
                    />
                    
                    {/* Loading Indicator */}
                    {isProcessing && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator 
                          size="large" 
                          color="#FFFFFF" 
                        />
                      </View>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.resultActions}>
                  <TouchableOpacity 
                    style={styles.keepScanButton}
                    onPress={this.keepScan}
                  >
                    <Text style={styles.keepScanButtonText}>Keep Scan</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.retakeButton}
                    onPress={this.retake}
                  >
                    <Text style={styles.retakeButtonText}>Retake</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  safeArea: {
    flex: 1
  },
  scanner: {
    flex: 1
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
    zIndex: 10
  },
  backButton: {
    // Container for glassmorphic button
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  glassmorphicButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusBar: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    padding: 15,
    alignItems: 'center',
    zIndex: 10
  },
  statusText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10
  },
  captureButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureButton: {
    width: 79,
    height: 79,
    borderRadius: 39.5,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5
  },
  captureButtonActive: {
    opacity: 1
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E5E5E5'
  },
  resultOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height,
    zIndex: 100
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 64,
    paddingHorizontal: 32
  },
  resultHeader: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 101
  },
  resultContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%'
  },
  resultTitle: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 20,
    fontWeight: '400'
  },
  resultImageContainer: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultImage: {
    width: '100%',
    height: '100%'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultActions: {
    width: '55%',
    alignItems: 'center'
  },
  keepScanButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  keepScanButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '600'
  },
  retakeButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20
  },
  retakeButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '600'
  },
  editButtonDisabled: {
    opacity: 0.5
  }
});

