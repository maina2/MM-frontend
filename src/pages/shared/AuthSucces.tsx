import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');
    const user = params.get('user');

    if (access && refresh && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        dispatch(setCredentials({ user: userData, token: access }));
        // Redirect based on user role
        if (userData.role === 'customer') navigate('/');
        else if (userData.role === 'admin') navigate('/admin');
        else if (userData.role === 'delivery') navigate('/delivery/tasks');
        else navigate('/');
      } catch (e) {
        console.error('Error parsing user data:', e);
        navigate('/login', { state: { error: 'Authentication failed' } });
      }
    } else {
      navigate('/login', { state: { error: 'Authentication failed' } });
    }
  }, [navigate, dispatch, location.search]); // Added location.search

  return <div className="container mx-auto p-4">Loading...</div>;
};

export default AuthSuccess;