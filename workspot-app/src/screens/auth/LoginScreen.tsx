import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Logo from '../../../assets/logo.svg';
import { Eye, EyeOff } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Erreur de connexion',
        error.response?.data?.message || 'Email ou mot de passe incorrect'
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
          <View className="items-center mb-10">
            <View className="items-center justify-center mb-6">
              <Logo width={80} height={80} />
            </View>
            <Text className="text-3xl font-bold text-text-title mb-2">
              Bienvenue sur Work Spot
            </Text>
            <Text className="text-sm text-text-muted text-center px-4">
              Connectez-vous pour découvrir les meilleurs{'\n'}spots de travail
            </Text>
          </View>

          <View className="gap-4">
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
                  autoComplete="password"
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

            <TouchableOpacity className="self-end">
              <Text className="text-sm text-warning-dark font-medium">
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-primary rounded-xl py-4 items-center mt-2"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Se connecter
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-sm text-text-muted mx-4">Ou</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <View className="items-center">
            <Text className="text-sm text-text-muted">
              Pas encore de compte ?{' '}
              <Text 
                className="text-primary font-semibold"
                onPress={() => navigation.navigate('Register')}
              >
                S'inscrire
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}