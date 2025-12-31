package com.documentscanner;

import android.app.Activity;

import com.documentscanner.views.MainView;
import com.documentscanner.views.OpenNoteCameraView;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

// Fabric imports - these will be available after codegen runs
// import com.facebook.react.bridge.ReadableMap;
// import com.facebook.react.viewmanagers.RNPdfScannerViewManagerDelegate;
// import com.facebook.react.viewmanagers.RNPdfScannerViewManagerInterface;

import javax.annotation.Nullable;

/**
 * Created by Andre on 29/11/2017.
 * Migrated to support both old and new architecture.
 * Note: For new architecture, codegen will generate RNPdfScannerViewManagerInterface
 * which this class should implement. Uncomment the import and interface implementation
 * after codegen has run.
 */

public class DocumentScannerViewManager extends ViewGroupManager<MainView>
        /* implements RNPdfScannerViewManagerInterface<MainView> */ {

    public static final String REACT_CLASS = "RNPdfScanner";
    private MainView view = null;

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected MainView createViewInstance(final ThemedReactContext reactContext) {
        Activity activity = reactContext.getCurrentActivity();
        if (activity == null) {
            throw new RuntimeException("Cannot get current activity for DocumentScanner");
        }
        MainView.createInstance(reactContext, activity);

        view = MainView.getInstance();
        if (view == null) {
            throw new RuntimeException("Failed to create MainView instance");
        }
        view.setOnProcessingListener(new OpenNoteCameraView.OnProcessingListener() {
            @Override
            public void onProcessingChange(WritableMap data) {
                dispatchEvent(reactContext, "onProcessingChange", data);
            }
        });

        view.setOnScannerListener(new OpenNoteCameraView.OnScannerListener() {
            @Override
            public void onPictureTaken(WritableMap data) {
                dispatchEvent(reactContext, "onPictureTaken", data);
            }
        });

        return view;
    }

    private void dispatchEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    @ReactProp(name = "documentAnimation", defaultBoolean = false)
    public void setDocumentAnimation(MainView view, boolean animate) {
        view.setDocumentAnimation(animate);
    }

    @ReactProp(name = "overlayColor")
    public void setOverlayColor(MainView view, String rgbaColor) {
        view.setOverlayColor(rgbaColor);
    }

    @ReactProp(name = "detectionCountBeforeCapture", defaultInt = 15)
    public void setDetectionCountBeforeCapture(MainView view, int numberOfRectangles) {
        view.setDetectionCountBeforeCapture(numberOfRectangles);
    }

    @ReactProp(name = "enableTorch", defaultBoolean = false)
    public void setEnableTorch(MainView view, Boolean enable) {
        view.setEnableTorch(enable);
    }

    @ReactProp(name = "manualOnly", defaultBoolean = false)
    public void setManualOnly(MainView view, Boolean manualOnly) {
        view.setManualOnly(manualOnly);
    }

    @ReactProp(name = "brightness", defaultDouble = 10)
    public void setBrightness(MainView view, double brightness) {
        view.setBrightness(brightness);
    }

    @ReactProp(name = "contrast", defaultDouble = 1)
    public void setContrast(MainView view, double contrast) {
        view.setContrast(contrast);
    }

    @ReactProp(name = "noGrayScale", defaultBoolean = false)
    public void setRemoveGrayScale(MainView view, boolean bw) {
        view.setRemoveGrayScale(bw);
    }

    // Additional props from codegen spec
    @ReactProp(name = "useFrontCam", defaultBoolean = false)
    public void setUseFrontCam(MainView view, boolean useFrontCam) {
        // MainView doesn't have this method, but it's in the spec
        // This would need to be added to MainView if needed
    }

    @ReactProp(name = "useBase64", defaultBoolean = true)
    public void setUseBase64(MainView view, boolean useBase64) {
        // MainView doesn't have this method, but it's in the spec
    }

    @ReactProp(name = "saveInAppDocument", defaultBoolean = false)
    public void setSaveInAppDocument(MainView view, boolean saveInAppDocument) {
        // MainView doesn't have this method, but it's in the spec
    }

    @ReactProp(name = "captureMultiple", defaultBoolean = true)
    public void setCaptureMultiple(MainView view, boolean captureMultiple) {
        // MainView doesn't have this method, but it's in the spec
    }

    @ReactProp(name = "detectionRefreshRateInMS", defaultInt = 50)
    public void setDetectionRefreshRateInMS(MainView view, int rate) {
        // MainView doesn't have this method, but it's in the spec
    }

    @ReactProp(name = "saturation", defaultDouble = 1.0)
    public void setSaturation(MainView view, double saturation) {
        // MainView doesn't have this method, but it's in the spec
    }

    @ReactProp(name = "quality", defaultDouble = 0.8)
    public void setQuality(MainView view, double quality) {
        // MainView doesn't have this method, but it's in the spec
    }

    // Fabric interface methods - uncomment after codegen generates RNPdfScannerViewManagerInterface
    // These methods will be required when implementing RNPdfScannerViewManagerInterface
    /*
    @Override
    public void setOverlayColor(MainView view, @Nullable Integer overlayColor) {
        if (overlayColor != null) {
            String colorStr = String.format("#%08X", overlayColor);
            view.setOverlayColor(colorStr);
        }
    }

    @Override
    public void setEnableTorch(MainView view, boolean enableTorch) {
        view.setEnableTorch(enableTorch);
    }

    @Override
    public void setUseFrontCam(MainView view, boolean useFrontCam) {
        // Implementation needed in MainView
    }

    @Override
    public void setUseBase64(MainView view, boolean useBase64) {
        // Implementation needed in MainView
    }

    @Override
    public void setSaveInAppDocument(MainView view, boolean saveInAppDocument) {
        // Implementation needed in MainView
    }

    @Override
    public void setCaptureMultiple(MainView view, boolean captureMultiple) {
        // Implementation needed in MainView
    }

    @Override
    public void setDetectionCountBeforeCapture(MainView view, int detectionCountBeforeCapture) {
        view.setDetectionCountBeforeCapture(detectionCountBeforeCapture);
    }

    @Override
    public void setDetectionRefreshRateInMS(MainView view, int detectionRefreshRateInMS) {
        // Implementation needed in MainView
    }

    @Override
    public void setSaturation(MainView view, double saturation) {
        // Implementation needed in MainView
    }

    @Override
    public void setQuality(MainView view, double quality) {
        // Implementation needed in MainView
    }

    @Override
    public void setBrightness(MainView view, double brightness) {
        view.setBrightness(brightness);
    }

    @Override
    public void setContrast(MainView view, double contrast) {
        view.setContrast(contrast);
    }

    @Override
    public void setDocumentAnimation(MainView view, boolean documentAnimation) {
        view.setDocumentAnimation(documentAnimation);
    }

    @Override
    public void setNoGrayScale(MainView view, boolean noGrayScale) {
        view.setRemoveGrayScale(noGrayScale);
    }

    @Override
    public void setManualOnly(MainView view, boolean manualOnly) {
        view.setManualOnly(manualOnly);
    }
    */

}
