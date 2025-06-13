import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      
      // Check if we have direct tokens from backend (new flow)
      const accessToken = params.get('access');
      const refreshToken = params.get('refresh');
      const userDataString = params.get('user');
      const directError = params.get('error');

      // Handle direct token flow (from your updated backend)
      if (accessToken && refreshToken && userDataString) {
        try {
          const userData = JSON.parse(decodeURIComponent(userDataString));
          
          // Store tokens in Redux
          dispatch(setCredentials({
            user: userData,
            token: accessToken,
            refreshToken: refreshToken
          }));

          // Store tokens in localStorage for persistence (matching authSlice keys)
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(userData));

          // Clean up session storage
          sessionStorage.removeItem('oauth_state');

          // Navigate based on user role
          if (userData.role === 'customer') {
            navigate('/');
          } else if (userData.role === 'admin') {
            navigate('/admin');
          } else if (userData.role === 'delivery') {
            navigate('/delivery/tasks');
          } else {
            navigate('/');
          }
          return;
        } catch (error) {
          console.error('Error parsing OAuth tokens:', error);
          sessionStorage.removeItem('oauth_state');
          navigate('/login', { state: { error: 'Failed to process authentication tokens' } });
          return;
        }
      }

      // Handle direct error from backend
      if (directError) {
        console.error('Backend OAuth error:', directError);
        sessionStorage.removeItem('oauth_state');
        navigate('/login', { state: { error: decodeURIComponent(directError) } });
        return;
      }

      // Original flow - handle authorization code exchange
      const code = params.get('code');
      const error = params.get('error');
      const returnedState = params.get('state');
      const storedState = sessionStorage.getItem('oauth_state');

      // State validation for original flow
      if (code && returnedState !== storedState) {
        console.error('State mismatch. Possible CSRF attack.');
        sessionStorage.removeItem('oauth_state');
        navigate('/login', { state: { error: 'State mismatch. Authentication failed.' } });
        return;
      }

      if (error) {
        console.error('Google OAuth error:', error);
        sessionStorage.removeItem('oauth_state');
        navigate('/login', { state: { error: `Google authentication failed: ${error}` } });
        return;
      }

      if (!code) {
        console.error('No authorization code or tokens received');
        sessionStorage.removeItem('oauth_state');
        navigate('/login', { state: { error: 'No authorization data received' } });
        return;
      }

      // Original server-side token exchange flow
      try {
        const response = await axios.post(
          'https://mm-backend-8rp8.onrender.com/api/users/google/',
          { code },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { user, access, refresh } = response.data;
        
        // Store tokens in Redux
        dispatch(setCredentials({ 
          user, 
          token: access,
          refreshToken: refresh 
        }));

        // Store tokens in localStorage for persistence (matching authSlice keys)
        localStorage.setItem('token', access);
        if (refresh) {
          localStorage.setItem('refreshToken', refresh);
        }
        localStorage.setItem('user', JSON.stringify(user));

        sessionStorage.removeItem('oauth_state');
        
        // Navigate based on user role
        if (user.role === 'customer') {
          navigate('/');
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'delivery') {
          navigate('/delivery/tasks');
        } else {
          navigate('/');
        }
      } catch (error: unknown) {
        console.error('Google login failed:', error);
        sessionStorage.removeItem('oauth_state');
        navigate('/login', { state: { error: 'Failed to authenticate with the server' } });
      }
    };

    handleCallback();
  }, [location, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we verify your credentials...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;