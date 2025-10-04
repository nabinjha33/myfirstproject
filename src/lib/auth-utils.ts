/**
 * Authentication utilities for handling logout and re-login flows
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LogoutReloginOptions {
  onStatusUpdate?: (message: string, type: 'info' | 'error' | 'success') => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Performs automatic logout and re-login flow
 * This is useful when a user is already logged in but needs to authenticate with different credentials
 */
export async function performLogoutAndRelogin(
  signOut: () => Promise<void>,
  signIn: any,
  credentials: LoginCredentials,
  options: LogoutReloginOptions = {}
): Promise<boolean> {
  const { onStatusUpdate, onComplete, onError } = options;

  try {
    // Step 1: Logout current user
    onStatusUpdate?.('Logging out current session...', 'info');
    await signOut();
    
    // Step 2: Wait a moment for logout to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Attempt login with new credentials
    onStatusUpdate?.('Attempting login with provided credentials...', 'info');
    
    const result = await signIn.create({
      identifier: credentials.email,
      password: credentials.password,
    });

    if (result.status === 'complete') {
      onStatusUpdate?.('Login successful! Redirecting...', 'success');
      onComplete?.();
      return true;
    } else {
      onError?.('Login incomplete. Please try again.');
      return false;
    }
  } catch (error: any) {
    console.error('Logout and re-login error:', error);
    
    if (error.errors && error.errors[0]) {
      const errorCode = error.errors[0].code;
      let errorMessage = 'Login failed. Please check your credentials.';
      
      switch (errorCode) {
        case 'form_identifier_not_found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'form_password_incorrect':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'form_identifier_exists':
          errorMessage = 'Account verification required. Please check your email.';
          break;
      }
      
      onError?.(errorMessage);
    } else {
      onError?.('Login failed. Please check your credentials and try again.');
    }
    
    return false;
  }
}

/**
 * Checks if an error indicates a session conflict that requires logout and re-login
 */
export function isSessionConflictError(error: any): boolean {
  if (!error?.errors?.[0]) return false;
  
  const errorCode = error.errors[0].code;
  return errorCode === 'session_exists' || errorCode === 'session_token_invalid';
}

/**
 * Handles session conflict by automatically performing logout and re-login
 */
export async function handleSessionConflict(
  signOut: () => Promise<void>,
  signIn: any,
  credentials: LoginCredentials,
  options: LogoutReloginOptions = {}
): Promise<boolean> {
  const { onStatusUpdate } = options;
  
  onStatusUpdate?.('Session conflict detected. Refreshing authentication...', 'info');
  
  return await performLogoutAndRelogin(signOut, signIn, credentials, {
    ...options,
    onStatusUpdate: (message, type) => {
      onStatusUpdate?.(message, type);
    }
  });
}
