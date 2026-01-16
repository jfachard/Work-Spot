import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, Wifi, Zap, Star, Heart, HeartOff } from 'lucide-react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { favoritesService } from '../../services/favoritesService';
import { Favorite } from '../../types';
import type { FavoritesStackParamList } from '../../navigation/FavoritesNavigator';

type NavigationProps = NativeStackNavigationProp<FavoritesStackParamList>;

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const navigation = useNavigation<NavigationProps>();

  const loadFavorites = async () => {
    try {
      const data = await favoritesService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  const handleRemoveFavorite = async (favorite: Favorite) => {
    Alert.alert(
      'Retirer des favoris',
      `Voulez-vous retirer "${favorite.spot.name}" de vos favoris ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            setRemovingIds((prev) => new Set(prev).add(favorite.id));
            try {
              await favoritesService.removeFavorite(favorite.id);
              setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Erreur', 'Impossible de retirer ce favori');
            } finally {
              setRemovingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(favorite.id);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  const renderSpotCard = ({ item }: { item: Favorite }) => {
    const spot = item.spot;
    const isRemoving = removingIds.has(item.id);

    return (
      <TouchableOpacity
        className="bg-surface mb-4 overflow-hidden rounded-2xl shadow-sm"
        activeOpacity={0.7}
        onPress={() => navigation.navigate('SpotDetail', { spotId: spot.id })}
        disabled={isRemoving}
      >
        <View className="relative">
          <Image
            source={{ uri: spot.coverImage || 'https://via.placeholder.com/400x200' }}
            className="h-40 w-full"
            contentFit="cover"
          />
          <TouchableOpacity
            className="absolute top-3 right-3 h-10 w-10 items-center justify-center rounded-full bg-surface-soft"
            onPress={() => handleRemoveFavorite(item)}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Heart size={20} color="#EF4444" fill="#EF4444" />
            )}
          </TouchableOpacity>
          {spot.verified && (
            <View className="absolute bottom-3 left-3 rounded-full bg-green-500 px-2 py-1">
              <Text className="text-xs font-semibold text-white">Vérifié</Text>
            </View>
          )}
        </View>

        <View className="p-4">
          <View className="mb-2">
            <Text className="text-text-title text-lg font-bold" numberOfLines={1}>
              {spot.name}
            </Text>
            {spot.averageRating !== undefined && spot.averageRating > 0 && (
              <View className="mt-1 flex-row items-center">
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-text-title ml-1 text-sm font-semibold">
                  {spot.averageRating.toFixed(1)}
                </Text>
                <Text className="text-text-muted ml-1 text-xs">({spot.reviewCount} avis)</Text>
              </View>
            )}
          </View>

          <View className="mb-3 flex-row items-center">
            <MapPin size={14} color="#94A3B8" />
            <Text className="text-text-muted ml-1 flex-1 text-sm" numberOfLines={1}>
              {spot.address}, {spot.city}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            {spot.hasWifi && (
              <View className="flex-row items-center rounded-full bg-blue-100 px-2 py-1">
                <Wifi size={12} color="#2563EB" />
                <Text className="ml-1 text-xs font-medium text-blue-600">WiFi</Text>
              </View>
            )}
            {spot.hasPower && (
              <View className="flex-row items-center rounded-full bg-amber-100 px-2 py-1">
                <Zap size={12} color="#D97706" />
                <Text className="ml-1 text-xs font-medium text-amber-600">Prises</Text>
              </View>
            )}
            <View className="bg-surface-soft rounded-full px-2 py-1">
              <Text className="text-text-muted text-xs font-medium">
                {spot.type === 'CAFE' && 'Café'}
                {spot.type === 'LIBRARY' && 'Bibliothèque'}
                {spot.type === 'COWORKING' && 'Coworking'}
                {spot.type === 'PARK' && 'Parc'}
                {spot.type === 'OTHER' && 'Autre'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="bg-surface-soft mb-4 h-20 w-20 items-center justify-center rounded-full">
        <HeartOff size={40} color="#94A3B8" />
      </View>
      <Text className="text-text-title mb-2 text-xl font-bold">Aucun favori</Text>
      <Text className="text-text-muted text-center">
        Explorez les spots et ajoutez-les à vos favoris en appuyant sur le coeur
      </Text>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper className="bg-bg items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-bg">
      <View className="flex-1 px-4 pt-4 mt-7">
        <View className="mb-4">
          <Text className="text-text-title text-2xl font-bold">Mes favoris</Text>
          {favorites.length > 0 && (
            <Text className="text-text-muted mt-1">
              {favorites.length} spot{favorites.length > 1 ? 's' : ''} sauvegardé
              {favorites.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {favorites.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderSpotCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
}