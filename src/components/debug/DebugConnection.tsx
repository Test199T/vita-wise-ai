import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Database,
  Key,
  User,
  Server,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiService, userService } from '@/services/api';
import { tokenUtils } from '@/lib/utils';

interface ConnectionStatus {
  api: boolean;
  database: boolean;
  authentication: boolean;
  userProfile: boolean;
}

interface DebugInfo {
  token: string | null;
  tokenValid: boolean;
  user: Record<string, unknown> | null;
  apiBaseUrl: string;
  lastError: string | null;
  availableEndpoints: string[];
  lastAttemptedEndpoint: string | null;
}

export default function DebugConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    api: false,
    database: false,
    authentication: false,
    userProfile: false
  });
  
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    token: null,
    tokenValid: false,
    user: null,
    apiBaseUrl: 'http://localhost:3000',
    lastError: null,
    availableEndpoints: [],
    lastAttemptedEndpoint: null
  });
  
  const [loading, setLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const checkConnection = async () => {
    setLoading(true);
    setDebugInfo(prev => ({ 
      ...prev, 
      lastError: null,
      availableEndpoints: [],
      lastAttemptedEndpoint: null 
    }));

    const newStatus: ConnectionStatus = {
      api: false,
      database: false,
      authentication: false,
      userProfile: false
    };

    try {
      // 1. Check API Connection
      console.log('Testing API connection...');
      const apiConnected = await apiService.checkConnection();
      newStatus.api = apiConnected;
      
      // 2. Discover available endpoints
      if (apiConnected) {
        console.log('Discovering available endpoints...');
        const endpoints = await apiService.discoverEndpoints();
        setDebugInfo(prev => ({ ...prev, availableEndpoints: endpoints }));
      }
      
      // 3. Check Authentication
      console.log('Testing authentication...');
      const token = tokenUtils.getToken();
      const tokenValid = tokenUtils.isValidToken(token);
      newStatus.authentication = tokenValid;

      if (tokenValid) {
        // 4. Check User Profile (will try multiple endpoints)
        console.log('Testing user profile...');
        try {
          const profile = await apiService.getCurrentUserProfile();
          newStatus.userProfile = !!profile;
          
          // If we got real data (not mock), database is working
          if (apiConnected && profile && profile.id !== 1) {
            newStatus.database = true;
            setDebugInfo(prev => ({ ...prev, lastAttemptedEndpoint: 'Found working endpoint' }));
          } else if (profile && profile.id === 1) {
            // Mock data received - API not available but profile works
            newStatus.database = false;
            setDebugInfo(prev => ({ 
              ...prev, 
              lastError: 'Backend API endpoints not found. Using mock data for development.',
              lastAttemptedEndpoint: 'Tried: /user/profile, /users/profile, /profile, /me'
            }));
            console.log('Using mock profile data - no working profile endpoints');
          }
        } catch (error) {
          console.error('Profile fetch failed:', error);
          setDebugInfo(prev => ({ 
            ...prev, 
            lastAttemptedEndpoint: error instanceof Error ? error.message : 'Unknown error'
          }));
          
          if (error instanceof Error && error.message.includes('401')) {
            newStatus.authentication = false;
          }
        }
      }

      // Special case: if API is not connected but we have token and can use mock data
      if (!apiConnected && tokenValid) {
        setDebugInfo(prev => ({ 
          ...prev, 
          lastError: 'Backend API not available. Using mock data for development.',
          lastAttemptedEndpoint: 'API connection failed'
        }));
      }

    } catch (error) {
      console.error('Connection check failed:', error);
      setDebugInfo(prev => ({ 
        ...prev, 
        lastError: error instanceof Error ? error.message : 'Unknown error',
        lastAttemptedEndpoint: 'Connection check failed'
      }));
    }

    // Update debug info
    const token = tokenUtils.getToken();
    const user = userService.getCurrentUserFromStorage();
    
    setDebugInfo(prev => ({
      ...prev,
      token,
      tokenValid: tokenUtils.isValidToken(token),
      user
    }));

    setStatus(newStatus);
    setLoading(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const clearData = () => {
    userService.clearUserData();
    localStorage.clear();
    setDebugInfo(prev => ({
      ...prev,
      token: null,
      tokenValid: false,
      user: null
    }));
    checkConnection();
  };

  const StatusIcon = ({ status: isOk }: { status: boolean }) => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />;
    return isOk ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (isOk: boolean) => {
    if (loading) return 'secondary';
    return isOk ? 'default' : 'destructive';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Connection Status
            <Button 
              onClick={checkConnection} 
              disabled={loading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                <span>API Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={status.api} />
                <Badge variant={getStatusColor(status.api)}>
                  {loading ? 'Testing...' : (status.api ? 'Connected' : 'Failed')}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Database</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={status.database} />
                <Badge variant={getStatusColor(status.database)}>
                  {loading ? 'Testing...' : (status.database ? 'Connected' : status.api ? 'API OK, DB Failed' : 'Backend Offline')}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span>Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={status.authentication} />
                <Badge variant={getStatusColor(status.authentication)}>
                  {loading ? 'Testing...' : (status.authentication ? 'Valid' : 'Invalid')}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>User Profile</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={status.userProfile} />
                <Badge variant={getStatusColor(status.userProfile)}>
                  {loading ? 'Testing...' : (
                    status.userProfile ? 
                      (status.database ? 'Real Data' : 'Mock Data') : 
                      'Failed'
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {debugInfo.lastError && (
            <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50 rounded">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Warning:</span>
              </div>
              <p className="text-yellow-600 text-sm mt-1">{debugInfo.lastError}</p>
              {debugInfo.lastError.includes('mock data') && (
                <p className="text-yellow-600 text-xs mt-2">
                  💡 นี่เป็นเรื่องปกติในขณะที่ Backend ยังไม่พร้อม ระบบจะใช้ข้อมูลจำลองเพื่อการทดสอบ
                </p>
              )}
            </div>
          )}

          <Separator />

          {/* Debug Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Debug Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">API Base URL</Label>
                <p className="text-sm text-muted-foreground font-mono">
                  {debugInfo.apiBaseUrl}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Token Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={debugInfo.tokenValid ? 'default' : 'destructive'}>
                    {debugInfo.tokenValid ? 'Valid' : 'Invalid'}
                  </Badge>
                  {debugInfo.token && (
                    <span className="text-sm text-muted-foreground">
                      ({debugInfo.token.length} chars)
                    </span>
                  )}
                </div>
              </div>

              {debugInfo.availableEndpoints.length > 0 && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Available Endpoints</Label>
                  <div className="mt-1 space-y-1">
                    {debugInfo.availableEndpoints.map((endpoint, index) => (
                      <div key={index} className="text-xs font-mono bg-green-100 p-2 rounded">
                        ✅ {debugInfo.apiBaseUrl}{endpoint}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {debugInfo.lastAttemptedEndpoint && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Profile Endpoint Status</Label>
                  <p className="text-xs font-mono bg-yellow-100 p-2 rounded mt-1">
                    {debugInfo.lastAttemptedEndpoint}
                  </p>
                </div>
              )}

              {debugInfo.token && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Label className="text-sm font-medium">Token</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                    {showToken ? debugInfo.token : `${debugInfo.token.substring(0, 20)}...`}
                  </p>
                </div>
              )}

              {debugInfo.user && (
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">User Data</Label>
                  <pre className="text-xs font-mono bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                    {JSON.stringify(debugInfo.user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={clearData} variant="destructive" size="sm">
              Clear All Data
            </Button>
            <Button 
              onClick={() => window.location.href = '/login'} 
              variant="outline" 
              size="sm"
            >
              Go to Login
            </Button>
            <Button 
              onClick={() => window.location.href = '/profile'} 
              variant="outline" 
              size="sm"
            >
              Go to Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const Label = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>
    {children}
  </label>
);
