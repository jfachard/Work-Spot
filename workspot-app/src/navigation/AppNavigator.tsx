import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { View, ActivityIndicator } from 'react-native';

import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <View className={`flex-1 bg-bg items-center justify-center ${isDark ? 'dark' : ''}`}>
        <ActivityIndicator size="large" color={isDark ? '#3B82F6' : '#2563EB'} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View className={`flex-1 ${isDark ? 'dark' : ''}`}>
        {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
      </View>
    </NavigationContainer>
  );
}