import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ExploreScreen from '../screens/explore/ExploreScreen';
import CreateSpotScreen from '../screens/spots/CreateSpotScreen';
import SpotDetailScreen from '../screens/spots/SpotDetailScreen';
import AddReviewScreen from '../screens/reviews/AddReviewScreen';

export type ExploreStackParamList = {
  ExploreMain: undefined;
  CreateSpot: undefined;
  SpotDetail: { spotId: string };
  AddReview: { spotId: string; spotName: string };
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen
        name="CreateSpot"
        component={CreateSpotScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
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
