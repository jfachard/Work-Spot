import api from './api';
import { Review, CreateReviewData } from '../types';

export const reviewsService = {
  async createReview(spotId: string, data: CreateReviewData): Promise<Review> {
    const response = await api.post(`/reviews/spots/${spotId}`, data);
    return response.data;
  },

  async getSpotReviews(spotId: string): Promise<Review[]> {
    const response = await api.get(`/reviews/spots/${spotId}`);
    return response.data;
  },

  async updateReview(reviewId: string, data: Partial<CreateReviewData>): Promise<Review> {
    const response = await api.patch(`/reviews/${reviewId}`, data);
    return response.data;
  },

  async deleteReview(reviewId: string): Promise<{ message: string }> {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};
