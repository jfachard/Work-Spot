import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Logo from '../../../assets/logo.svg';
import { Eye, EyeOff } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert(
        'Erreur d\'inscription',
        error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-bg"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 justify-center py-12">
          <View className="items-center mb-8">
            <View className="items-center justify-center mb-6">
              <Logo width={80} height={80} />
            </View>
            <Text className="text-3xl font-bold text-text-title mb-2">
              Créer un compte
            </Text>
            <Text className="text-sm text-text-muted text-center">
              Rejoignez la communauté Work Spot
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-sm text-text mb-2 font-medium">
                Nom complet
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3.5 text-text"
                placeholder="Alex Durand"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            <View>
              <Text className="text-sm text-text mb-2 font-medium">
                Email
              </Text>
              <TextInput
                className="bg-surface border border-border rounded-xl px-4 py-3.5 text-text"
                placeholder="votre@email.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View>
              <Text className="text-sm text-text mb-2 font-medium">
                Mot de passe
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-surface border border-border rounded-xl px-4 py-3.5 text-text pr-12"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  className="absolute right-4 top-3.5"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#94A3B8" />
                  ) : (
                    <Eye size={20} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-sm text-text mb-2 font-medium">
                Confirmer le mot de passe
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-surface border border-border rounded-xl px-4 py-3.5 text-text pr-12"
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  className="absolute right-4 top-3.5"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#94A3B8" />
                  ) : (
                    <Eye size={20} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center mt-2"
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Créer mon compte
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-sm text-text-muted mx-4">Ou</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <View className="items-center mb-6">
            <Text className="text-sm text-text-muted">
              Déjà un compte ?{' '}
              <Text 
                className="text-primary font-semibold"
                onPress={() => navigation.navigate('Login')}
              >
                Se connecter
              </Text>
            </Text>
          </View>

          <Text className="text-xs text-text-muted text-center">
            En créant un compte, vous acceptez nos{' '}
            <Text className="text-primary">conditions d'utilisation</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}