import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { LogOut, Sun, Moon, Monitor } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const { themeMode, setThemeMode, isDark } = useTheme();

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
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
      ],
    );
  };

  const themeOptions = [
    { mode: 'light' as const, icon: Sun, label: 'Clair' },
    { mode: 'dark' as const, icon: Moon, label: 'Sombre' },
    { mode: 'system' as const, icon: Monitor, label: 'Système' },
  ];

  return (
    <ScreenWrapper>
      <ScrollView 
        className="flex-1 bg-bg px-6 pt-12"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text className="text-3xl font-bold text-text-title mb-8">
          Profil
        </Text>

        {/* Theme Section */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Apparence
          </Text>
          
          {/* Theme Chips */}
          <View className="flex-row flex-wrap gap-2">
            {themeOptions.map(({ mode, icon: Icon, label }) => {
              const isSelected = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setThemeMode(mode)}
                  className={`flex-row items-center px-4 py-2.5 rounded-full border ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-transparent border-border'
                  }`}
                  activeOpacity={0.7}
                >
                  <Icon
                    size={16}
                    color={isSelected ? '#2563EB' : '#94A3B8'}
                    strokeWidth={2}
                  />
                  <Text
                    className={`ml-2 text-sm ${
                      isSelected ? 'text-primary font-semibold' : 'text-text-muted'
                    }`}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Spacer pour pousser le bouton en bas */}
        <View className="flex-1" />

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-danger px-6 py-4 rounded-xl mb-8"
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#FFFFFF" strokeWidth={2} />
          <Text className="text-white font-semibold text-base ml-2">
            Se déconnecter
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}