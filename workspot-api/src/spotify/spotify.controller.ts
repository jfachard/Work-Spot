import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SpotifyService, PlaylistResult } from './spotify.service';

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
}