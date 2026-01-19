import { CLOUDINARY_CONFIG } from '../config/cloudinary';

type UploadType = 'avatar' | 'spots';

export const cloudinaryService = {
  async uploadImage(imageUri: string, type: UploadType): Promise<string> {
    const formData = new FormData();

    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('file', {
      uri: imageUri,
      type: `image/${fileType}`,
      name: `upload.${fileType}`,
    } as any);

    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset[type]);
    formData.append('folder', `workspot/${type}`);

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

  async uploadMultipleImages(imageUris: string[], type: UploadType = 'spots'): Promise<string[]> {
    const uploadPromises = imageUris.map((uri) => this.uploadImage(uri, type));
    return Promise.all(uploadPromises);
  },
};
