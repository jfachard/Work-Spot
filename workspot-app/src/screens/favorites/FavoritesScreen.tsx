import React from 'react';
import { Text } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function FavoritesScreen() {
  return (
    <ScreenWrapper className="bg-bg items-center justify-center">
      <Text className="text-2xl font-bold text-text-title">
        Favorites Screen
      </Text>
      <Text className="text-text-muted mt-2">
        (Mes favoris)
      </Text>
    </ScreenWrapper>
  );
}