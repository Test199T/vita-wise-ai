// src/utils/errorHandler.ts
export class AIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export const handleAIError = (error: any) => {
  if (error instanceof AIError) {
    console.error(`AI Service Error [${error.statusCode}]: ${error.message}`);
    
    switch (error.statusCode) {
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        // Show permission denied message
        alert('You do not have permission to access this feature');
        break;
      case 500:
        // Show server error message
        alert('Server error. Please try again later.');
        break;
      default:
        alert(`Error: ${error.message}`);
    }
  } else {
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred');
  }
};
