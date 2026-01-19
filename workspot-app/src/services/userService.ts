import api from './api';
import { User, Spot } from '../types';
import { cloudinaryService } from './cloudinaryService';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async getUserStats(): Promise<{
    spotsCreated: number;
    reviewsWritten: number;
    favoriteSpots: number;
  }> {
    const response = await api.get('/users/me/stats');
    return response.data;
  },

  async getMySpots(): Promise<Spot[]> {
    const response = await api.get('/users/me/spots');
    return response.data;
  },

  async updateProfile(data: { name?: string; email?: string; avatar?: string }): Promise<User> {
    const response = await api.patch('/users/me', data);
    return response.data;
  },

  async uploadAvatar(imageUri: string): Promise<User> {
    const avatarUrl = await cloudinaryService.uploadImage(imageUri, 'avatar');
    return this.updateProfile({ avatar: avatarUrl });
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await api.post('/users/me/change-password', data);
    return response.data;
  },

  async deleteAccount(): Promise<{ message: string }> {
    const response = await api.delete('/users/me');
    return response.data;
  },
};
