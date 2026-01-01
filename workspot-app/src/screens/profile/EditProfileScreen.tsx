import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import ScreenWrapper from '../../components/ScreenWrapper';

interface EditProfileScreenProps {
  navigation: any;
}

export default function EditProfileScreen({ navigation }: EditProfileScreenProps) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    setSaving(true);

    try {
      await userService.updateProfile({ name, email });
      Alert.alert('Succès', 'Profil mis à jour avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de mettre à jour le profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <View className="bg-bg flex-1">
        {/* Header */}
        <View className="border-border bg-surface flex-row items-center border-b px-6 pt-16 pb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <ArrowLeft size={24} color="#334155" strokeWidth={2} />
          </TouchableOpacity>
          <Text className="text-text-title flex-1 text-xl font-bold">Modifier le profil</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Nom */}
          <View className="mb-6">
            <Text className="text-text-title mb-2 text-base font-semibold">Nom</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Votre nom"
              placeholderTextColor="#94A3B8"
              className="border-border bg-surface rounded-xl border px-4 py-3.5 text-base text-black dark:text-white"
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View className="mb-6">
            <Text className="text-text-title mb-2 text-base font-semibold">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor="#94A3B8"
              className="border-border bg-surface rounded-xl border px-4 py-3.5 text-base text-black dark:text-white"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Bouton Enregistrer */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`bg-primary mt-4 flex-row items-center justify-center rounded-xl px-6 py-4 ${
              saving ? 'opacity-50' : ''
            }`}
            activeOpacity={0.7}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={20} color="#FFFFFF" strokeWidth={2} />
                <Text className="ml-2 text-base font-semibold text-white">Enregistrer</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
