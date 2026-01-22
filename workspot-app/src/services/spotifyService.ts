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

export interface SpotifyAlbum {
  id: string;
  name: string;
  url: string;
  imageUrl: string | null;
  artistName: string;
  releaseDate: string;
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

  async searchAlbums(query: string, limit: number = 10): Promise<SpotifyAlbum[]> {
    const response = await api.get<SpotifyAlbum[]>('/spotify/search/albums', {
      params: { q: query, limit },
    });
    return response.data;
  },

  async getAlbumInfo(albumId: string): Promise<SpotifyAlbum | null> {
    const response = await api.get<SpotifyAlbum | null>('/spotify/album', {
      params: { id: albumId },
    });
    return response.data;
  },

  extractAlbumId(url: string): string | null {
    // Formats supportés:
    // https://open.spotify.com/album/4aawyAB9vmqN3uQ7FjRGTy
    // spotify:album:4aawyAB9vmqN3uQ7FjRGTy
    const webMatch = url.match(/album\/([a-zA-Z0-9]+)/);
    if (webMatch) return webMatch[1];

    const uriMatch = url.match(/spotify:album:([a-zA-Z0-9]+)/);
    if (uriMatch) return uriMatch[1];

    return null;
  },

  isValidSpotifyAlbumUrl(url: string): boolean {
    return this.extractAlbumId(url) !== null;
  },
};