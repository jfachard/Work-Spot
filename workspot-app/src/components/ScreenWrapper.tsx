import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export default function ScreenWrapper({ children, className = '', ...props }: ScreenWrapperProps) {
  const { isDark } = useTheme();

  return (
    <View className={`will-change-variable flex-1 ${isDark ? 'dark' : ''} ${className}`} {...props}>
      {children}
    </View>
  );
}
