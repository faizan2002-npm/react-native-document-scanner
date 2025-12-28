#import "DocumentScannerView.h"
#import "IPDFCameraViewController.h"

@implementation DocumentScannerView

- (instancetype)init {
    self = [super init];
    if (self) {
        [self setEnableBorderDetection:YES];
        [self setDelegate: self];
    }

    return self;
}


- (void) didDetectRectangle:(CIRectangleFeature *)rectangle withType:(IPDFRectangeType)type {
    switch (type) {
        case IPDFRectangeTypeGood:
            self.stableCounter ++;
            break;
        default:
            self.stableCounter = 0;
            break;
    }
    if (self.onRectangleDetect) {
        self.onRectangleDetect(@{@"stableCounter": @(self.stableCounter), @"lastDetectionType": @(type)});
    }

    if (self.stableCounter > self.detectionCountBeforeCapture){
        [self capture];
    }
}

- (void) capture {
    [self captureImageWithCompletionHander:^(UIImage *croppedImage, UIImage *initialImage, CIRectangleFeature *rectangleFeature) {
      if (self.onPictureTaken) {
            NSData *croppedImageData = UIImageJPEGRepresentation(croppedImage, self.quality);

            if (initialImage.imageOrientation != UIImageOrientationUp) {
                UIGraphicsBeginImageContextWithOptions(initialImage.size, false, initialImage.scale);
                [initialImage drawInRect:CGRectMake(0, 0, initialImage.size.width
                                                    , initialImage.size.height)];
                initialImage = UIGraphicsGetImageFromCurrentImageContext();
                UIGraphicsEndImageContext();
            }
            NSData *initialImageData = UIImageJPEGRepresentation(initialImage, self.quality);

            /*
             RectangleCoordinates expects a rectanle viewed from portrait,
             while rectangleFeature returns a rectangle viewed from landscape, which explains the nonsense of the mapping below.
             Sorry about that.
             */
            NSDictionary *rectangleCoordinates = rectangleFeature ? @{
                                     @"topLeft": @{ @"y": @(rectangleFeature.bottomLeft.x + 30), @"x": @(rectangleFeature.bottomLeft.y)},
                                     @"topRight": @{ @"y": @(rectangleFeature.topLeft.x + 30), @"x": @(rectangleFeature.topLeft.y)},
                                     @"bottomLeft": @{ @"y": @(rectangleFeature.bottomRight.x), @"x": @(rectangleFeature.bottomRight.y)},
                                     @"bottomRight": @{ @"y": @(rectangleFeature.topRight.x), @"x": @(rectangleFeature.topRight.y)},
                                     } : [NSNull null];
            if (self.useBase64) {
              self.onPictureTaken(@{
                                    @"croppedImage": [croppedImageData base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength],
                                    @"initialImage": [initialImageData base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength],
                                    @"rectangleCoordinates": rectangleCoordinates });
            }
            else {
                NSString *dir = NSTemporaryDirectory();
                if (self.saveInAppDocument) {
                    dir = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject];
                }
               NSString *croppedFilePath = [dir stringByAppendingPathComponent:[NSString stringWithFormat:@"cropped_img_%i.jpeg",(int)[NSDate date].timeIntervalSince1970]];
               NSString *initialFilePath = [dir stringByAppendingPathComponent:[NSString stringWithFormat:@"initial_img_%i.jpeg",(int)[NSDate date].timeIntervalSince1970]];

              [croppedImageData writeToFile:croppedFilePath atomically:YES];
              [initialImageData writeToFile:initialFilePath atomically:YES];

               self.onPictureTaken(@{
                                     @"croppedImage": croppedFilePath,
                                     @"initialImage": initialFilePath,
                                     @"rectangleCoordinates": rectangleCoordinates });
            }
        }

        if (!self.captureMultiple) {
          [self stop];
        }
    }];

}

- (NSString *)reapplyPerspectiveCropToImage:(NSString *)base64Image 
                            withCoordinates:(NSDictionary *)coordinates 
                                    quality:(float)quality {
    @try {
        // Decode base64 to UIImage
        NSData *imageData = [[NSData alloc] initWithBase64EncodedString:base64Image options:0];
        if (!imageData) {
            return nil;
        }
        
        UIImage *originalImage = [UIImage imageWithData:imageData];
        if (!originalImage) {
            return nil;
        }
        
        // Fix orientation if needed
        if (originalImage.imageOrientation != UIImageOrientationUp) {
            UIGraphicsBeginImageContextWithOptions(originalImage.size, false, originalImage.scale);
            [originalImage drawInRect:CGRectMake(0, 0, originalImage.size.width, originalImage.size.height)];
            originalImage = UIGraphicsGetImageFromCurrentImageContext();
            UIGraphicsEndImageContext();
        }
        
        CIImage *ciImage = [CIImage imageWithCGImage:originalImage.CGImage];
        
        // Extract coordinates from dictionary
        // Stored format (portrait view with y/x swapped):
        // topLeft: {y: bottomLeft.x + 30, x: bottomLeft.y}
        // topRight: {y: topLeft.x + 30, x: topLeft.y}
        // bottomLeft: {y: bottomRight.x, x: bottomRight.y}
        // bottomRight: {y: topRight.x, x: topRight.y}
        
        NSDictionary *topLeftDict = coordinates[@"topLeft"];
        NSDictionary *topRightDict = coordinates[@"topRight"];
        NSDictionary *bottomLeftDict = coordinates[@"bottomLeft"];
        NSDictionary *bottomRightDict = coordinates[@"bottomRight"];
        
        if (!topLeftDict || !topRightDict || !bottomLeftDict || !bottomRightDict) {
            return nil;
        }
        
        // Extract stored values
        double storedTopLeftY = [topLeftDict[@"y"] doubleValue];
        double storedTopLeftX = [topLeftDict[@"x"] doubleValue];
        double storedTopRightY = [topRightDict[@"y"] doubleValue];
        double storedTopRightX = [topRightDict[@"x"] doubleValue];
        double storedBottomLeftY = [bottomLeftDict[@"y"] doubleValue];
        double storedBottomLeftX = [bottomLeftDict[@"x"] doubleValue];
        double storedBottomRightY = [bottomRightDict[@"y"] doubleValue];
        double storedBottomRightX = [bottomRightDict[@"x"] doubleValue];
        
        // Reverse the transformation to get back to landscape CIRectangleFeature format:
        // From stored topLeft {y, x} where y = bottomLeft.x + 30, x = bottomLeft.y
        // We get: bottomLeft.x = y - 30, bottomLeft.y = x
        // From stored topRight {y, x} where y = topLeft.x + 30, x = topLeft.y
        // We get: topLeft.x = y - 30, topLeft.y = x
        // From stored bottomLeft {y, x} where y = bottomRight.x, x = bottomRight.y
        // We get: bottomRight.x = y, bottomRight.y = x
        // From stored bottomRight {y, x} where y = topRight.x, x = topRight.y
        // We get: topRight.x = y, topRight.y = x
        
        // Reconstruct landscape CIRectangleFeature points
        CGPoint landscapeTopLeft = CGPointMake(storedTopRightY - 30, storedTopRightX);
        CGPoint landscapeTopRight = CGPointMake(storedBottomRightY, storedBottomRightX);
        CGPoint landscapeBottomLeft = CGPointMake(storedTopLeftY - 30, storedTopLeftX);
        CGPoint landscapeBottomRight = CGPointMake(storedBottomLeftY, storedBottomLeftX);
        
        // Apply perspective correction using the same method as correctPerspectiveForImage
        // This adds +30 offset to left points
        NSMutableDictionary *rectangleCoordinates = [NSMutableDictionary new];
        CGPoint newLeft = CGPointMake(landscapeTopLeft.x + 30, landscapeTopLeft.y);
        CGPoint newRight = CGPointMake(landscapeTopRight.x, landscapeTopRight.y);
        CGPoint newBottomLeft = CGPointMake(landscapeBottomLeft.x + 30, landscapeBottomLeft.y);
        CGPoint newBottomRight = CGPointMake(landscapeBottomRight.x, landscapeBottomRight.y);
        
        rectangleCoordinates[@"inputTopLeft"] = [CIVector vectorWithCGPoint:newLeft];
        rectangleCoordinates[@"inputTopRight"] = [CIVector vectorWithCGPoint:newRight];
        rectangleCoordinates[@"inputBottomLeft"] = [CIVector vectorWithCGPoint:newBottomLeft];
        rectangleCoordinates[@"inputBottomRight"] = [CIVector vectorWithCGPoint:newBottomRight];
        
        CIImage *correctedImage = [ciImage imageByApplyingFilter:@"CIPerspectiveCorrection" withInputParameters:rectangleCoordinates];
        
        // Convert CIImage to UIImage
        CIContext *context = [CIContext contextWithOptions:nil];
        CGImageRef cgImage = [context createCGImage:correctedImage fromRect:correctedImage.extent];
        UIImage *finalImage = [UIImage imageWithCGImage:cgImage];
        CGImageRelease(cgImage);
        
        // Convert to base64
        NSData *finalImageData = UIImageJPEGRepresentation(finalImage, quality);
        NSString *base64Result = [finalImageData base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
        
        return base64Result;
    }
    @catch (NSException *exception) {
        NSLog(@"Error in reapplyPerspectiveCropToImage: %@", exception.reason);
        return nil;
    }
}

@end
