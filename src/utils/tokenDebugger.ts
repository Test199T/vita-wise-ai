// src/utils/tokenDebugger.ts
// Utility for debugging JWT tokens

export const debugToken = () => {
  const token = localStorage.getItem('token');
  
  console.log('=== Token Debug Information ===');
  console.log('Raw token:', token);
  
  if (!token) {
    console.log('❌ No token found in localStorage');
    return;
  }
  
  if (typeof token !== 'string') {
    console.log('❌ Token is not a string:', typeof token);
    return;
  }
  
  const parts = token.split('.');
  console.log('Token parts count:', parts.length);
  
  if (parts.length !== 3) {
    console.log('❌ Invalid JWT format - should have 3 parts');
    return;
  }
  
  try {
    // Decode header
    const header = JSON.parse(atob(parts[0]));
    console.log('Header:', header);
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    console.log('Payload:', payload);
    
    // Check for user ID fields
    const possibleUserIdFields = ['userId', 'id', 'sub', 'user_id', 'user'];
    const foundUserIdFields = possibleUserIdFields.filter(field => payload[field] !== undefined);
    
    console.log('Possible user ID fields:', possibleUserIdFields);
    console.log('Found user ID fields:', foundUserIdFields);
    
    foundUserIdFields.forEach(field => {
      console.log(`${field}:`, payload[field], typeof payload[field]);
    });
    
    // Check expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;
      
      console.log('Token expiration:', expDate.toISOString());
      console.log('Current time:', now.toISOString());
      console.log('Is expired:', isExpired);
    }
    
    console.log('=== End Token Debug ===');
    
  } catch (error) {
    console.error('❌ Error decoding token:', error);
  }
};

// Function to manually set a test token
export const setTestToken = (userId: number) => {
  const testPayload = {
    userId: userId,
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  const testHeader = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  // Create a simple test token (not cryptographically secure)
  const headerB64 = btoa(JSON.stringify(testHeader));
  const payloadB64 = btoa(JSON.stringify(testPayload));
  const signature = 'test-signature';
  
  const testToken = `${headerB64}.${payloadB64}.${signature}`;
  
  localStorage.setItem('token', testToken);
  console.log('Test token set with user ID:', userId);
  console.log('Test token:', testToken);
  
  return testToken;
};

// Function to clear token
export const clearToken = () => {
  localStorage.removeItem('token');
  console.log('Token cleared');
};
