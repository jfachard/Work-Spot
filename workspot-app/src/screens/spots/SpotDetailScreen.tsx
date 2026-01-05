import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Wifi,
  Zap,
  Clock,
  DollarSign,
  Volume2,
  Star,
  MessageSquare,
  Navigation,
  Edit,
  Trash2,
} from 'lucide-react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { spotsService } from '../../services/spotsService';
import { Spot } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import type { ExploreStackParamList } from '../../navigation/ExploreNavigator';
import { useTheme } from '../../contexts/ThemeContext';

type SpotDetailRouteProp = RouteProp<ExploreStackParamList, 'SpotDetail'>;

const { width } = Dimensions.get('window');

export default function SpotDetailScreen() {
  const route = useRoute<SpotDetailRouteProp>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { spotId } = route.params;

  const [spot, setSpot] = useState<Spot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const { isDark } = useTheme();
  const iconColor = isDark ? '#F8FAFC' : '#0F172A';

  useEffect(() => {
    loadSpot();
  }, [spotId]);

  const loadSpot = async () => {
    try {
      setLoading(true);
      const data = await spotsService.getSpotById(spotId);
      setSpot(data);
    } catch (error) {
      console.error('Error loading spot:', error);
      Alert.alert('Erreur', 'Impossible de charger le spot');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!spot) return;
    try {
      const amenities = [];
      if (spot.hasWifi) amenities.push('📶 WiFi');
      if (spot.hasPower) amenities.push('🔌 Prises');

      const message = `
  🎯 ${spot.name}

  📍 ${spot.address}, ${spot.city}
  ${amenities.join(' • ')}
  ⭐ ${spot.averageRating?.toFixed(1) || 'Nouveau spot'}

  💼 Découvre ce spot sur Work Spot !
      `.trim();

      await Share.share({
        message,
        title: spot.name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris', spot?.name);
  };

  const handleDelete = () => {
    Alert.alert('Supprimer le spot', 'Êtes-vous sûr de vouloir supprimer ce spot ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await spotsService.deleteSpot(spotId);
            Alert.alert('Succès', 'Spot supprimé');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de supprimer le spot');
          }
        },
      },
    ]);
  };

  const handleAddReview = () => {
    Alert.alert('Ajouter un avis', 'À venir');
  };

  const isOwner = user?.id === spot?.createdById;

  if (loading) {
    return (
      <ScreenWrapper>
        <View className="bg-bg flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!spot) {
    return null;
  }

  return (
    <ScreenWrapper>
      <View className="bg-bg flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="relative">
            {spot.coverImage ? (
              <Image
                source={{ uri: spot.coverImage }}
                style={{ width, height: 300 }}
                contentFit="cover"
              />
            ) : (
              <View
                className="bg-surface-soft items-center justify-center"
                style={{ width, height: 300 }}>
                <MapPin size={60} color="#94A3B8" />
              </View>
            )}

            <View className="absolute top-12 right-0 left-0 flex-row items-center justify-between px-6">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="bg-surface/95 h-10 w-10 items-center justify-center rounded-full">
                <ArrowLeft size={20} color={iconColor} />
              </TouchableOpacity>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleShare}
                  className="bg-surface/95 h-10 w-10 items-center justify-center rounded-full">
                  <Share2 size={18} color={iconColor} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleToggleFavorite}
                  className="bg-surface/95 h-10 w-10 items-center justify-center rounded-full">
                  <Heart
                    size={18}
                    color={isFavorite ? '#EF4444' : iconColor}
                    fill={isFavorite ? '#EF4444' : 'none'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="absolute bottom-4 left-6">
              <View className="bg-surface/95 rounded-full px-4 py-2">
                <Text className="text-text text-sm font-bold capitalize">
                  {spot.type.toLowerCase()}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-6 py-6">
            <View className="mb-4">
              <Text className="text-text-title mb-2 text-2xl font-bold">{spot.name}</Text>

              {spot.averageRating && spot.averageRating > 0 ? (
                <View className="flex-row items-center">
                  <Star size={18} color="#F59E0B" fill="#F59E0B" />
                  <Text className="text-text ml-1.5 text-base font-bold">
                    {spot.averageRating.toFixed(1)}
                  </Text>
                  <Text className="text-text-muted ml-1 text-sm">({spot.reviewCount} avis)</Text>
                </View>
              ) : (
                <Text className="text-text-muted text-sm">Aucun avis pour le moment</Text>
              )}
            </View>

            <View className="mb-6 flex-row items-start">
              <MapPin size={18} color="#94A3B8" className="mt-0.5" />
              <View className="ml-2 flex-1">
                <Text className="text-text text-base">{spot.address}</Text>
                <Text className="text-text-muted text-sm">
                  {spot.city}, {spot.country}
                </Text>
              </View>
            </View>

            <View className="mb-6 flex-row flex-wrap gap-3">
              <View
                className={`flex-1 flex-row items-center rounded-xl border px-3 py-3 ${
                  spot.hasWifi ? 'border-primary bg-primary/5' : 'border-border bg-surface'
                }`}>
                <Wifi size={18} color={spot.hasWifi ? '#2563EB' : '#94A3B8'} />
                <Text
                  className={`ml-2 text-sm font-medium ${
                    spot.hasWifi ? 'text-primary' : 'text-text-muted'
                  }`}>
                  WiFi
                </Text>
              </View>

              <View
                className={`flex-1 flex-row items-center rounded-xl border px-3 py-3 ${
                  spot.hasPower ? 'border-warning bg-warning/5' : 'border-border bg-surface'
                }`}>
                <Zap size={18} color={spot.hasPower ? '#F59E0B' : '#94A3B8'} />
                <Text
                  className={`ml-2 text-sm font-medium ${
                    spot.hasPower ? 'text-warning' : 'text-text-muted'
                  }`}>
                  Prises
                </Text>
              </View>
            </View>

            <View className="border-border bg-surface mb-6 rounded-2xl border p-4">
              <View className="border-border mb-3 flex-row items-center justify-between border-b pb-3">
                <View className="flex-row items-center">
                  <Volume2 size={18} color="#64748B" />
                  <Text className="text-text-muted ml-2 text-sm">Niveau sonore</Text>
                </View>
                <Text className="text-text font-semibold capitalize">
                  {spot.noiseLevel.toLowerCase()}
                </Text>
              </View>

              <View className="border-border mb-3 flex-row items-center justify-between border-b pb-3">
                <View className="flex-row items-center">
                  <DollarSign size={18} color="#64748B" />
                  <Text className="text-text-muted ml-2 text-sm">Prix</Text>
                </View>
                <Text className="text-text font-semibold capitalize">
                  {spot.priceRange.toLowerCase()}
                </Text>
              </View>

              {spot.openingHours && (
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Clock size={18} color="#64748B" />
                    <Text className="text-text-muted ml-2 text-sm">Horaires</Text>
                  </View>
                  <Text className="text-text font-semibold">{spot.openingHours}</Text>
                </View>
              )}
            </View>

            {spot.description && (
              <View className="mb-6">
                <Text className="text-text-title mb-2 text-base font-bold">Description</Text>
                <Text className="text-text leading-6">{spot.description}</Text>
              </View>
            )}

            {isOwner && (
              <View className="mb-6 flex-row gap-3">
                <TouchableOpacity
                  onPress={() => Alert.alert('Modifier', 'À venir')}
                  className="border-primary bg-primary/10 flex-1 flex-row items-center justify-center rounded-xl border py-3">
                  <Edit size={18} color="#2563EB" />
                  <Text className="text-primary ml-2 font-semibold">Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  className="border-danger bg-danger/10 flex-1 flex-row items-center justify-center rounded-xl border py-3">
                  <Trash2 size={18} color="#EF4444" />
                  <Text className="text-danger ml-2 font-semibold">Supprimer</Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="mb-6">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-text-title text-lg font-bold">Avis ({spot.reviewCount})</Text>
                <TouchableOpacity
                  onPress={handleAddReview}
                  className="bg-primary flex-row items-center rounded-lg px-4 py-2">
                  <MessageSquare size={16} color="#FFFFFF" />
                  <Text className="ml-2 text-sm font-semibold text-white">Ajouter</Text>
                </TouchableOpacity>
              </View>

              {spot.reviews && spot.reviews.length > 0 ? (
                spot.reviews.map((review: any) => (
                  <View
                    key={review.id}
                    className="border-border bg-surface mb-3 rounded-xl border p-4">
                    <View className="mb-2 flex-row items-center justify-between">
                      <Text className="text-text font-semibold">{review.user.name}</Text>
                      <View className="flex-row items-center">
                        <Star size={14} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-text ml-1 text-sm font-bold">{review.rating}</Text>
                      </View>
                    </View>
                    {review.comment && (
                      <Text className="text-text-muted text-sm leading-5">{review.comment}</Text>
                    )}
                  </View>
                ))
              ) : (
                <View className="border-border bg-surface items-center rounded-xl border border-dashed py-8">
                  <MessageSquare size={32} color="#94A3B8" />
                  <Text className="text-text-muted mt-2 text-sm">Aucun avis pour le moment</Text>
                </View>
              )}
            </View>

            <View className="border-border bg-surface mb-6 rounded-xl border p-4">
              <Text className="text-text-muted mb-2 text-xs font-semibold tracking-wide uppercase">
                Ajouté par
              </Text>
              <Text className="text-text text-base font-semibold">{spot.createdBy?.name}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
