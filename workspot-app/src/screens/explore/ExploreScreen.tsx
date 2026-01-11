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
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; // ← Ajoute ça
import * as Location from 'expo-location'; // ← Ajoute ça
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/ScreenWrapper';
import { spotsService } from '../../services/spotsService';
import { favoritesService } from '../../services/favoritesService';
import { Spot } from '../../types';
import { useTheme } from '../../contexts/ThemeContext'; // ← Ajoute ça
import type { ExploreStackParamList } from '../../navigation/ExploreNavigator';

type NavigationProps = NativeStackNavigationProp<ExploreStackParamList>;

type ViewMode = 'list' | 'map';

type SpotWithFavorite = Spot & { isFavorite: boolean };

// Style de la carte en mode sombre
const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

export default function ExploreScreen() {
  const [spots, setSpots] = useState<SpotWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [favoriteSpotIds, setFavoriteSpotIds] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); // ← Ajoute ça

  const navigation = useNavigation<NavigationProps>();
  const { isDark } = useTheme(); // ← Ajoute ça

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadSpots(), loadFavorites()]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const loadSpots = async () => {
    try {
      const data = await spotsService.getSpots();
      setSpots(data.map((spot) => ({ ...spot, isFavorite: false })));
    } catch (error) {
      console.error('Error loading spots:', error);
      throw error;
    }
  };

  const loadFavorites = async () => {
    try {
      const favorites = await favoritesService.getFavorites();
      const favoriteIds = new Set(favorites.map((fav) => fav.spotId));
      setFavoriteSpotIds(favoriteIds);

      setSpots((prevSpots) =>
        prevSpots.map((spot) => ({
          ...spot,
          isFavorite: favoriteIds.has(spot.id),
        }))
      );
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredSpots = spots.filter(
    (spot) =>
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculer la région initiale pour la carte
  const getInitialRegion = () => {
    if (filteredSpots.length === 0) {
      // Si pas de spots, centrer sur la position de l'utilisateur ou Paris par défaut
      return {
        latitude: userLocation?.latitude || 48.8566,
        longitude: userLocation?.longitude || 2.3522,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Calculer le centre et le zoom pour inclure tous les spots
    const latitudes = filteredSpots.map((spot) => spot.latitude);
    const longitudes = filteredSpots.map((spot) => spot.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.5; // Marge de 50%
    const deltaLng = (maxLng - minLng) * 1.5;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.05), // Minimum zoom
      longitudeDelta: Math.max(deltaLng, 0.05),
    };
  };

  const renderSpotCard = ({ item }: { item: SpotWithFavorite }) => (
    <TouchableOpacity
      className="bg-surface border-border mb-4 overflow-hidden rounded-2xl border"
      activeOpacity={0.7}
      onPress={() => navigation.navigate('SpotDetail', { spotId: item.id })}
    >
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

        <View className="absolute top-3 right-3 flex-row gap-2">
          {item.averageRating && item.averageRating > 0 ? (
            <View className="bg-surface flex-row items-center rounded-full px-2.5 py-1.5">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-text ml-1 text-xs font-bold">
                {item.averageRating.toFixed(1)}
              </Text>
            </View>
          ) : null}

          {item.isFavorite && (
            <View className="bg-surface h-8 w-8 items-center justify-center rounded-full">
              <Heart size={16} color="#EF4444" fill="#EF4444" strokeWidth={2.5} />
            </View>
          )}
        </View>
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
              onPress={() => Alert.alert('Filtres', 'À venir')}
            >
              <SlidersHorizontal size={20} color="#2563EB" />
            </TouchableOpacity>
          </View>

          <View className="bg-surface-soft flex-row rounded-xl p-1">
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center rounded-lg py-2 ${
                viewMode === 'list' ? 'bg-surface shadow-sm' : ''
              }`}
              onPress={() => setViewMode('list')}
              activeOpacity={0.7}
            >
              <List size={18} color={viewMode === 'list' ? '#2563EB' : '#94A3B8'} strokeWidth={2} />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  viewMode === 'list' ? 'text-primary' : 'text-text-muted'
                }`}
              >
                Liste
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center rounded-lg py-2 ${
                viewMode === 'map' ? 'bg-surface shadow-sm' : ''
              }`}
              onPress={() => setViewMode('map')}
              activeOpacity={0.7}
            >
              <MapIcon
                size={18}
                color={viewMode === 'map' ? '#2563EB' : '#94A3B8'}
                strokeWidth={2}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  viewMode === 'map' ? 'text-primary' : 'text-text-muted'
                }`}
              >
                Carte
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'list' ? (
          <FlatList
            data={filteredSpots}
            renderItem={renderSpotCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={renderEmptyState}
          />
        ) : (
          // Vue Carte
          <View className="flex-1">
            <MapView
              style={{ flex: 1 }}
              initialRegion={getInitialRegion()}
              showsUserLocation={true}
              showsMyLocationButton={true}
              customMapStyle={isDark ? darkMapStyle : undefined}
            >
              {filteredSpots.map((spot) => (
                <Marker
                  key={spot.id}
                  coordinate={{
                    latitude: spot.latitude,
                    longitude: spot.longitude,
                  }}
                  title={spot.name}
                  description={`${spot.city} • ${spot.type.toLowerCase()}`}
                  onCalloutPress={() => navigation.navigate('SpotDetail', { spotId: spot.id })}
                >
                  {/* Custom Marker */}
                  <View className="items-center">
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-full ${
                        spot.isFavorite ? 'bg-red-500' : 'bg-primary'
                      }`}
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                      }}
                    >
                      {spot.isFavorite ? (
                        <Heart size={20} color="#FFFFFF" fill="#FFFFFF" />
                      ) : (
                        <MapPin size={20} color="#FFFFFF" />
                      )}
                    </View>
                    {/* Triangle pointer */}
                    <View
                      style={{
                        width: 0,
                        height: 0,
                        borderLeftWidth: 6,
                        borderRightWidth: 6,
                        borderTopWidth: 8,
                        borderLeftColor: 'transparent',
                        borderRightColor: 'transparent',
                        borderTopColor: spot.isFavorite ? '#EF4444' : '#2563EB',
                      }}
                    />
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>
        )}

        <TouchableOpacity
          className="bg-primary absolute right-6 bottom-24 h-14 w-14 items-center justify-center rounded-full shadow-lg"
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CreateSpot')}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}