require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name          = package["name"]
  s.version       = package["version"]
  s.summary       = package["description"]
  s.homepage      = "https://github.com/faizan2002-npm/react-native-painting-scanner"
  s.license       = package["license"]
  s.authors       = package["author"]
  s.platform      = :ios, "15.1"
  s.source        = { :git => "#{s.homepage}", :tag => "#{s.version}" }
  s.source_files  = "ios/**/*.{h,m,mm}"
  s.requires_arc  = true
  s.dependency 'React-Core'
  
  # Fabric and TurboModule dependencies
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' || ENV['USE_FABRIC'] == '1'
    s.dependency 'React-Codegen'
    s.dependency 'React-RCTFabric'
    s.dependency 'ReactCommon/turbomodule/core'
  end
  
  # Set C++17 for all builds (needed for React Native new architecture)
  base_config = {
    "CLANG_CXX_LANGUAGE_STANDARD" => "c++17",
    "CLANG_CXX_LIBRARY" => "libc++"
  }
  
  # Use codegen for new architecture
  if ENV['RCT_NEW_ARCH_ENABLED'] == '1' || ENV['USE_FABRIC'] == '1'
    s.compiler_flags = "-DRCT_NEW_ARCH_ENABLED=1"
    # React Native codegen generates headers in build/generated/ios/RNPdfScannerSpec/
    # The import <RNPdfScannerSpec/...> format requires the header search paths to include
    # the codegen output directory. React Native's build system should run codegen automatically.
    base_config.merge!({
      "HEADER_SEARCH_PATHS" => "\"$(PODS_ROOT)/React-Codegen/React_Codegen.framework/Headers\" \"$(PODS_TARGET_SRCROOT)/build/generated/ios\" \"$(PODS_ROOT)/Headers/Public/ReactCodegen\" \"$(PODS_ROOT)/Headers/Private/ReactCodegen\"",
      "GCC_PREPROCESSOR_DEFINITIONS" => "$(inherited) RCT_NEW_ARCH_ENABLED=1"
    })
  end
  
  s.pod_target_xcconfig = base_config
end