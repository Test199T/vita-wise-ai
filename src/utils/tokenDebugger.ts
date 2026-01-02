// src/utils/tokenDebugger.ts
// Utility for debugging JWT tokens

export const debugToken = () => {
  const token = localStorage.getItem('token');
  
  
  if (!token) {
    return;
  }
  
  if (typeof token !== 'string') {
    return;
  }
  
  const parts = token.split('.');
  
  if (parts.length !== 3) {
    return;
  }
  
  try {
    // Decode header
    const header = JSON.parse(atob(parts[0]));
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check for user ID fields
    const possibleUserIdFields = ['userId', 'id', 'sub', 'user_id', 'user'];
    const foundUserIdFields = possibleUserIdFields.filter(field => payload[field] !== undefined);
    
    
    foundUserIdFields.forEach(field => {
    });
    
    // Check expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;
      
    }
    
    
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
  
  return testToken;
};

// Function to clear token
export const clearToken = () => {
  localStorage.removeItem('token');
};
