#import "RNPdfScannerModule.h"
#import "DocumentScannerView.h"
#import <React/RCTBridge.h>
#import <React/RCTConvert.h>

@implementation RNPdfScannerModule

RCT_EXPORT_MODULE(RNPdfScannerManager)

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

RCT_EXPORT_METHOD(capture) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSLog(@"RNPdfScannerModule: capture called - view should handle capture internally");
    });
}

RCT_EXPORT_METHOD(reapplyPerspectiveCrop:(NSString *)base64Image
                  coordinates:(NSDictionary *)coordinates
                  quality:(double)quality
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // Process image on background queue to avoid blocking UI
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        DocumentScannerView *tempScannerView = [[DocumentScannerView alloc] init];
        NSString *result = [tempScannerView reapplyPerspectiveCropToImage:base64Image 
                                                       withCoordinates:coordinates 
                                                               quality:(float)quality];
        // Return result on main queue
        dispatch_async(dispatch_get_main_queue(), ^{
            if (result) {
                resolve(result);
            } else {
                reject(@"CROP_ERROR", @"Failed to reapply perspective crop", nil);
            }
        });
    });
}

@end

