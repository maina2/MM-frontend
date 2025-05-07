import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');
      const returnedState = params.get('state');
      const storedState = sessionStorage.getItem('oauth_state');
  
      console.log('Query params:', {
        code,
        error,
        returnedState,
        storedState,
      });
  
      if (returnedState !== storedState) {
        console.error('State mismatch. Possible CSRF attack.');
        navigate('/login', { state: { error: 'State mismatch. Authentication failed.' } });
        return;
      }
  
      sessionStorage.removeItem('oauth_state');
  
      if (error) {
        console.error('Google OAuth error:', error);
        navigate('/login', { state: { error: 'Google authentication failed: ' + error } });
        return;
      }
  
      if (code) {
        try {
          console.log('Sending code to backend:', code);
          const response = await axios.post('http://localhost:8000/api/users/google/', {
            code,
          });
  
          const { user, access, refresh } = response.data;
          dispatch(setCredentials({ user, token: access }));
          navigate('/');
        } catch (error) {
          console.error('Google login failed:', error);
          navigate('/login', { state: { error: 'Failed to authenticate with the server' } });
        }
      } else {
        navigate('/login', { state: { error: 'No authorization code received' } });
      }
    };
  
    handleCallback();
  }, [location, navigate, dispatch]);

  return <div className="container mx-auto p-4">Loading...</div>;
};

export default GoogleCallback;