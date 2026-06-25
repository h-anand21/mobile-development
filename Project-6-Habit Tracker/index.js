// Custom Entry point to shim missing native modules in Expo Go
try {
  const expoModulesCore = require('expo-modules-core');
  if (expoModulesCore && expoModulesCore.requireNativeModule) {
    const originalRequireNativeModule = expoModulesCore.requireNativeModule;
    
    // Create a recursive mock proxy that resolves dummy values and returns chainable functions
    const createMockProxy = (name) => {
      const mock = () => Promise.resolve();
      return new Proxy(mock, {
        get: (target, prop) => {
          if (prop === 'then') return undefined;
          if (prop === 'addListener') {
            return () => ({ remove: () => {} });
          }
          return createMockProxy(`${name}.${String(prop)}`);
        }
      });
    };

    expoModulesCore.requireNativeModule = (moduleName) => {
      try {
        return originalRequireNativeModule(moduleName);
      } catch (error) {
        console.warn(`[Expo Go Shim] Native module "${moduleName}" is missing in Expo Go. Returning mock proxy.`);
        return createMockProxy(moduleName);
      }
    };
  }
} catch (e) {
  console.warn('Failed to shim requireNativeModule:', e);
}

// Shim warnOfExpoGoPushUsage to prevent crash in expo-notifications
try {
  const warnModule = require('expo-notifications/build/warnOfExpoGoPushUsage');
  if (warnModule) {
    warnModule.warnOfExpoGoPushUsage = () => {
      // Do nothing, bypass warning crash
    };
  }
} catch (e) {}

// Load the original expo-router entry point
import 'expo-router/entry';
