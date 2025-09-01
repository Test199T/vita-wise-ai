import { useState, useEffect, useCallback } from 'react';
import { apiService, UserProfile, APIError } from '@/services/api';
import { userService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  isLoggedIn: boolean;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isLoggedIn = userService.isLoggedIn();

  // Fetch profile data from API
  const fetchProfile = useCallback(async () => {
    if (!isLoggedIn) {
      setProfile(null);
      setLoading(false);
      setError('User not logged in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Fetching user profile...');
      const profileData = await apiService.getCurrentUserProfile();
      
      if (profileData) {
        setProfile(profileData);
        // Save to localStorage as backup
        userService.saveUserToStorage(profileData);
        
        // Check if it's mock data
        const isMockData = profileData.id === 1 && profileData.email === "test@example.com";
        
        console.log('Profile loaded successfully:', {
          id: profileData.id,
          email: profileData.email,
          name: `${profileData.first_name} ${profileData.last_name}`,
          isMockData: isMockData
        });
        
        if (isMockData) {
          setError('Using mock data - Backend not available');
        }
      } else {
        throw new Error('No profile data received');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      let errorMessage = 'Unable to load profile data';
      
      if (error instanceof Error) {
        if (error.message.includes('No valid authentication token')) {
          errorMessage = 'Authentication required. Please log in again.';
          // Clear invalid token
          userService.clearUserData();
        } else if (error.message.includes('connect') || error.message.includes('timeout')) {
          errorMessage = 'Backend not available. Using mock data for development.';
          // Try to load mock data directly
          try {
            const mockProfile = await apiService.getMockProfile();
            setProfile(mockProfile);
            setError('Using mock data - Backend not available');
            console.log('Loaded mock profile data');
            setLoading(false);
            return;
          } catch (mockError) {
            console.error('Failed to load mock data:', mockError);
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // Show toast notification for severe errors only
      if (!errorMessage.includes('mock data') && 
          !errorMessage.includes('Backend not available')) {
        toast({
          title: "ข้อผิดพลาด",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, toast]);

  // Update profile data
  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!profile) {
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่พบข้อมูลโปรไฟล์",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Updating profile...', data);
      const updatedProfile = await apiService.updateUserProfile(data);
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        // Update localStorage
        userService.saveUserToStorage(updatedProfile);
        
        toast({
          title: "บันทึกสำเร็จ",
          description: "ข้อมูลโปรไฟล์ได้รับการอัปเดตแล้ว",
        });
        
        console.log('Profile updated successfully');
        return true;
      } else {
        throw new Error('No updated profile data received');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'ไม่สามารถอัปเดตข้อมูลได้';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        const apiError = error as APIError;
        errorMessage = apiError.message;
        
        // Handle validation errors
        if (apiError.errors) {
          const validationMessages = Object.values(apiError.errors).flat();
          if (validationMessages.length > 0) {
            errorMessage = validationMessages.join(', ');
          }
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "ข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [profile, toast]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    updateProfile,
    isLoggedIn
  };
};
