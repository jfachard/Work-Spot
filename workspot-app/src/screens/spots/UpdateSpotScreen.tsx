import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Camera, MapPin, Wifi, WifiOff, Zap, ZapOff, X, Locate, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenWrapper from '../../components/ScreenWrapper';
import { spotsService } from '../../services/spotsService';
import { useTheme } from '../../contexts/ThemeContext';
import type { ExploreStackParamList } from '../../navigation/ExploreNavigator';

type NoiseLevel = 'QUIET' | 'MODERATE' | 'LOUD';
type PriceRange = 'FREE' | 'CHEAP' | 'MODERATE' | 'EXPENSIVE';
type SpotType = 'CAFE' | 'LIBRARY' | 'COWORKING' | 'PARK' | 'OTHER';

type UpdateSpotRouteProp = RouteProp<ExploreStackParamList, 'UpdateSpot'>;

export default function UpdateSpotScreen() {
  const navigation = useNavigation();
  const route = useRoute<UpdateSpotRouteProp>();
  const { spotId } = route.params;
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageChanged, setCoverImageChanged] = useState(false);

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
  });

  const [showOpeningPicker, setShowOpeningPicker] = useState(false);
  const [showClosingPicker, setShowClosingPicker] = useState(false);
  const [openingDate, setOpeningDate] = useState(new Date());
  const [closingDate, setClosingDate] = useState(new Date());

  useEffect(() => {
    loadSpot();
  }, [spotId]);

  const loadSpot = async () => {
    try {
      setInitialLoading(true);
      const spot = await spotsService.getSpotById(spotId);

      setFormData({
        name: spot.name,
        description: spot.description || '',
        address: spot.address,
        city: spot.city,
        country: spot.country,
        latitude: spot.latitude.toString(),
        longitude: spot.longitude.toString(),
        hasWifi: spot.hasWifi,
        hasPower: spot.hasPower,
        noiseLevel: spot.noiseLevel,
        priceRange: spot.priceRange,
        type: spot.type,
        openingTime: spot.openingHours ? spot.openingHours.split(' - ')[0] : '',
        closingTime: spot.openingHours ? spot.openingHours.split(' - ')[1] : '',
      });

      if (spot.coverImage) {
        setCoverImage(spot.coverImage);
      }

      // Initialize time pickers if times exist
      if (spot.openingHours) {
        const [opening, closing] = spot.openingHours.split(' - ');
        if (opening) {
          const [hours, minutes] = opening.split(':');
          const date = new Date();
          date.setHours(parseInt(hours), parseInt(minutes));
          setOpeningDate(date);
        }
        if (closing) {
          const [hours, minutes] = closing.split(':');
          const date = new Date();
          date.setHours(parseInt(hours), parseInt(minutes));
          setClosingDate(date);
        }
      }
    } catch (error) {
      console.error('Error loading spot:', error);
      Alert.alert('Erreur', 'Impossible de charger le spot');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

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
      setCoverImageChanged(true);
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

  const handleUpdate = async () => {
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
      const openingHours =
        formData.openingTime && formData.closingTime
          ? `${formData.openingTime} - ${formData.closingTime}`
          : undefined;

      await spotsService.updateSpot(
        spotId,
        {
          name: formData.name,
          description: formData.description || undefined,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          hasWifi: formData.hasWifi,
          hasPower: formData.hasPower,
          noiseLevel: formData.noiseLevel,
          priceRange: formData.priceRange,
          type: formData.type,
          openingHours,
        },
        coverImageChanged ? coverImage || undefined : undefined
      );

      Alert.alert('Succès', 'Spot mis à jour avec succès !', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Update spot error:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de mettre à jour le spot');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-bg flex-1">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between px-6 pt-12 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <X size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
            </TouchableOpacity>
            <Text className="text-text-title text-xl font-bold">Modifier le spot</Text>
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

            <View className="mb-6">
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

            <TouchableOpacity
              onPress={handleUpdate}
              disabled={loading}
              className="bg-primary mb-8 items-center justify-center rounded-xl py-4">
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">Mettre à jour le spot</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}