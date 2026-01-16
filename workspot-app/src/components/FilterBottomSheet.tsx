import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { X, Wifi, Zap, Volume2, DollarSign, Coffee, Building, BookOpen, Trees, HelpCircle } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

export type NoiseLevel = 'QUIET' | 'MODERATE' | 'LOUD';
export type PriceRange = 'FREE' | 'CHEAP' | 'MODERATE' | 'EXPENSIVE';
export type SpotType = 'CAFE' | 'LIBRARY' | 'COWORKING' | 'PARK' | 'OTHER';

export interface Filters {
  hasWifi: boolean | null;
  hasPower: boolean | null;
  noiseLevel: NoiseLevel | null;
  priceRange: PriceRange | null;
  type: SpotType | null;
}

interface FilterBottomSheetProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}

const FilterBottomSheet = forwardRef<BottomSheet, FilterBottomSheetProps>(
  ({ filters, onFiltersChange, onReset }, ref) => {
    const { isDark } = useTheme();
    const snapPoints = useMemo(() => ['85%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const toggleFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
      onFiltersChange({
        ...filters,
        [key]: filters[key] === value ? null : value,
      });
    };

    const noiseLevels: { value: NoiseLevel; label: string; icon: string }[] = [
      { value: 'QUIET', label: 'Calme', icon: '🤫' },
      { value: 'MODERATE', label: 'Modéré', icon: '🔉' },
      { value: 'LOUD', label: 'Animé', icon: '🔊' },
    ];

    const priceRanges: { value: PriceRange; label: string }[] = [
      { value: 'FREE', label: 'Gratuit' },
      { value: 'CHEAP', label: 'Pas cher' },
      { value: 'MODERATE', label: 'Modéré' },
      { value: 'EXPENSIVE', label: 'Cher' },
    ];

    const spotTypes: { value: SpotType; label: string; Icon: any }[] = [
      { value: 'CAFE', label: 'Café', Icon: Coffee },
      { value: 'LIBRARY', label: 'Bibliothèque', Icon: BookOpen },
      { value: 'COWORKING', label: 'Coworking', Icon: Building },
      { value: 'PARK', label: 'Parc', Icon: Trees },
      { value: 'OTHER', label: 'Autre', Icon: HelpCircle },
    ];

    const activeFiltersCount = Object.values(filters).filter((v) => v !== null).length;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? '#64748B' : '#CBD5E1',
        }}
      >
        <BottomSheetView className="flex-1">
          <View className="border-border flex-row items-center justify-between border-b px-6 pb-4">
            <Text className="text-text-title text-xl font-bold">Filtres</Text>
            <View className="flex-row items-center gap-3">
              {activeFiltersCount > 0 && (
                <TouchableOpacity onPress={onReset}>
                  <Text className="text-primary text-sm font-semibold">Réinitialiser</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
            {/* Équipements */}
            <View className="mb-6">
              <Text className="text-text-title mb-3 text-base font-semibold">Équipements</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => toggleFilter('hasWifi', true)}
                  className={`flex-1 flex-row items-center justify-center rounded-xl border py-3 ${
                    filters.hasWifi === true
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface'
                  }`}
                >
                  <Wifi
                    size={18}
                    color={filters.hasWifi === true ? '#2563EB' : '#94A3B8'}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      filters.hasWifi === true ? 'text-primary' : 'text-text-muted'
                    }`}
                  >
                    WiFi
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleFilter('hasPower', true)}
                  className={`flex-1 flex-row items-center justify-center rounded-xl border py-3 ${
                    filters.hasPower === true
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface'
                  }`}
                >
                  <Zap
                    size={18}
                    color={filters.hasPower === true ? '#2563EB' : '#94A3B8'}
                  />
                  <Text
                    className={`ml-2 font-medium ${
                      filters.hasPower === true ? 'text-primary' : 'text-text-muted'
                    }`}
                  >
                    Prises
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Type de lieu */}
            <View className="mb-6">
              <Text className="text-text-title mb-3 text-base font-semibold">Type de lieu</Text>
              <View className="flex-row flex-wrap gap-2">
                {spotTypes.map(({ value, label, Icon }) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => toggleFilter('type', value)}
                    className={`flex-row items-center rounded-full border px-4 py-2 ${
                      filters.type === value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <Icon
                      size={16}
                      color={filters.type === value ? '#2563EB' : '#94A3B8'}
                    />
                    <Text
                      className={`ml-2 text-sm font-medium ${
                        filters.type === value ? 'text-primary' : 'text-text-muted'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Niveau sonore */}
            <View className="mb-6">
              <Text className="text-text-title mb-3 text-base font-semibold">Niveau sonore</Text>
              <View className="flex-row gap-2">
                {noiseLevels.map(({ value, label, icon }) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => toggleFilter('noiseLevel', value)}
                    className={`flex-1 items-center rounded-xl border py-3 ${
                      filters.noiseLevel === value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <Text className="mb-1 text-lg">{icon}</Text>
                    <Text
                      className={`text-sm font-medium ${
                        filters.noiseLevel === value ? 'text-primary' : 'text-text-muted'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Fourchette de prix */}
            <View className="mb-8">
              <Text className="text-text-title mb-3 text-base font-semibold">Fourchette de prix</Text>
              <View className="flex-row flex-wrap gap-2">
                {priceRanges.map(({ value, label }) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => toggleFilter('priceRange', value)}
                    className={`rounded-full border px-4 py-2 ${
                      filters.priceRange === value
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        filters.priceRange === value ? 'text-primary' : 'text-text-muted'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Bouton Appliquer */}
          <View className="border-border border-t px-6 pt-4 pb-8">
            <TouchableOpacity
              onPress={() => (ref as any)?.current?.close()}
              className="bg-primary items-center rounded-xl py-4"
            >
              <Text className="text-base font-bold text-white">
                Appliquer les filtres
                {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

FilterBottomSheet.displayName = 'FilterBottomSheet';

export default FilterBottomSheet;