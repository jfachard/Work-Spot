import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Wifi,
  Zap,
  Star,
  Plus,
  List,
  Map as MapIcon,
  Heart,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { spotsService } from '../../services/spotsService';
import { Spot } from '../../types';

type ViewMode = 'list' | 'map';

export default function ExploreScreen() {
  const navigation = useNavigation();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    loadSpots();
  }, []);

  const loadSpots = async () => {
    try {
      setLoading(true);
      const data = await spotsService.getSpots();
      setSpots(data);
    } catch (error) {
      console.error('Error loading spots:', error);
      Alert.alert('Erreur', 'Impossible de charger les spots');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSpots();
    setRefreshing(false);
  };

  // Filtrer les spots par recherche
  const filteredSpots = spots.filter(
    (spot) =>
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSpotCard = ({ item }: { item: Spot }) => (
    <TouchableOpacity
      className="bg-surface border-border mb-4 overflow-hidden rounded-2xl border"
      activeOpacity={0.7}
      onPress={() => {
        // Navigation vers le détail (à créer plus tard)
        Alert.alert('Spot', `Détail de ${item.name} (à venir)`);
      }}>
      {/* Image */}
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

        {/* Badge type */}
        <View className="bg-surface/95 absolute top-3 left-3 rounded-full px-3 py-1.5">
          <Text className="text-text text-xs font-semibold capitalize">
            {item.type.toLowerCase()}
          </Text>
        </View>

        {/* Rating */}
        {item.averageRating && item.averageRating > 0 ? (
          <View className="bg-surface/95 absolute top-3 right-3 flex-row items-center rounded-full px-2.5 py-1.5">
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <Text className="text-text ml-1 text-xs font-bold">
              {item.averageRating.toFixed(1)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Contenu */}
      <View className="p-4">
        <Text className="text-text-title mb-1 text-lg font-bold">{item.name}</Text>

        <View className="mb-3 flex-row items-center">
          <MapPin size={14} color="#94A3B8" />
          <Text className="text-text-muted ml-1.5 text-sm">
            {item.address}, {item.city}
          </Text>
        </View>

        {/* Tags */}
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
    <View className="flex-1 items-center justify-center py-20">
      <View className="bg-surface-soft mb-4 h-20 w-20 items-center justify-center rounded-full">
        <MapPin size={32} color="#94A3B8" />
      </View>
      <Text className="text-text-title mb-2 text-xl font-bold">Aucun spot trouvé</Text>
      <Text className="text-text-muted px-8 text-center text-sm">
        Soyez le premier à ajouter un spot dans cette zone !
      </Text>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="bg-bg flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View className="bg-bg flex-1">
        {/* Header */}
        <View className="bg-bg border-border border-b px-6 pt-12 pb-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-text-title text-3xl font-bold">Work Spot</Text>
              <Text className="text-text-muted mt-1 text-sm">
                {filteredSpots.length} spot{filteredSpots.length > 1 ? 's' : ''} disponible
                {filteredSpots.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View className="mb-3 flex-row gap-2">
            <View className="bg-surface border-border flex-1 flex-row items-center rounded-xl border px-4 py-3">
              <Search size={20} color="#94A3B8" />
              <TextInput
                className="text-text ml-2 flex-1"
                placeholder="Rechercher un lieu..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity
              className="bg-surface border-border w-12 items-center justify-center rounded-xl border"
              activeOpacity={0.7}
              onPress={() => Alert.alert('Filtres', 'À venir')}>
              <SlidersHorizontal size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Toggle List/Map */}
          <View className="bg-surface-soft flex-row rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center rounded-lg py-2 ${
                viewMode === 'list' ? 'bg-surface shadow-sm' : ''
              }`}
              onPress={() => setViewMode('list')}
              activeOpacity={0.7}>
              <List size={18} color={viewMode === 'list' ? '#2563EB' : '#94A3B8'} strokeWidth={2} />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  viewMode === 'list' ? 'text-primary' : 'text-text-muted'
                }`}>
                Liste
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center rounded-lg py-2 ${
                viewMode === 'map' ? 'bg-surface shadow-sm' : ''
              }`}
              onPress={() => setViewMode('map')}
              activeOpacity={0.7}>
              <MapIcon
                size={18}
                color={viewMode === 'map' ? '#2563EB' : '#94A3B8'}
                strokeWidth={2}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  viewMode === 'map' ? 'text-primary' : 'text-text-muted'
                }`}>
                Carte
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {viewMode === 'list' ? (
          <FlatList
            data={filteredSpots}
            renderItem={renderSpotCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={renderEmptyState}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <MapIcon size={48} color="#94A3B8" />
            <Text className="text-text-muted mt-4">Vue carte (à venir)</Text>
          </View>
        )}

        {/* FAB - Create Spot */}
        <TouchableOpacity
          className="bg-primary absolute right-6 bottom-6 h-14 w-14 items-center justify-center rounded-full shadow-lg"
          activeOpacity={0.7}
          onPress={() => Alert.alert('Créer un spot', 'À venir')}>
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
