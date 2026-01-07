import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { X, Star } from 'lucide-react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { reviewsService } from '../../services/reviewsService';
import type { ExploreStackParamList } from '../../navigation/ExploreNavigator';

type AddReviewRouteProp = RouteProp<ExploreStackParamList, 'AddReview'>;

export default function AddReviewScreen() {
  const route = useRoute<AddReviewRouteProp>();
  const navigation = useNavigation();
  const { spotId, spotName } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (rating === 0) {
      Alert.alert('Note requise', 'Veuillez sélectionner une note');
      return;
    }

    if (rating < 1 || rating > 5) {
      Alert.alert('Erreur', 'La note doit être entre 1 et 5');
      return;
    }

    setLoading(true);
    try {
      await reviewsService.createReview(spotId, {
        rating,
        comment: comment.trim() || undefined,
      });

      Alert.alert('✅ Merci !', 'Votre avis a été publié', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Create review error:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de publier votre avis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-bg flex-1">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center justify-between px-6 pt-12 pb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
            <Text className="text-text-title text-xl font-bold">Votre avis</Text>
            <View style={{ width: 24 }} />
          </View>

          <View className="px-6">
            {/* Spot Name */}
            <View className="border-border bg-surface mb-6 rounded-2xl border p-4">
              <Text className="text-text-muted mb-1 text-sm">Vous évaluez :</Text>
              <Text className="text-text-title text-lg font-bold">{spotName}</Text>
            </View>

            <View className="mb-6">
              <Text className="text-text mb-3 text-base font-semibold">Note *</Text>
              <View className="flex-row items-center justify-center gap-3 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    className="p-2">
                    <Star
                      size={44}
                      color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                      fill={star <= rating ? '#F59E0B' : 'none'}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text className="text-text-muted text-center text-sm">
                  {rating === 1 && '⭐ Décevant'}
                  {rating === 2 && '⭐⭐ Moyen'}
                  {rating === 3 && '⭐⭐⭐ Bien'}
                  {rating === 4 && '⭐⭐⭐⭐ Très bien'}
                  {rating === 5 && '⭐⭐⭐⭐⭐ Excellent !'}
                </Text>
              )}
            </View>

            <View className="mb-6">
              <Text className="text-text mb-2 text-base font-semibold">
                Commentaire (optionnel)
              </Text>
              <TextInput
                className="border-border bg-surface text-text min-h-[120px] rounded-xl border px-4 py-3"
                placeholder="Partagez votre expérience..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={comment}
                onChangeText={setComment}
                maxLength={500}
              />
              <Text className="text-text-muted mt-2 text-right text-xs">{comment.length}/500</Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || rating === 0}
              className="bg-primary mb-8 items-center justify-center rounded-xl py-4">
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">Publier mon avis</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
