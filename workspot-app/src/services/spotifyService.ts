import api from './api';

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string | null;
  ownerName: string;
  tracksCount: number;
}

export const spotifyService = {
  async searchPlaylists(query: string, limit: number = 10): Promise<SpotifyPlaylist[]> {
    const response = await api.get<SpotifyPlaylist[]>('/spotify/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  async getPlaylistInfo(playlistId: string): Promise<SpotifyPlaylist | null> {
    const response = await api.get<SpotifyPlaylist | null>('/spotify/playlist', {
      params: { id: playlistId },
    });
    return response.data;
  },

  extractPlaylistId(url: string): string | null {
    // Formats supportés:
    // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    // spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
    const webMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
    if (webMatch) return webMatch[1];

    const uriMatch = url.match(/spotify:playlist:([a-zA-Z0-9]+)/);
    if (uriMatch) return uriMatch[1];

    return null;
  },

  isValidSpotifyPlaylistUrl(url: string): boolean {
    return this.extractPlaylistId(url) !== null;
  },
};