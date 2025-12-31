#import "RNPdfScannerManager.h"
#import "DocumentScannerView.h"
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTViewManager.h>

@implementation RNPdfScannerManager

RCT_EXPORT_MODULE(RNPdfScanner)

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (UIView *)view
{
    DocumentScannerView *view = [[DocumentScannerView alloc] initWithFrame:CGRectZero];
    return view;
}

// Export view properties for both old and new architecture
// requireNativeComponent works with both, but needs these properties defined
RCT_EXPORT_VIEW_PROPERTY(onPictureTaken, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onRectangleDetect, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(overlayColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(enableTorch, BOOL)
RCT_EXPORT_VIEW_PROPERTY(useFrontCam, BOOL)
RCT_EXPORT_VIEW_PROPERTY(useBase64, BOOL)
RCT_EXPORT_VIEW_PROPERTY(saveInAppDocument, BOOL)
RCT_EXPORT_VIEW_PROPERTY(captureMultiple, BOOL)
RCT_EXPORT_VIEW_PROPERTY(detectionCountBeforeCapture, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(detectionRefreshRateInMS, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(saturation, float)
RCT_EXPORT_VIEW_PROPERTY(quality, float)
RCT_EXPORT_VIEW_PROPERTY(brightness, float)
RCT_EXPORT_VIEW_PROPERTY(contrast, float)
RCT_EXPORT_VIEW_PROPERTY(documentAnimation, BOOL)
RCT_EXPORT_VIEW_PROPERTY(noGrayScale, BOOL)
RCT_EXPORT_VIEW_PROPERTY(manualOnly, BOOL)

@end
