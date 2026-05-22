import axios from 'axios';
import { Platform, NativeModules } from 'react-native';

const getBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5002/api';
  }

  // 1. Use env variable set in .env (most reliable, works on any device/emulator)
  const envHost = process.env.EXPO_PUBLIC_API_HOST;
  if (envHost) {
    return `http://${envHost}:5002/api`;
  }

  try {
    // scriptURL looks like: http://10.212.87.72:8081/index.bundle?...
    // We use string parsing — new URL() is NOT available in React Native's Hermes engine
    const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
    if (scriptURL && scriptURL.includes('://')) {
      // Strip protocol → "10.212.87.72:8081/index.bundle?..."
      const withoutProtocol = scriptURL.split('://')[1];
      // Strip path → "10.212.87.72:8081"
      const hostWithPort = withoutProtocol?.split('/')[0];
      // Strip port → "10.212.87.72"
      const host = hostWithPort?.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:5002/api`;
      }
    }
  } catch (_) {
    // Parsing failed — fall through to platform defaults
  }

  // Platform defaults
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5002/api';
  }
  return 'http://localhost:5002/api';
};

export const API_URL = getBaseUrl();

console.log('[API] Base URL resolved to:', API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Unpack the unified response format used in the backend
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Centralized error handling
    if (error.response) {
      console.error('[API Error Response]', error.response.data);
    } else if (error.request) {
      console.error('[API Error Request] URL:', error.config?.url, '| Status:', error.request.status);
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
