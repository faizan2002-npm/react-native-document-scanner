import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default class CropScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageKey: 0,
      containerSize: { width: width * 0.9, height: width * 0.9 }
    };
  }

  componentDidMount() {
    // Force image reload when photo changes
    if (this.props.photo) {
      this.setState(prevState => ({
        imageKey: prevState.imageKey + 1
      }));
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.photo !== this.props.photo) {
      this.setState(prevState => ({
        imageKey: prevState.imageKey + 1
      }));
    }
  }

  render() {
    const { photo, onBack, onEdit, onKeepScan, onRetake, isProcessing } = this.props;
    const { imageKey, containerSize } = this.state;
    
    const imageUri = photo || "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?auto=format&fit=crop&w=800&q=60";

    return (
      <LinearGradient
        colors={["#404040", "#555", "#6B6B6B"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Top Controls */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBack}
              style={styles.glassmorphicButton}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>

            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                style={[
                  styles.glassmorphicButton,
                  isProcessing && styles.editButtonDisabled
                ]}
                disabled={isProcessing}
              >
                <Ionicons name="create-outline" size={22} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Title + Crop Image */}
          <View style={styles.content}>
            <Text style={styles.title}>Looks good?</Text>

            {/* Image Container */}
            <View
              style={[
                styles.imageContainer,
                {
                  width: containerSize.width,
                  height: containerSize.height,
                }
              ]}
            >
              <Image
                key={`${imageUri}-${imageKey}`}
                source={{ uri: imageUri }}
                resizeMode="contain"
                style={[
                  styles.image,
                  {
                    width: containerSize.width,
                    height: containerSize.height,
                  }
                ]}
                onError={(error) => {
                  console.error("Image load error:", error.nativeEvent.error, imageUri);
                }}
                onLoad={() => {
                  console.log("Image loaded successfully:", imageUri);
                }}
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

          {/* Buttons */}
          <View style={styles.actions}>
            {/* Keep Scan Button */}
            <TouchableOpacity
              style={styles.keepScanButton}
              onPress={onKeepScan}
            >
              <Text style={styles.keepScanButtonText}>Keep Scan</Text>
            </TouchableOpacity>

            {/* Retake Button */}
            <TouchableOpacity
              onPress={onRetake}
              style={styles.retakeButton}
            >
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    height: height
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 64,
    paddingHorizontal: 32
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
  glassmorphicButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  editButtonDisabled: {
    opacity: 0.5
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 32
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 20,
    fontWeight: '400'
  },
  imageContainer: {
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
  image: {
    // Image styles handled inline
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
  actions: {
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
  }
});

