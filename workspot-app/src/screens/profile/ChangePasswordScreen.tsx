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
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react-native';
import { userService } from '../../services/userService';
import ScreenWrapper from '../../components/ScreenWrapper';

interface ChangePasswordScreenProps {
  navigation: any;
}

export default function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe actuel');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setSaving(true);

    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert('Succès', 'Mot de passe modifié avec succès', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Change password error:', error);
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Impossible de modifier le mot de passe'
      );
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
          <Text className="text-text-title flex-1 text-xl font-bold">Changer le mot de passe</Text>
        </View>

        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          {/* Mot de passe actuel */}
          <View className="mb-6">
            <Text className="text-text-title mb-2 text-base font-semibold">
              Mot de passe actuel
            </Text>
            <View className="relative">
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Entrez votre mot de passe actuel"
                placeholderTextColor="#94A3B8"
                className="border-border bg-surface rounded-xl border px-4 py-3.5 pr-12 text-base text-black dark:text-white"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-4">
                {showCurrentPassword ? (
                  <EyeOff size={20} color="#94A3B8" strokeWidth={2} />
                ) : (
                  <Eye size={20} color="#94A3B8" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Nouveau mot de passe */}
          <View className="mb-6">
            <Text className="text-text-title mb-2 text-base font-semibold">
              Nouveau mot de passe
            </Text>
            <View className="relative">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minimum 6 caractères"
                placeholderTextColor="#94A3B8"
                className="border-border bg-surface rounded-xl border px-4 py-3.5 pr-12 text-base text-black dark:text-white"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-4">
                {showNewPassword ? (
                  <EyeOff size={20} color="#94A3B8" strokeWidth={2} />
                ) : (
                  <Eye size={20} color="#94A3B8" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmer le mot de passe */}
          <View className="mb-6">
            <Text className="text-text-title mb-2 text-base font-semibold">
              Confirmer le mot de passe
            </Text>
            <View className="relative">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Retapez le nouveau mot de passe"
                placeholderTextColor="#94A3B8"
                className="border-border bg-surface rounded-xl border px-4 py-3.5 pr-12 text-base text-black dark:text-white"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-4">
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#94A3B8" strokeWidth={2} />
                ) : (
                  <Eye size={20} color="#94A3B8" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
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
