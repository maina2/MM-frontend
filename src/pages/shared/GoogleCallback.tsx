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
      const code = params.get('code');
      const error = params.get('error');
      const returnedState = params.get('state');
      const storedState = sessionStorage.getItem('oauth_state');


      if (returnedState !== storedState) {
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
        console.error('No authorization code received');
        sessionStorage.removeItem('oauth_state');
        navigate('/login', { state: { error: 'No authorization code received' } });
        return;
      }

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

        const { user, access } = response.data;
        dispatch(setCredentials({ user, token: access }));
        sessionStorage.removeItem('oauth_state');
        navigate('/');
      } catch (error: unknown) {
        console.error('Google login failed:', error);
        sessionStorage.removeItem('oauth_state');
        navigate('/login', { state: { error: 'Failed to authenticate with the server' } });
      }
    };

    handleCallback();
  }, [location, navigate, dispatch]);

  return <div className="container mx-auto p-4">Loading...</div>;
};

export default GoogleCallback;