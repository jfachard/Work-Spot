import React from 'react';
import { View, Text } from 'react-native';

export default function FavoritesScreen() {
  return (
    <View className="flex-1 bg-bg items-center justify-center">
      <Text className="text-2xl font-bold text-text-title">
        Favorites Screen
      </Text>
      <Text className="text-text-muted mt-2">
        (Mes favoris)
      </Text>
    </View>
  );
}