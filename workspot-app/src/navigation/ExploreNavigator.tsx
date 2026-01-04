import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ExploreScreen from '../screens/explore/ExploreScreen';
import CreateSpotScreen from '../screens/spots/CreateSpotScreen';

export type ExploreStackParamList = {
  ExploreMain: undefined;
  CreateSpot: undefined;
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
    </Stack.Navigator>
  );
}
