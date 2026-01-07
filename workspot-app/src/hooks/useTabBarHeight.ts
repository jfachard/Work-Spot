import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useTabBarHeight = () => {
  const insets = useSafeAreaInsets();
  return 50 + insets.bottom;
};
