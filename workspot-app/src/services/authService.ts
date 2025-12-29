import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterData, User } from '../types';

export const authService = {
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data;
    
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    
    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },
};