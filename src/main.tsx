import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './components/styles.css';
import { Toaster } from '@/components/ui/toaster';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = '267714022298-mm144g9hscrmbressjhj43c18pfb6vc6.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
      <Toaster />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
