export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Spot {
  id: string;
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
  coverImage?: string;
  images?: string[];
  averageRating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  images?: string[];
  user: User;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}