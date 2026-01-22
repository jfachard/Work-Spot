import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SpotifyService, PlaylistResult, AlbumResult } from './spotify.service';

@ApiTags('Spotify')
@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search for Spotify playlists' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiQuery({ name: 'limit', description: 'Number of results (default: 10)', required: false })
  @ApiResponse({ status: 200, description: 'List of matching playlists' })
  @ApiResponse({ status: 400, description: 'Missing search query' })
  async searchPlaylists(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<PlaylistResult[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }

    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const safeLimit = Math.min(Math.max(parsedLimit, 1), 50);

    return this.spotifyService.searchPlaylists(query.trim(), safeLimit);
  }

  @Get('playlist')
  @ApiOperation({ summary: 'Get playlist information by ID' })
  @ApiQuery({ name: 'id', description: 'Spotify playlist ID', required: true })
  @ApiResponse({ status: 200, description: 'Playlist information' })
  @ApiResponse({ status: 400, description: 'Missing playlist ID' })
  async getPlaylistInfo(@Query('id') playlistId: string): Promise<PlaylistResult | null> {
    if (!playlistId || playlistId.trim().length === 0) {
      throw new BadRequestException('Playlist ID is required');
    }

    return this.spotifyService.getPlaylistInfo(playlistId.trim());
  }

  @Get('search/albums')
  @ApiOperation({ summary: 'Search for Spotify albums' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiQuery({ name: 'limit', description: 'Number of results (default: 10)', required: false })
  @ApiResponse({ status: 200, description: 'List of matching albums' })
  @ApiResponse({ status: 400, description: 'Missing search query' })
  async searchAlbums(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ): Promise<AlbumResult[]> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }

    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const safeLimit = Math.min(Math.max(parsedLimit, 1), 50);

    return this.spotifyService.searchAlbums(query.trim(), safeLimit);
  }

  @Get('album')
  @ApiOperation({ summary: 'Get album information by ID' })
  @ApiQuery({ name: 'id', description: 'Spotify album ID', required: true })
  @ApiResponse({ status: 200, description: 'Album information' })
  @ApiResponse({ status: 400, description: 'Missing album ID' })
  async getAlbumInfo(@Query('id') albumId: string): Promise<AlbumResult | null> {
    if (!albumId || albumId.trim().length === 0) {
      throw new BadRequestException('Album ID is required');
    }

    return this.spotifyService.getAlbumInfo(albumId.trim());
  }
}