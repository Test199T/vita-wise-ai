import { useState, useEffect } from 'react';

export const useProfilePicture = () => {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load profile picture from localStorage on mount
  useEffect(() => {
    const savedPicture = localStorage.getItem('profilePicture');
    if (savedPicture) {
      setProfilePicture(savedPicture);
    }
  }, []);

  // Update profile picture and save to localStorage
  const updateProfilePicture = (pictureDataUrl: string) => {
    setProfilePicture(pictureDataUrl);
    localStorage.setItem('profilePicture', pictureDataUrl);
  };

  // Remove profile picture
  const removeProfilePicture = () => {
    setProfilePicture(null);
    localStorage.removeItem('profilePicture');
  };

  // Upload and process image file
  const uploadProfilePicture = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        resolve(false);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        resolve(false);
        return;
      }

      setLoading(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateProfilePicture(result);
        setLoading(false);
        resolve(true);
      };
      
      reader.onerror = () => {
        setLoading(false);
        resolve(false);
      };
      
      reader.readAsDataURL(file);
    });
  };

  return {
    profilePicture,
    loading,
    updateProfilePicture,
    removeProfilePicture,
    uploadProfilePicture,
  };
};
