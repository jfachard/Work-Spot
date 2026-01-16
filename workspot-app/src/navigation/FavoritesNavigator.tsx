import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import SpotDetailScreen from '../screens/spots/SpotDetailScreen';
import AddReviewScreen from '../screens/reviews/AddReviewScreen';

export type FavoritesStackParamList = {
  FavoritesMain: undefined;
  SpotDetail: { spotId: string };
  AddReview: { spotId: string; spotName: string };
};

const Stack = createNativeStackNavigator<FavoritesStackParamList>();

export default function FavoritesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="FavoritesMain" component={FavoritesScreen} />
      <Stack.Screen name="SpotDetail" component={SpotDetailScreen} />
      <Stack.Screen
        name="AddReview"
        component={AddReviewScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}