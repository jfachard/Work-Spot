export const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDNAME,
  uploadPreset: {
    avatar: process.env.EXPO_PUBLIC_AVATAR,
    spots: process.env.EXPO_PUBLIC_SPOTS,
  },
};
