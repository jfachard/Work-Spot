import api from './api';
import { User } from '../types';
import { CLOUDINARY_CONFIG } from '../config/cloudinary';

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

  async uploadImage(imageUri: string): Promise<string> {
    const formData = new FormData();

    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: `upload.${fileType}`,
    } as any);

    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'workspot/avatars');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image');
    }
  },

  async updateProfile(data: { name?: string; email?: string; avatar?: string }): Promise<User> {
    const response = await api.patch('/users/me', data);
    return response.data;
  },
  async uploadAvatar(imageUri: string): Promise<User> {
    const avatarUrl = await this.uploadImage(imageUri);

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
