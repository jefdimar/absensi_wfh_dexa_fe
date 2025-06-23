import { useCallback } from 'react';
import { useMutation } from './useApi';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import toast from 'react-hot-toast';

export const useProfile = () => {
  const { updateUser } = useAuth();

  const updateProfileMutation = useMutation(profileService.updateProfile);
  const uploadPhotoMutation = useMutation(profileService.uploadPhoto);
  const updatePasswordMutation = useMutation(profileService.updatePassword);
  const updatePhoneMutation = useMutation(profileService.updatePhoneNumber);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const result = await updateProfileMutation.mutate(profileData);
      if (result.user) {
        updateUser(result.user);
      }
      toast.success('Profile updated successfully!');
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  }, [updateProfileMutation, updateUser]);

  const uploadPhoto = useCallback(async (photoFile) => {
    try {
      const result = await uploadPhotoMutation.mutate(photoFile);
      if (result.photoUrl || result.url) {
        updateUser({ profilePicture: result.photoUrl || result.url });
      }
      toast.success('Profile photo updated successfully!');
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to upload photo');
      throw error;
    }
  }, [uploadPhotoMutation, updateUser]);

  const updatePassword = useCallback(async (passwordData) => {
    try {
      const result = await updatePasswordMutation.mutate(passwordData);
      toast.success('Password updated successfully!');
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
      throw error;
    }
  }, [updatePasswordMutation]);

  const updatePhoneNumber = useCallback(async (phoneNumber) => {
    try {
      const result = await updatePhoneMutation.mutate({ phoneNumber });
      updateUser({ phoneNumber });
      toast.success('Phone number updated successfully!');
      return result;
    } catch (error) {
      toast.error(error.message || 'Failed to update phone number');
      throw error;
    }
  }, [updatePhoneMutation, updateUser]);

  return {
    updateProfile,
    uploadPhoto,
    updatePassword,
    updatePhoneNumber,
    isUpdating: updateProfileMutation.loading,
    isUploading: uploadPhotoMutation.loading,
    isUpdatingPassword: updatePasswordMutation.loading,
    isUpdatingPhone: updatePhoneMutation.loading,
    error: updateProfileMutation.error || uploadPhotoMutation.error ||
      updatePasswordMutation.error || updatePhoneMutation.error
  };
};