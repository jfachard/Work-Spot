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
import { X, Search, Music, Check, Disc } from 'lucide-react-native';
import { spotifyService, SpotifyPlaylist, SpotifyAlbum } from '../services/spotifyService';
import { useTheme } from '../contexts/ThemeContext';

type SearchType = 'playlist' | 'album';

export type SpotifyItem = SpotifyPlaylist | SpotifyAlbum;

interface SpotifyPlaylistPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: SpotifyItem, type: SearchType) => void;
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
  const [searchType, setSearchType] = useState<SearchType>('playlist');
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      if (searchType === 'playlist') {
        const results = await spotifyService.searchPlaylists(searchQuery.trim(), 15);
        setPlaylists(results);
        setAlbums([]);
      } else {
        const results = await spotifyService.searchAlbums(searchQuery.trim(), 15);
        setAlbums(results);
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setPlaylists([]);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType]);

  const handleSelect = (item: SpotifyItem) => {
    onSelect(item, searchType);
    onClose();
    resetState();
  };

  const resetState = () => {
    setSearchQuery('');
    setPlaylists([]);
    setAlbums([]);
    setSearched(false);
  };

  const handleClose = () => {
    onClose();
    resetState();
  };

  const handleTabChange = (type: SearchType) => {
    setSearchType(type);
    setPlaylists([]);
    setAlbums([]);
    setSearched(false);
  };

  const isSelected = (item: SpotifyItem) => {
    return currentUrl === item.url;
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

  const renderAlbumItem = ({ item }: { item: SpotifyAlbum }) => (
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
          <Disc size={24} color="#1DB954" />
        </View>
      )}
      <View className="ml-3 flex-1">
        <Text className="text-text-title text-base font-semibold" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-text-muted text-sm" numberOfLines={1}>
          {item.artistName} • {item.releaseDate.slice(0, 4)}
        </Text>
      </View>
      {isSelected(item) && (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-[#1DB954]">
          <Check size={14} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const results = searchType === 'playlist' ? playlists : albums;
  const emptyMessage = searchType === 'playlist'
    ? `Aucune playlist trouvée pour "${searchQuery}"`
    : `Aucun album trouvé pour "${searchQuery}"`;
  const placeholder = searchType === 'playlist'
    ? 'Rechercher une playlist...'
    : 'Rechercher un album...';
  const title = searchType === 'playlist'
    ? 'Rechercher une playlist'
    : 'Rechercher un album';
  const subtitle = searchType === 'playlist'
    ? "Tapez le nom d'une playlist Spotify pour la rechercher"
    : "Tapez le nom d'un album Spotify pour le rechercher";

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
          <Text className="text-text-title text-lg font-bold">Ajouter de la musique</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View className="flex-row px-6 pt-4">
          <TouchableOpacity
            onPress={() => handleTabChange('playlist')}
            className={`mr-2 flex-1 flex-row items-center justify-center rounded-xl py-3 ${
              searchType === 'playlist'
                ? 'bg-[#1DB954]'
                : 'border-border bg-surface border'
            }`}>
            <Music size={18} color={searchType === 'playlist' ? '#FFFFFF' : '#94A3B8'} />
            <Text
              className={`ml-2 font-semibold ${
                searchType === 'playlist' ? 'text-white' : 'text-text-muted'
              }`}>
              Playlist
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleTabChange('album')}
            className={`ml-2 flex-1 flex-row items-center justify-center rounded-xl py-3 ${
              searchType === 'album'
                ? 'bg-[#1DB954]'
                : 'border-border bg-surface border'
            }`}>
            <Disc size={18} color={searchType === 'album' ? '#FFFFFF' : '#94A3B8'} />
            <Text
              className={`ml-2 font-semibold ${
                searchType === 'album' ? 'text-white' : 'text-text-muted'
              }`}>
              Album
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="px-6 py-4">
          <View className="border-border bg-surface flex-row items-center rounded-xl border px-4 py-3">
            <Search size={20} color="#94A3B8" />
            <TextInput
              className="text-text ml-3 flex-1"
              placeholder={placeholder}
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
          ) : results.length > 0 ? (
            <FlatList
              data={results as any}
              keyExtractor={(item) => item.id}
              renderItem={searchType === 'playlist' ? renderPlaylistItem as any : renderAlbumItem as any}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          ) : searched ? (
            <View className="flex-1 items-center justify-center">
              {searchType === 'playlist' ? (
                <Music size={48} color="#94A3B8" />
              ) : (
                <Disc size={48} color="#94A3B8" />
              )}
              <Text className="text-text-muted mt-4 text-center">
                {emptyMessage}
              </Text>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-[#1DB954]/10">
                {searchType === 'playlist' ? (
                  <Music size={40} color="#1DB954" />
                ) : (
                  <Disc size={40} color="#1DB954" />
                )}
              </View>
              <Text className="text-text-title mt-4 text-lg font-semibold">
                {title}
              </Text>
              <Text className="text-text-muted mt-2 text-center px-8">
                {subtitle}
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}