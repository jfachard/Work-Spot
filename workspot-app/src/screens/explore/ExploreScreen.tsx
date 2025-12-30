import React from 'react';
import { Text } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function ExploreScreen() {
  return (
    <ScreenWrapper className="bg-bg items-center justify-center">
      <Text className="text-2xl font-bold text-text-title">
        Explore Screen
      </Text>
      <Text className="text-text-muted mt-2">
        (Liste des spots)
      </Text>
    </ScreenWrapper>
  );
}