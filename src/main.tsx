import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId="268798045689-i79dke9fhtqb4hmv4okk1gditsb49efi.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>,
);