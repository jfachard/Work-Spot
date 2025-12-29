import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { logout } = useAuth();

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

  return (
    <View className="flex-1 bg-bg items-center justify-center">
      <Text className="text-2xl font-bold text-text-title">
        Profile Screen
      </Text>
      <Text className="text-text-muted mt-2">
        (Mon profil)
      </Text>

      <TouchableOpacity
        onPress={handleLogout}
        className="mt-8 flex-row items-center bg-danger px-6 py-3 rounded-xl"
        activeOpacity={0.7}
      >
        <LogOut size={20} color="#FFFFFF" />
        <Text className="text-white font-semibold ml-2">
          Se déconnecter
        </Text>
      </TouchableOpacity>
    </View>
  );
}