import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Camera, MapPin, Wifi, WifiOff, Zap, ZapOff, X, Locate, Clock, Music, Search, Trash2 } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenWrapper from '../../components/ScreenWrapper';
import { spotsService } from '../../services/spotsService';
import { useTheme } from '../../contexts/ThemeContext';
import SpotifyPlaylistPicker, { SpotifyItem } from '../../components/SpotifyPlaylistPicker';
import { SpotifyPlaylist, SpotifyAlbum } from '../../services/spotifyService';

type NoiseLevel = 'QUIET' | 'MODERATE' | 'LOUD';
type PriceRange = 'FREE' | 'CHEAP' | 'MODERATE' | 'EXPENSIVE';
type SpotType = 'CAFE' | 'LIBRARY' | 'COWORKING' | 'PARK' | 'OTHER';

export default function CreateSpotScreen() {
  const navigation = useNavigation();
    const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    latitude: '',
    longitude: '',
    hasWifi: true,
    hasPower: true,
    noiseLevel: 'MODERATE' as NoiseLevel,
    priceRange: 'MODERATE' as PriceRange,
    type: 'CAFE' as SpotType,
    openingTime: '',
    closingTime: '',
    playlistUrl: '',
  });

  const [showOpeningPicker, setShowOpeningPicker] = useState(false);
  const [showClosingPicker, setShowClosingPicker] = useState(false);
  const [openingDate, setOpeningDate] = useState(new Date());
  const [closingDate, setClosingDate] = useState(new Date());
  const [showSpotifyPicker, setShowSpotifyPicker] = useState(false);
  const [selectedSpotifyItem, setSelectedSpotifyItem] = useState<SpotifyItem | null>(null);
  const [spotifyItemType, setSpotifyItemType] = useState<'playlist' | 'album'>('playlist');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accès aux photos nécessaire');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Accès à la localisation requis');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      setFormData({
        ...formData,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      });

      Alert.alert('Succès', 'Position récupérée !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la position');
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const onOpeningTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowOpeningPicker(false);
    }
    if (selectedDate) {
      setOpeningDate(selectedDate);
      setFormData({ ...formData, openingTime: formatTime(selectedDate) });
    }
  };

  const onClosingTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowClosingPicker(false);
    }
    if (selectedDate) {
      setClosingDate(selectedDate);
      setFormData({ ...formData, closingTime: formatTime(selectedDate) });
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Erreur', 'Veuillez entrer les coordonnées GPS');
      return;
    }

    setLoading(true);
    try {
      await spotsService.createSpot(
        {
          name: formData.name,
          description: formData.description || undefined,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          latitude: parseFloat(formData.latitude.replace(',', '.')),
          longitude: parseFloat(formData.longitude.replace(',', '.')),
          hasWifi: formData.hasWifi,
          hasPower: formData.hasPower,
          noiseLevel: formData.noiseLevel,
          priceRange: formData.priceRange,
          type: formData.type,
          playlistUrl: formData.playlistUrl || undefined,
        },
        coverImage || undefined
      );

      Alert.alert('Succès', 'Spot créé avec succès !', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Create spot error:', error);
      Alert.alert('Erreur', 'Impossible de créer le spot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-bg flex-1">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between px-6 pt-12 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <X size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text className="text-text-title text-xl font-bold">Ajouter un spot</Text>
            <View style={{ width: 24 }} />
          </View>

          <View className="px-6">
            <TouchableOpacity
              onPress={pickImage}
              className="bg-surface-soft mb-6 h-48 w-full overflow-hidden rounded-2xl">
              {coverImage ? (
                <Image
                  source={{ uri: coverImage }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Camera size={32} color="#94A3B8" />
                  <Text className="text-text-muted mt-2 text-sm">Ajouter une photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="mb-4">
              <Text className="text-text mb-2 text-sm font-medium">Nom du lieu *</Text>
              <TextInput
                className="border-border bg-surface text-text rounded-xl border px-4 py-3"
                placeholder="Le Coffee Lab"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-text mb-2 text-sm font-medium">Type *</Text>
              <View className="flex-row flex-wrap gap-2">
                {['CAFE', 'LIBRARY', 'COWORKING', 'PARK', 'OTHER'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setFormData({ ...formData, type: type as SpotType })}
                    className={`rounded-full border px-4 py-2 ${
                      formData.type === type
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface'
                    }`}>
                    <Text
                      className={`text-sm capitalize ${
                        formData.type === type ? 'text-primary font-semibold' : 'text-text-muted'
                      }`}>
                      {type.toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-text mb-2 text-sm font-medium">Adresse *</Text>
              <TextInput
                className="border-border bg-surface text-text rounded-xl border px-4 py-3"
                placeholder="12 Rue de la Paix"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
              />
            </View>

            <View className="mb-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="text-text mb-2 text-sm font-medium">Ville *</Text>
                <TextInput
                  className="border-border bg-surface text-text rounded-xl border px-4 py-3"
                  placeholder="Paris"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
              </View>
              <View className="flex-1">
                <Text className="text-text mb-2 text-sm font-medium">Pays *</Text>
                <TextInput
                  className="border-border bg-surface text-text rounded-xl border px-4 py-3"
                  placeholder="France"
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                />
              </View>
            </View>

            <View className="mb-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-text text-sm font-medium">Coordonnées GPS *</Text>
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  className="bg-primary/10 flex-row items-center rounded-lg px-3 py-1.5">
                  <Locate size={14} color="#2563EB" />
                  <Text className="text-primary ml-1 text-xs font-semibold">Ma position</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <TextInput
                    className="border-border bg-surface text-text rounded-xl border px-4 py-3"
                    placeholder="48.8566"
                    keyboardType="decimal-pad"
                    value={formData.latitude}
                    onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    className="border-border bg-surface text-text rounded-xl border px-4 py-3"
                    placeholder="2.3522"
                    keyboardType="decimal-pad"
                    value={formData.longitude}
                    onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                  />
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-text mb-2 text-sm font-medium">Niveau sonore</Text>
              <View className="flex-row gap-2">
                {(['QUIET', 'MODERATE', 'LOUD'] as NoiseLevel[]).map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setFormData({ ...formData, noiseLevel: level })}
                    className={`flex-1 rounded-xl border py-3 ${
                      formData.noiseLevel === level
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface'
                    }`}>
                    <Text
                      className={`text-center text-sm capitalize ${
                        formData.noiseLevel === level
                          ? 'text-primary font-semibold'
                          : 'text-text-muted'
                      }`}>
                      {level.toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-text mb-2 text-sm font-medium">Fourchette de prix</Text>
              <View className="flex-row gap-2">
                {(['FREE', 'CHEAP', 'MODERATE', 'EXPENSIVE'] as PriceRange[]).map((price) => (
                  <TouchableOpacity
                    key={price}
                    onPress={() => setFormData({ ...formData, priceRange: price })}
                    className={`flex-1 rounded-xl border py-3 ${
                      formData.priceRange === price
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface'
                    }`}>
                    <Text
                      className={`text-center text-sm capitalize ${
                        formData.priceRange === price
                          ? 'text-primary font-semibold'
                          : 'text-text-muted'
                      }`}>
                      {price.toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-text mb-2 text-sm font-medium">
                Horaires (optionnel)
              </Text>
              
              {/* iOS: Layout vertical pour mieux afficher les pickers */}
              {Platform.OS === 'ios' ? (
                <View className="gap-3">
                  {/* Ouverture */}
                  <View>
                    <Text className="text-text-muted mb-1.5 text-xs">Ouverture</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowOpeningPicker(!showOpeningPicker);
                        setShowClosingPicker(false);
                      }}
                      className="border-border bg-surface rounded-xl border px-4 py-3"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`text-base ${
                            formData.openingTime
                              ? 'text-text font-medium'
                              : 'text-text-muted'
                          }`}
                        >
                          {formData.openingTime || '08:00'}
                        </Text>
                        <Clock size={20} color="#94A3B8" />
                      </View>
                    </TouchableOpacity>

                    {showOpeningPicker && (
                      <View className="border-border bg-surface mt-2 overflow-hidden rounded-xl border">
                        <DateTimePicker
                          value={openingDate}
                          mode="time"
                          is24Hour={true}
                          display="spinner"
                          onChange={onOpeningTimeChange}
                          textColor={isDark ? '#FFFFFF' : '#0F172A'}
                          style={{ height: 200 }}
                        />
                        <TouchableOpacity
                          onPress={() => setShowOpeningPicker(false)}
                          className="bg-primary py-3"
                        >
                          <Text className="text-center text-sm font-semibold text-white">
                            Valider
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Fermeture */}
                  <View>
                    <Text className="text-text-muted mb-1.5 text-xs">Fermeture</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowClosingPicker(!showClosingPicker);
                        setShowOpeningPicker(false);
                      }}
                      className="border-border bg-surface rounded-xl border px-4 py-3"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`text-base ${
                            formData.closingTime
                              ? 'text-text font-medium'
                              : 'text-text-muted'
                          }`}
                        >
                          {formData.closingTime || '20:00'}
                        </Text>
                        <Clock size={20} color="#94A3B8" />
                      </View>
                    </TouchableOpacity>

                    {showClosingPicker && (
                      <View className="border-border bg-surface mt-2 overflow-hidden rounded-xl border">
                        <DateTimePicker
                          value={closingDate}
                          mode="time"
                          is24Hour={true}
                          display="spinner"
                          onChange={onClosingTimeChange}
                          textColor={isDark ? '#FFFFFF' : '#0F172A'}
                          style={{ height: 200 }}
                        />
                        <TouchableOpacity
                          onPress={() => setShowClosingPicker(false)}
                          className="bg-primary py-3"
                        >
                          <Text className="text-center text-sm font-semibold text-white">
                            Valider
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                // Android: Layout horizontal comme avant
                <View className="flex-row gap-3">
                  {/* Ouverture */}
                  <View className="flex-1">
                    <Text className="text-text-muted mb-1.5 text-xs">Ouverture</Text>
                    <TouchableOpacity
                      onPress={() => setShowOpeningPicker(true)}
                      className="border-border bg-surface rounded-xl border px-4 py-3"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`text-base ${
                            formData.openingTime
                              ? 'text-text font-medium'
                              : 'text-text-muted'
                          }`}
                        >
                          {formData.openingTime || '08:00'}
                        </Text>
                        <Clock size={20} color="#94A3B8" />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Fermeture */}
                  <View className="flex-1">
                    <Text className="text-text-muted mb-1.5 text-xs">Fermeture</Text>
                    <TouchableOpacity
                      onPress={() => setShowClosingPicker(true)}
                      className="border-border bg-surface rounded-xl border px-4 py-3"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`text-base ${
                            formData.closingTime
                              ? 'text-text font-medium'
                              : 'text-text-muted'
                          }`}
                        >
                          {formData.closingTime || '20:00'}
                        </Text>
                        <Clock size={20} color="#94A3B8" />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Android: Modal pickers */}
              {Platform.OS === 'android' && showOpeningPicker && (
                <DateTimePicker
                  value={openingDate}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onOpeningTimeChange}
                />
              )}

              {Platform.OS === 'android' && showClosingPicker && (
                <DateTimePicker
                  value={closingDate}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onClosingTimeChange}
                />
              )}
            </View>

            <View className="mb-4">
              <Text className="text-text mb-2 text-sm font-medium">Description (optionnel)</Text>
              <TextInput
                className="border-border bg-surface text-text rounded-xl border px-4 py-3"
                placeholder="Décrivez ce lieu..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>

            <View className="mb-6">
              <Text className="text-text mb-2 text-sm font-medium">Musique Spotify (optionnel)</Text>
              {selectedSpotifyItem ? (
                <View className="border-[#1DB954]/30 bg-[#1DB954]/10 flex-row items-center rounded-xl border p-3">
                  {selectedSpotifyItem.imageUrl ? (
                    <Image
                      source={{ uri: selectedSpotifyItem.imageUrl }}
                      style={{ width: 48, height: 48, borderRadius: 8 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="h-12 w-12 items-center justify-center rounded-lg bg-[#1DB954]/20">
                      <Music size={20} color="#1DB954" />
                    </View>
                  )}
                  <View className="ml-3 flex-1">
                    <Text className="text-text-title text-sm font-semibold" numberOfLines={1}>
                      {selectedSpotifyItem.name}
                    </Text>
                    <Text className="text-text-muted text-xs" numberOfLines={1}>
                      {spotifyItemType === 'playlist'
                        ? `${(selectedSpotifyItem as SpotifyPlaylist).ownerName} • ${selectedSpotifyItem.tracksCount} titres`
                        : `${(selectedSpotifyItem as SpotifyAlbum).artistName} • ${(selectedSpotifyItem as SpotifyAlbum).releaseDate.slice(0, 4)}`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedSpotifyItem(null);
                      setFormData({ ...formData, playlistUrl: '' });
                    }}
                    className="ml-2 h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowSpotifyPicker(true)}
                  className="border-border bg-surface flex-row items-center rounded-xl border px-4 py-3">
                  <Music size={20} color="#1DB954" />
                  <Text className="text-text-muted ml-3 flex-1">Rechercher une playlist ou un album...</Text>
                  <Search size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
              <Text className="text-text-muted mt-1.5 text-xs">
                Ajoutez une playlist ou un album qui correspond à l'ambiance du lieu
              </Text>
            </View>

            <SpotifyPlaylistPicker
              visible={showSpotifyPicker}
              onClose={() => setShowSpotifyPicker(false)}
              onSelect={(item, type) => {
                setSelectedSpotifyItem(item);
                setSpotifyItemType(type);
                setFormData({ ...formData, playlistUrl: item.url });
              }}
              currentUrl={formData.playlistUrl}
            />

            <TouchableOpacity
              onPress={handleCreate}
              disabled={loading}
              className="bg-primary mb-8 items-center justify-center rounded-xl py-4">
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">Créer le spot</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
