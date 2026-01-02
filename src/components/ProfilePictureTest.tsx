import React from 'react';
import { useProfilePicture } from '@/hooks/useProfilePicture';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Trash2, Loader2 } from 'lucide-react';

export const ProfilePictureTest: React.FC = () => {
  const { 
    profilePicture, 
    loading, 
    uploadProfilePicture, 
    removeProfilePicture 
  } = useProfilePicture();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await uploadProfilePicture(file);
      if (success) {
        console.log('Profile picture uploaded successfully');
      } else {
        console.error('Failed to upload profile picture');
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Profile Picture Test</h2>
      
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {profilePicture ? (
            <AvatarImage src={profilePicture} alt="Profile" />
          ) : (
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
              U
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="space-y-2">
          <Button 
            onClick={handleUploadClick}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {loading ? 'Uploading...' : 'Upload Picture'}
          </Button>
          
          {profilePicture && (
            <Button 
              onClick={removeProfilePicture}
              variant="outline"
              className="flex items-center gap-2 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Remove Picture
            </Button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="text-sm text-muted-foreground">
        <p>Current picture: {profilePicture ? 'Set' : 'Not set'}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};
