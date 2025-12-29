import React from 'react';
import { View, Text } from 'react-native';

export default function RegisterScreen() {
  return (
    <View className="flex-1 bg-[--color-bg] items-center justify-center">
      <Text className="text-2xl font-bold text-[--color-text-title]">
        Register Screen
      </Text>
      <Text className="text-[--color-text-muted] mt-2">
        (En cours de développement)
      </Text>
    </View>
  );
}