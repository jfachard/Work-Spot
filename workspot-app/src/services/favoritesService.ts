import api from './api';
import { Favorite } from '../types';

export const favoritesService = {
  async getFavorites(): Promise<Favorite[]> {
    const response = await api.get('/favorites');
    return response.data;
  },

  async addFavorite(spotId: string): Promise<Favorite> {
    const response = await api.post('/favorites', { spotId });
    return response.data;
  },

  async removeFavorite(favoriteId: string): Promise<{ message: string }> {
    const response = await api.delete(`/favorites/${favoriteId}`);
    return response.data;
  },

  async isFavorite(spotId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((fav) => fav.spotId === spotId);
    } catch (error) {
      return false;
    }
  },

  async getFavoriteId(spotId: string): Promise<string | null> {
    try {
      const favorites = await this.getFavorites();
      const favorite = favorites.find((fav) => fav.spotId === spotId);
      return favorite?.id || null;
    } catch (error) {
      return null;
    }
  },
};
