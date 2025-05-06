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

      if (code) {
        try {
          // Send the authorization code to the backend
          const response = await axios.post('http://localhost:8000/api/users/google/', {
            code,
          });

          const { user, access, refresh } = response.data;

          // Dispatch the user and token to Redux
          dispatch(setCredentials({ user, token: access }));

          // Redirect to the home page
          navigate('/');
        } catch (error) {
          console.error('Google login failed:', error);
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [location, navigate, dispatch]);

  return <div>Loading...</div>;
};

export default GoogleCallback;