import React from "react";
import {
  View,
  Platform,
  PermissionsAndroid,
  DeviceEventEmitter,
  Text,
  requireNativeComponent,
  UIManager,
} from "react-native";
import PropTypes from "prop-types";

// Load native component using requireNativeComponent (works with both old and new architecture)
const RNPdfScannerComponentInterface = {
  propTypes: {
    overlayColor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    enableTorch: PropTypes.bool,
    useFrontCam: PropTypes.bool,
    useBase64: PropTypes.bool,
    saveInAppDocument: PropTypes.bool,
    captureMultiple: PropTypes.bool,
    detectionCountBeforeCapture: PropTypes.number,
    detectionRefreshRateInMS: PropTypes.number,
    saturation: PropTypes.number,
    quality: PropTypes.number,
    brightness: PropTypes.number,
    contrast: PropTypes.number,
    documentAnimation: PropTypes.bool,
    noGrayScale: PropTypes.bool,
    manualOnly: PropTypes.bool,
    onPictureTaken: PropTypes.func,
    onRectangleDetect: PropTypes.func,
    ...View.propTypes, // include the default view properties
  },
};

const RNPdfScanner = requireNativeComponent('RNPdfScanner', RNPdfScannerComponentInterface);

// Verify view registration (for debugging)
if (__DEV__) {
  const viewConfig = UIManager.getViewManagerConfig('RNPdfScanner');
  if (viewConfig) {
    console.log('✓ RNPdfScanner view registered successfully:', Object.keys(viewConfig));
  } else {
    console.error('✗ RNPdfScanner view NOT registered - check native module name matches');
  }
}

// Use TurboModule (new architecture only)
let NativeRNPdfScannerManager;
try {
  const managerSpec = require("./src/NativeRNPdfScannerManager");
  NativeRNPdfScannerManager = managerSpec && managerSpec.default ? managerSpec.default : null;
  if (NativeRNPdfScannerManager) {
    console.log("✓ Using TurboModule for RNPdfScannerManager (new architecture)");
  } else {
    console.warn("⚠ TurboModule default export is null or undefined");
  }
} catch (e) {
  console.error("✗ Failed to load TurboModule:", e.message);
  NativeRNPdfScannerManager = null;
}

const CameraManager = NativeRNPdfScannerManager || {};

class PdfScanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionsAuthorized: Platform.OS === "ios"
    };
  }

  onPermissionsDenied = () => {
    if (this.props.onPermissionsDenied) this.props.onPermissionsDenied();
  };

  componentDidMount() {
    this.getAndroidPermissions();
    if (Platform.OS === "android") {
      const { onPictureTaken, onProcessing } = this.props;
      DeviceEventEmitter.addListener("onPictureTaken", onPictureTaken);
      DeviceEventEmitter.addListener("onProcessingChange", onProcessing);
    }
  }

  async getAndroidPermissions() {
    if (Platform.OS !== "android") return;
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]);

      if (
        granted["android.permission.CAMERA"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.READ_EXTERNAL_STORAGE"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted["android.permission.WRITE_EXTERNAL_STORAGE"] ===
          PermissionsAndroid.RESULTS.GRANTED
      )
        this.setState({ permissionsAuthorized: true });
      else this.onPermissionsDenied();
    } catch (err) {
      console.error("Permission error:", err);
      this.onPermissionsDenied();
    }
  }

  static defaultProps = {
    onPictureTaken: () => {},
    onProcessing: () => {}
  };

  sendOnPictureTakenEvent(event) {
    const nativeEvent = event.nativeEvent;
    // Reconstruct rectangleCoordinates from flattened values for backward compatibility
    if (nativeEvent.topLeftX !== undefined) {
      nativeEvent.rectangleCoordinates = {
        topLeft: { x: nativeEvent.topLeftX, y: nativeEvent.topLeftY },
        topRight: { x: nativeEvent.topRightX, y: nativeEvent.topRightY },
        bottomLeft: { x: nativeEvent.bottomLeftX, y: nativeEvent.bottomLeftY },
        bottomRight: { x: nativeEvent.bottomRightX, y: nativeEvent.bottomRightY },
      };
    }
    return this.props.onPictureTaken(nativeEvent);
  }

  sendOnRectanleDetectEvent(event) {
    if (!this.props.onRectangleDetect) return null;
    return this.props.onRectangleDetect(event.nativeEvent);
  }

  getImageQuality() {
    if (!this.props.quality) return 0.8;
    if (this.props.quality > 1) return 1;
    if (this.props.quality < 0.1) return 0.1;
    return this.props.quality;
  }


  componentWillUnmount() {
    if (Platform.OS === "android") {
      const { onPictureTaken, onProcessing } = this.props;
      DeviceEventEmitter.removeListener("onPictureTaken", onPictureTaken);
      DeviceEventEmitter.removeListener("onProcessingChange", onProcessing);
    }
  }

  capture() {
    // NativeModules.RNPdfScannerManager.capture();
    if (this.state.permissionsAuthorized) CameraManager.capture();
  }

  render() {
    if (!this.state.permissionsAuthorized) return null;
    
    // Render the native component
    return (
      <RNPdfScanner
        {...this.props}
        onPictureTaken={this.sendOnPictureTakenEvent.bind(this)}
        onRectangleDetect={this.sendOnRectanleDetectEvent.bind(this)}
        useFrontCam={this.props.useFrontCam || false}
        brightness={this.props.brightness || 0}
        saturation={this.props.saturation || 1}
        contrast={this.props.contrast || 1}
        quality={this.getImageQuality()}
        detectionCountBeforeCapture={
          this.props.detectionCountBeforeCapture || 5
        }
        detectionRefreshRateInMS={this.props.detectionRefreshRateInMS || 50}
        captureMultiple={this.props.captureMultiple !== undefined ? this.props.captureMultiple : true}
        useBase64={this.props.useBase64 !== undefined ? this.props.useBase64 : true}
      />
    );
  }
}

PdfScanner.propTypes = {
  onPictureTaken: PropTypes.func,
  onRectangleDetect: PropTypes.func,
  overlayColor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  enableTorch: PropTypes.bool,
  useFrontCam: PropTypes.bool,
  useBase64: PropTypes.bool,
  saveInAppDocument: PropTypes.bool,
  saturation: PropTypes.number,
  brightness: PropTypes.number,
  contrast: PropTypes.number,
  detectionCountBeforeCapture: PropTypes.number,
  detectionRefreshRateInMS: PropTypes.number,
  quality: PropTypes.number,
  documentAnimation: PropTypes.bool,
  noGrayScale: PropTypes.bool,
  manualOnly: PropTypes.bool,
  captureMultiple: PropTypes.bool,
  ...View.propTypes // include the default view properties
};

export default PdfScanner;
