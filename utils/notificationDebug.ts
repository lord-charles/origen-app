import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEBUG_KEY = 'notification_debug_logs';
const MAX_LOGS = 50;

export interface NotificationDebugLog {
  timestamp: string;
  type: 'received' | 'response' | 'error' | 'token';
  data: any;
  deviceInfo: {
    platform: string;
    version: string;
    isDevice: boolean;
  };
}

export const logNotificationDebug = async (
  type: NotificationDebugLog['type'],
  data: any
) => {
  try {
    // Only log in development or if explicitly enabled in production
    const debugEnabled = await AsyncStorage.getItem('enable_notification_debug');
    if (!__DEV__ && !debugEnabled) return;

    const existingLogs = JSON.parse(
      (await AsyncStorage.getItem(DEBUG_KEY)) || '[]'
    ) as NotificationDebugLog[];

    const newLog: NotificationDebugLog = {
      timestamp: new Date().toISOString(),
      type,
      data,
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version.toString(),
        isDevice: Constants.isDevice,
      },
    };

    // Keep only the latest logs
    const updatedLogs = [newLog, ...existingLogs].slice(0, MAX_LOGS);
    await AsyncStorage.setItem(DEBUG_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Error logging notification debug:', error);
  }
};

export const getNotificationLogs = async (): Promise<NotificationDebugLog[]> => {
  try {
    const logs = await AsyncStorage.getItem(DEBUG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error getting notification logs:', error);
    return [];
  }
};

export const clearNotificationLogs = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DEBUG_KEY);
  } catch (error) {
    console.error('Error clearing notification logs:', error);
  }
};
