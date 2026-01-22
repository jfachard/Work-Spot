import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { X, Search, Music, Check } from 'lucide-react-native';
import { spotifyService, SpotifyPlaylist } from '../services/spotifyService';
import { useTheme } from '../contexts/ThemeContext';

interface SpotifyPlaylistPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (playlist: SpotifyPlaylist) => void;
  currentUrl?: string;
}

export default function SpotifyPlaylistPicker({
  visible,
  onClose,
  onSelect,
  currentUrl,
}: SpotifyPlaylistPickerProps) {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const results = await spotifyService.searchPlaylists(searchQuery.trim(), 15);
      setPlaylists(results);
    } catch (error) {
      console.error('Search error:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleSelect = (playlist: SpotifyPlaylist) => {
    onSelect(playlist);
    onClose();
    // Reset state
    setSearchQuery('');
    setPlaylists([]);
    setSearched(false);
  };

  const handleClose = () => {
    onClose();
    setSearchQuery('');
    setPlaylists([]);
    setSearched(false);
  };

  const isSelected = (playlist: SpotifyPlaylist) => {
    return currentUrl === playlist.url;
  };

  const renderPlaylistItem = ({ item }: { item: SpotifyPlaylist }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      className={`mb-3 flex-row items-center rounded-xl border p-3 ${
        isSelected(item)
          ? 'border-[#1DB954] bg-[#1DB954]/10'
          : 'border-border bg-surface'
      }`}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: 56, height: 56, borderRadius: 8 }}
          contentFit="cover"
        />
      ) : (
        <View className="h-14 w-14 items-center justify-center rounded-lg bg-[#1DB954]/20">
          <Music size={24} color="#1DB954" />
        </View>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-text-title text-base font-semibold" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-text-muted text-sm" numberOfLines={1}>
          {item.ownerName} • {item.tracksCount} titres
        </Text>
      </View>
      {isSelected(item) && (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-[#1DB954]">
          <Check size={14} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-bg flex-1">
        {/* Header */}
        <View className="border-border flex-row items-center justify-between border-b px-6 pt-4 pb-4">
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color={isDark ? '#F8FAFC' : '#0F172A'} />
          </TouchableOpacity>
          <Text className="text-text-title text-lg font-bold">Choisir une playlist</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search */}
        <View className="px-6 py-4">
          <View className="border-border bg-surface flex-row items-center rounded-xl border px-4 py-3">
            <Search size={20} color="#94A3B8" />
            <TextInput
              className="text-text ml-3 flex-1"
              placeholder="Rechercher une playlist..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleSearch}>
                <View className="rounded-lg bg-[#1DB954] px-3 py-1.5">
                  <Text className="text-sm font-semibold text-white">Rechercher</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        <View className="flex-1 px-6">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1DB954" />
              <Text className="text-text-muted mt-4">Recherche en cours...</Text>
            </View>
          ) : playlists.length > 0 ? (
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              renderItem={renderPlaylistItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : searched ? (
            <View className="flex-1 items-center justify-center">
              <Music size={48} color="#94A3B8" />
              <Text className="text-text-muted mt-4 text-center">
                Aucune playlist trouvée pour "{searchQuery}"
              </Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-[#1DB954]/10">
                <Music size={40} color="#1DB954" />
              </View>
              <Text className="text-text-title mt-4 text-lg font-semibold">
                Rechercher une playlist
              </Text>
              <Text className="text-text-muted mt-2 text-center px-8">
                Tapez le nom d'une playlist Spotify pour la rechercher et l'ajouter à votre spot
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}