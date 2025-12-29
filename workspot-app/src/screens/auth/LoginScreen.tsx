import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../../assets/logo.svg'

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <View className="flex-1 bg-bg px-6 justify-center">
      {/* Logo */}
      <View className="items-center mb-8">
        <View className="items-center justify-center mb-4">
          <Logo width={72} height={72} />
        </View>
        <Text className="text-2xl font-bold text-text-title">
          Work Spot
        </Text>
        <Text className="text-sm text-text-muted mt-2">
          Connectez-vous pour continuer
        </Text>
      </View>

      {/* Form */}
      <View className="gap-4">
        {/* Email */}
        <View>
          <Text className="text-sm text-text mb-2 font-medium">
            Email
          </Text>
          <TextInput
            className="bg-surface border border-border rounded-lg px-4 py-3 text-text"
            placeholder="votre@email.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        {/* Password */}
        <View>
          <Text className="text-sm text-text mb-2 font-medium">
            Mot de passe
          </Text>
          <TextInput
            className="bg-surface border border-border rounded-lg px-4 py-3 text-text"
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className="bg-primary rounded-lg py-4 items-center mt-2"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Se connecter
            </Text>
          )}
        </TouchableOpacity>

        {/* Dev info */}
        <View className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <Text className="text-xs text-yellow-800 font-mono">
            🔧 Mode dev : Crée d'abord un compte via Postman ou utilise un compte existant
          </Text>
        </View>
      </View>
    </View>
  );
}