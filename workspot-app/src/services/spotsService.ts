import api from './api';
import { Spot } from '../types';

interface GetSpotsParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // En kilomètres
  hasWifi?: boolean;
  hasPower?: boolean;
  type?: 'CAFE' | 'LIBRARY' | 'COWORKING' | 'PARK' | 'OTHER';
}

interface CreateSpotData {
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  hasWifi: boolean;
  hasPower: boolean;
  noiseLevel: 'QUIET' | 'MODERATE' | 'LOUD';
  priceRange: 'FREE' | 'CHEAP' | 'MODERATE' | 'EXPENSIVE';
  type: 'CAFE' | 'LIBRARY' | 'COWORKING' | 'PARK' | 'OTHER';
  openingHours?: string;
  coverImage?: string;
  images?: string[];
  playlistUrl?: string;
}

export const spotsService = {
  async getSpots(params?: GetSpotsParams): Promise<Spot[]> {
    const response = await api.get('/spots', { params });
    return response.data;
  },

  async getSpotById(id: string): Promise<Spot> {
    const response = await api.get(`/spots/${id}`);
    return response.data;
  },

  async createSpot(data: CreateSpotData): Promise<Spot> {
    const response = await api.post('/spots', data);
    return response.data;
  },

  async updateSpot(id: string, data: Partial<CreateSpotData>): Promise<Spot> {
    const response = await api.patch(`/spots/${id}`, data);
    return response.data;
  },

  async deleteSpot(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/spots/${id}`);
    return response.data;
  },

  async getNearbySpots(latitude: number, longitude: number, radius: number = 5): Promise<Spot[]> {
    return this.getSpots({ latitude, longitude, radius });
  },

  async getSpotsByType(type: CreateSpotData['type']): Promise<Spot[]> {
    return this.getSpots({ type });
  },
};
