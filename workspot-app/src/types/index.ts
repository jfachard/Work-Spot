export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
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
  openingHours?: string;
  coverImage?: string;
  images?: string[];
  playlistUrl?: string;
  averageRating?: number;
  reviewCount: number;
  verified: boolean;
  createdById: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  spotId: string;
  spot: Spot;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  images?: string[];
  user: User;
  createdAt: string;
}

export interface CreateReviewData {
  rating: number;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
  images?: string[];
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
