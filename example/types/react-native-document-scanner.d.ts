declare module 'react-native-document-scanner' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface ScanResult {
    croppedImage: string;
    initialImage: string;
    rectangleCoordinates?: {
      topLeft?: { x: number; y: number };
      topRight?: { x: number; y: number };
      bottomLeft?: { x: number; y: number };
      bottomRight?: { x: number; y: number };
    };
  }

  export interface RectangleDetectResult {
    stableCounter: number;
    lastDetectionType: 0 | 1 | 2; // 0: correct, 1: wrong angle, 2: too far
  }

  export interface DocumentScannerProps extends ViewProps {
    onPictureTaken?: (data: ScanResult) => void;
    onRectangleDetect?: (data: RectangleDetectResult) => void;
    onPermissionsDenied?: () => void;
    onProcessing?: (isProcessing: boolean) => void;
    overlayColor?: string;
    enableTorch?: boolean;
    useFrontCam?: boolean;
    saturation?: number;
    brightness?: number;
    contrast?: number;
    detectionCountBeforeCapture?: number;
    detectionRefreshRateInMS?: number;
    quality?: number;
    documentAnimation?: boolean;
    noGrayScale?: boolean;
    manualOnly?: boolean;
    captureMultiple?: boolean;
    useBase64?: boolean;
    saveInAppDocument?: boolean;
  }

  export default class DocumentScanner extends Component<DocumentScannerProps> {
    capture(): void;
  }
}

