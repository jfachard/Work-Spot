import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet } from 'react-native';
import { Map, Heart, User } from 'lucide-react-native';
import ExploreScreen from '../screens/explore/ExploreScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type TabParamList = {
  Explore: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 88,
          paddingBottom: 24,
          paddingTop: 12,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              ...StyleSheet.absoluteFillObject,
              overflow: 'hidden',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -4,
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explorer',
          tabBarIcon: ({ color, size, focused }) => (
            <Map 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favoris',
          tabBarIcon: ({ color, size, focused }) => (
            <Heart 
              color={color} 
              size={focused ? 26 : 24}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? color : 'none'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <User 
              color={color} 
              size={focused ? 26 : 24}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}