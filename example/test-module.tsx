/**
 * Test component for TurboModule
 * Add this to your example app to test the module
 */
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import NativeRNPdfScannerManager from '../../src/NativeRNPdfScannerManager';
import { NativeModules } from 'react-native';

export default function TestModule() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
    console.log(message);
  };

  const testOldAPI = async () => {
    addResult('Testing Old API (NativeModules)...');
    try {
      const module = NativeModules.RNPdfScannerManager;
      if (module) {
        addResult('✓ Old API: Module found');
        addResult(`  Methods: ${Object.keys(module).join(', ')}`);
        
        // Test capture (non-blocking)
        if (typeof module.capture === 'function') {
          addResult('✓ Old API: capture() method exists');
          module.capture();
          addResult('  → capture() called (check logs)');
        }
      } else {
        addResult('✗ Old API: Module not found');
      }
    } catch (error: any) {
      addResult(`✗ Old API Error: ${error.message}`);
    }
  };

  const testNewAPI = async () => {
    addResult('Testing New API (TurboModule)...');
    try {
      if (NativeRNPdfScannerManager) {
        addResult('✓ New API: TurboModule found');
        addResult(`  Module type: ${typeof NativeRNPdfScannerManager}`);
        
        if (typeof NativeRNPdfScannerManager.capture === 'function') {
          addResult('✓ New API: capture() method exists');
          NativeRNPdfScannerManager.capture();
          addResult('  → capture() called (check logs)');
        } else {
          addResult('✗ New API: capture() method not found');
        }
        
        if (typeof NativeRNPdfScannerManager.reapplyPerspectiveCrop === 'function') {
          addResult('✓ New API: reapplyPerspectiveCrop() method exists');
        } else {
          addResult('✗ New API: reapplyPerspectiveCrop() method not found');
        }
      } else {
        addResult('✗ New API: TurboModule not available');
        addResult('  (Codegen may not have run - this is OK for old architecture)');
      }
    } catch (error: any) {
      addResult(`✗ New API Error: ${error.message}`);
      addResult('  (This is expected if codegen has not run)');
    }
  };

  const testReapplyCrop = async () => {
    addResult('Testing reapplyPerspectiveCrop()...');
    try {
      const module = NativeRNPdfScannerManager || NativeModules.RNPdfScannerManager;
      
      if (!module || typeof module.reapplyPerspectiveCrop !== 'function') {
        addResult('✗ reapplyPerspectiveCrop not available');
        return;
      }

      // Create test data
      const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // 1x1 red pixel
      const testCoordinates = {
        topLeft: { x: 0, y: 0 },
        topRight: { x: 100, y: 0 },
        bottomLeft: { x: 0, y: 100 },
        bottomRight: { x: 100, y: 100 },
      };

      addResult('  Calling reapplyPerspectiveCrop with test data...');
      const result = await module.reapplyPerspectiveCrop(testImage, testCoordinates, 0.8);
      
      if (result) {
        addResult(`✓ reapplyPerspectiveCrop succeeded`);
        addResult(`  Result length: ${result.length} chars`);
      } else {
        addResult('✗ reapplyPerspectiveCrop returned null');
      }
    } catch (error: any) {
      addResult(`✗ reapplyPerspectiveCrop error: ${error.message}`);
    }
  };

  const runAllTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    addResult('=== Starting TurboModule Tests ===\n');
    
    await testOldAPI();
    addResult('');
    await testNewAPI();
    addResult('');
    await testReapplyCrop();
    
    addResult('\n=== Tests Complete ===');
    setIsTesting(false);
    
    Alert.alert('Tests Complete', `Ran ${testResults.length} test checks. See console for details.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>TurboModule Test</Text>
          <Text style={styles.subtitle}>Test the migrated module</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isTesting ? 'Running Tests...' : 'Run All Tests'}
            onPress={runAllTests}
            disabled={isTesting}
          />
        </View>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
          {testResults.length === 0 && (
            <Text style={styles.placeholder}>No tests run yet. Press "Run All Tests" to start.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
  },
  resultsContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
    color: '#333',
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

