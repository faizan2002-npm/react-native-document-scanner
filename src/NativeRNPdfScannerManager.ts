/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import type {TurboModule} from 'react-native';
import {TurboModuleRegistry, NativeModules} from 'react-native';

export interface Spec extends TurboModule {
  capture(): void;
  reapplyPerspectiveCrop(
    imageInput: string,
    coordinates: {
      topLeft: {x: number; y: number};
      topRight: {x: number; y: number};
      bottomLeft: {x: number; y: number};
      bottomRight: {x: number; y: number};
    },
    quality: number,
  ): Promise<string>;
}

// Try TurboModule first, fall back to bridge module if not available
const module = TurboModuleRegistry.get<Spec>('RNPdfScannerManager') || 
               NativeModules.RNPdfScannerManager;

export default module as Spec;

