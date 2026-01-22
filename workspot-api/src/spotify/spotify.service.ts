import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  external_urls: {
    spotify: string;
  };
  images: { url: string; height: number; width: number }[];
  owner: {
    display_name: string;
  };
  tracks: {
    total: number;
  };
}

interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: string;
  external_urls: {
    spotify: string;
  };
  images: { url: string; height: number; width: number }[];
  artists: {
    name: string;
  }[];
  release_date: string;
  total_tracks: number;
}

interface SpotifySearchResponse {
  playlists?: {
    items: SpotifyPlaylist[];
    total: number;
    limit: number;
    offset: number;
  };
  albums?: {
    items: SpotifyAlbum[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface PlaylistResult {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string | null;
  ownerName: string;
  tracksCount: number;
}

export interface AlbumResult {
  id: string;
  name: string;
  url: string;
  imageUrl: string | null;
  artistName: string;
  releaseDate: string;
  tracksCount: number;
}

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    const clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
      const response: AxiosResponse<SpotifyToken> = await firstValueFrom(
        this.httpService.post<SpotifyToken>(
          'https://accounts.spotify.com/api/token',
          'grant_type=client_credentials',
          {
            headers: {
              Authorization: `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const token = response.data.access_token;
      this.accessToken = token;
      this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

      this.logger.log('Spotify access token obtained successfully');
      return token;
    } catch (error) {
      this.logger.error('Failed to get Spotify access token', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  async searchPlaylists(query: string, limit: number = 10): Promise<PlaylistResult[]> {
    const token = await this.getAccessToken();

    try {
      const response: AxiosResponse<SpotifySearchResponse> = await firstValueFrom(
        this.httpService.get<SpotifySearchResponse>(
          'https://api.spotify.com/v1/search',
          {
            params: {
              q: query,
              type: 'playlist',
              limit,
              market: 'FR',
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      return (response.data.playlists?.items || [])
        .filter((playlist) => playlist !== null)
        .map((playlist) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || '',
          url: playlist.external_urls.spotify,
          imageUrl: playlist.images?.[0]?.url || null,
          ownerName: playlist.owner.display_name,
          tracksCount: playlist.tracks.total,
        }));
    } catch (error) {
      this.logger.error('Failed to search playlists', error);
      throw new Error('Failed to search Spotify playlists');
    }
  }

  async getPlaylistInfo(playlistId: string): Promise<PlaylistResult | null> {
    const token = await this.getAccessToken();

    try {
      const response: AxiosResponse<SpotifyPlaylist> = await firstValueFrom(
        this.httpService.get<SpotifyPlaylist>(
          `https://api.spotify.com/v1/playlists/${playlistId}`,
          {
            params: {
              fields: 'id,name,description,external_urls,images,owner,tracks.total',
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      const playlist = response.data;
      return {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || '',
        url: playlist.external_urls.spotify,
        imageUrl: playlist.images?.[0]?.url || null,
        ownerName: playlist.owner.display_name,
        tracksCount: playlist.tracks.total,
      };
    } catch (error) {
      this.logger.error(`Failed to get playlist info for ${playlistId}`, error);
      return null;
    }
  }

  async searchAlbums(query: string, limit: number = 10): Promise<AlbumResult[]> {
    const token = await this.getAccessToken();

    try {
      const response: AxiosResponse<SpotifySearchResponse> = await firstValueFrom(
        this.httpService.get<SpotifySearchResponse>(
          'https://api.spotify.com/v1/search',
          {
            params: {
              q: query,
              type: 'album',
              limit,
              market: 'FR',
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      return (response.data.albums?.items || [])
        .filter((album) => album !== null)
        .map((album) => ({
          id: album.id,
          name: album.name,
          url: album.external_urls.spotify,
          imageUrl: album.images?.[0]?.url || null,
          artistName: album.artists.map((a) => a.name).join(', '),
          releaseDate: album.release_date,
          tracksCount: album.total_tracks,
        }));
    } catch (error) {
      this.logger.error('Failed to search albums', error);
      throw new Error('Failed to search Spotify albums');
    }
  }

  async getAlbumInfo(albumId: string): Promise<AlbumResult | null> {
    const token = await this.getAccessToken();

    try {
      const response: AxiosResponse<SpotifyAlbum> = await firstValueFrom(
        this.httpService.get<SpotifyAlbum>(
          `https://api.spotify.com/v1/albums/${albumId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      const album = response.data;
      return {
        id: album.id,
        name: album.name,
        url: album.external_urls.spotify,
        imageUrl: album.images?.[0]?.url || null,
        artistName: album.artists.map((a) => a.name).join(', '),
        releaseDate: album.release_date,
        tracksCount: album.total_tracks,
      };
    } catch (error) {
      this.logger.error(`Failed to get album info for ${albumId}`, error);
      return null;
    }
  }
}