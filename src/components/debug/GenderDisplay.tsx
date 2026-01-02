import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';

const GenderDisplay: React.FC = () => {
  const { profile, loading, error } = useProfile();

  const getGenderDisplay = (gender: string | undefined) => {
    switch (gender) {
      case 'male':
        return { thai: 'ชาย', english: 'Male', color: 'bg-blue-500' };
      case 'female':
        return { thai: 'หญิง', english: 'Female', color: 'bg-pink-500' };
      case 'other':
        return { thai: 'อื่นๆ', english: 'Other', color: 'bg-purple-500' };
      default:
        return { thai: 'ไม่ระบุ', english: 'Not specified', color: 'bg-gray-500' };
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>เพศ - Gender Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p>กำลังโหลด...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">เพศ - Gender Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const genderInfo = getGenderDisplay(profile?.gender);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>เพศ - Gender Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">เพศ:</span>
          <Badge className={`${genderInfo.color} text-white`}>
            {genderInfo.thai} ({genderInfo.english})
          </Badge>
        </div>
        
        <div className="text-sm space-y-2">
          <div><strong>Raw Value:</strong> "{profile?.gender || 'undefined'}"</div>
          <div><strong>User ID:</strong> {profile?.id}</div>
          <div><strong>Email:</strong> {profile?.email}</div>
          <div><strong>Name:</strong> {profile?.first_name} {profile?.last_name}</div>
        </div>

        <div className="text-xs text-gray-500 border-t pt-2">
          <div><strong>Profile Object:</strong></div>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenderDisplay;
