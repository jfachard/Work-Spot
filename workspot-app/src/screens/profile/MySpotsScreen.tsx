import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { Spot } from '../../types';
import { userService } from '../../services/userService';
import { useTabBarHeight } from '@/src/hooks/useTabBarHeight';
import ScreenWrapper from '../../components/ScreenWrapper';
import { ArrowLeft, MapPin, Wifi, Zap, Star } from 'lucide-react-native';

interface MySpotsScreenProps {
  navigation: any;
}

export default function MySpotsScreen({ navigation }: MySpotsScreenProps) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tabBarHeight = useTabBarHeight();

  useEffect(() => {
    loadMySpots();
  }, []);

  const loadMySpots = async () => {
    try {
      setLoading(true);
      setError(null);
      const mySpots = await userService.getMySpots();
      setSpots(mySpots);
    } catch (err) {
      setError('Failed to load your spots');
      console.error('Error loading spots:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMySpots();
    setRefreshing(false);
  };

  const renderSpotCard = ({ item }: { item: Spot }) => (
    <TouchableOpacity
      className="bg-surface border-border mb-4 overflow-hidden rounded-2xl border"
      activeOpacity={0.7}
      onPress={() => {
        Alert.alert('Spot', `Détail de ${item.name} (à venir)`);
      }}>
      <View className="relative">
        {item.coverImage ? (
          <Image
            source={{ uri: item.coverImage }}
            style={{ width: '100%', height: 200 }}
            contentFit="cover"
          />
        ) : (
          <View className="bg-surface-soft h-48 w-full items-center justify-center">
            <MapPin size={40} color="#94A3B8" />
          </View>
        )}

        <View className="bg-surface/95 absolute top-3 left-3 rounded-full px-3 py-1.5">
          <Text className="text-text text-xs font-semibold capitalize">
            {item.type.toLowerCase()}
          </Text>
        </View>

        {item.averageRating && item.averageRating > 0 ? (
          <View className="bg-surface/95 absolute top-3 right-3 flex-row items-center rounded-full px-2.5 py-1.5">
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text className="text-text ml-1 text-xs font-bold">
              {item.averageRating.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="p-4">
        <Text className="text-text-title mb-1 text-lg font-bold">{item.name}</Text>

        <View className="mb-3 flex-row items-center">
          <MapPin size={14} color="#94A3B8" />
          <Text className="text-text-muted ml-1.5 text-sm">
            {item.address}, {item.city}
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {item.hasWifi && (
            <View className="bg-surface-soft flex-row items-center rounded-lg px-2.5 py-1">
              <Wifi size={12} color="#2563EB" />
              <Text className="text-text ml-1 text-xs">WiFi</Text>
            </View>
          )}
          {item.hasPower && (
            <View className="bg-surface-soft flex-row items-center rounded-lg px-2.5 py-1">
              <Zap size={12} color="#F59E0B" />
              <Text className="text-text ml-1 text-xs">Prises</Text>
            </View>
          )}
          <View className="bg-surface-soft rounded-lg px-2.5 py-1">
            <Text className="text-text text-xs capitalize">{item.noiseLevel.toLowerCase()}</Text>
          </View>
          <View className="bg-surface-soft rounded-lg px-2.5 py-1">
            <Text className="text-text text-xs capitalize">{item.priceRange.toLowerCase()}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="items-center justify-center py-12">
      <MapPin size={64} color="#94A3B8" />
      <Text className="text-text-subtitle mt-4 text-center text-lg">
        Vous n'avez pas encore créé de spots
      </Text>
      <Text className="text-text-muted mt-2 text-center">
        Commencez à partager vos lieux de travail favoris
      </Text>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="bg-bg flex-1">
          <View className="border-border bg-surface flex-row items-center border-b px-6 pt-16 pb-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <ArrowLeft size={24} color="#334155" strokeWidth={2} />
            </TouchableOpacity>
            <Text className="text-text-title flex-1 text-xl font-bold">Mes Spots</Text>
          </View>
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View className="bg-bg flex-1">
          <View className="border-border bg-surface flex-row items-center border-b px-6 pt-16 pb-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <ArrowLeft size={24} color="#334155" strokeWidth={2} />
            </TouchableOpacity>
            <Text className="text-text-title flex-1 text-xl font-bold">Mes Spots</Text>
          </View>
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-text-subtitle text-center">{error}</Text>
            <TouchableOpacity
              onPress={loadMySpots}
              className="bg-primary mt-4 rounded-lg px-6 py-3">
              <Text className="font-semibold text-white">Réessayer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View className="bg-bg flex-1">
        <View className="border-border bg-surface flex-row items-center border-b px-6 pt-16 pb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <ArrowLeft size={24} color="#334155" strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-text-title flex-1 text-xl font-bold">Mes Spots</Text>
        </View>

        <FlatList
          data={spots}
          renderItem={renderSpotCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </ScreenWrapper>
  );
}
