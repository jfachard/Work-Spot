import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  LogOut,
  Sun,
  Moon,
  Monitor,
  User,
  Mail,
  MapPin,
  Star,
  Heart,
  Edit2,
  Camera,
  RectangleEllipsis,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { userService } from '../../services/userService';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';
import ScreenWrapper from '../../components/ScreenWrapper';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [stats, setStats] = useState({
    spotsCreated: 0,
    reviewsWritten: 0,
    favoriteSpots: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const tabBarHeight = useTabBarHeight();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await userService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin de votre permission pour accéder à vos photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setAvatar(imageUri);
      await uploadAvatar(imageUri);
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    setUploadingAvatar(true);

    setAvatar(imageUri);

    try {
      const updatedUser = await userService.uploadAvatar(imageUri);

      setAvatar(updatedUser.avatar || null);

      Alert.alert('Succès', 'Photo de profil mise à jour !');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo. Vérifiez votre connexion.');
      setAvatar(user?.avatar || null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      {
        text: 'Annuler',
        style: 'cancel',
      },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de se déconnecter');
          }
        },
      },
    ]);
  };

  const themeOptions = [
    { mode: 'light' as const, icon: Sun, label: 'Clair' },
    { mode: 'dark' as const, icon: Moon, label: 'Sombre' },
    { mode: 'system' as const, icon: Monitor, label: 'Système' },
  ];

  const statsDisplay = [
    { label: 'Avis', value: stats.reviewsWritten.toString(), icon: Star },
    { label: 'Favoris', value: stats.favoriteSpots.toString(), icon: Heart },
    { label: 'Spots', value: stats.spotsCreated.toString(), icon: MapPin },
  ];

  const menuItems = [
    {
      section: 'Compte',
      items: [
        {
          icon: Edit2,
          label: 'Modifier le profil',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          icon: RectangleEllipsis,
          label: 'Modifier le mot de passe',
          onPress: () => navigation.navigate('ChangePassword'),
        },
      ],
    },
    {
      section: 'Spots',
      items: [
        {
          icon: MapPin,
          label: 'Mes spots',
          onPress: () => navigation.navigate('MySpots'),
        },
      ],
    },
  ];

  return (
    <ScreenWrapper>
      <ScrollView
        className="bg-bg flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}>
        <View className="bg-primary/5 border-border border-b px-6 pt-16 pb-8">
          <View className="items-center">
            <View className="relative mb-4">
              <View className="border-bg bg-surface h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 shadow-lg">
                {avatar ? (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <View className="bg-primary h-full w-full items-center justify-center">
                    <User size={40} color="#FFFFFF" strokeWidth={2} />
                  </View>
                )}

                {uploadingAvatar && (
                  <View className="absolute inset-0 items-center justify-center bg-black/50">
                    <ActivityIndicator color="white" />
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={pickImage}
                className="bg-primary border-bg absolute right-0 bottom-0 h-9 w-9 items-center justify-center rounded-full border-4 shadow-lg"
                activeOpacity={0.7}
                disabled={uploadingAvatar}>
                <Camera size={16} color="#FFFFFF" strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text className="text-text-title mb-1 text-2xl font-bold">{user?.name}</Text>

            <View className="flex-row items-center">
              <Mail size={14} color="#94A3B8" strokeWidth={2} />
              <Text className="text-text-muted ml-1.5 text-sm">{user?.email}</Text>
            </View>
          </View>

          <View className="mt-6 flex-row justify-around">
            {loadingStats ? (
              <ActivityIndicator color="#2563EB" />
            ) : (
              statsDisplay.map(({ label, value, icon: Icon }, index) => (
                <View key={index} className="items-center">
                  <View className="bg-bg border-border mb-2 h-12 w-12 items-center justify-center rounded-full border shadow-sm">
                    <Icon size={20} color="#2563EB" strokeWidth={2} />
                  </View>
                  <Text className="text-text-title mb-0.5 text-lg font-bold">{value}</Text>
                  <Text className="text-text-muted text-xs">{label}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="px-6 pt-6">
          <View className="mb-8">
            <Text className="text-text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
              Apparence
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {themeOptions.map(({ mode, icon: Icon, label }) => {
                const isSelected = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setThemeMode(mode)}
                    className={`flex-row items-center rounded-full border px-4 py-2.5 ${
                      isSelected ? 'bg-primary/10 border-primary' : 'border-border bg-transparent'
                    }`}
                    activeOpacity={0.7}>
                    <Icon size={16} color={isSelected ? '#2563EB' : '#94A3B8'} strokeWidth={2} />
                    <Text
                      className={`ml-2 text-sm ${
                        isSelected ? 'text-primary font-semibold' : 'text-text-muted'
                      }`}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {menuItems.map(({ section, items }, sectionIndex) => (
            <View key={sectionIndex} className="mb-8">
              <Text className="text-text-muted mb-3 text-sm font-semibold tracking-wider uppercase">
                {section}
              </Text>

              <View className="border-border bg-surface overflow-hidden rounded-xl border">
                {items.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    <TouchableOpacity
                      onPress={item.onPress}
                      className="flex-row items-center px-4 py-4"
                      activeOpacity={0.7}>
                      <View className="bg-primary/10 mr-3 h-10 w-10 items-center justify-center rounded-full">
                        <item.icon size={18} color="#2563EB" strokeWidth={2} />
                      </View>
                      <Text className="text-text-title flex-1 text-base">{item.label}</Text>
                      <Text className="text-text-muted text-lg">›</Text>
                    </TouchableOpacity>
                    {itemIndex < items.length - 1 && <View className="bg-border ml-16 h-px" />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-danger mb-8 flex-row items-center justify-center rounded-xl px-6 py-4 shadow-sm"
            activeOpacity={0.7}>
            <LogOut size={20} color="#FFFFFF" strokeWidth={2} />
            <Text className="ml-2 text-base font-semibold text-white">Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
