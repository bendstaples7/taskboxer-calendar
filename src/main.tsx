<<<<<<< HEAD
=======

>>>>>>> 55a5fc8873c6036995a9d5a48f62443b9f9ac6b5
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
<<<<<<< HEAD
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
=======
import { Toaster } from '@/components/ui/toaster';
import './components/styles.css'; // Import our custom styles

// Load Google API script
const script = document.createElement('script');
script.src = 'https://apis.google.com/js/api.js';
script.async = true;
script.defer = true;
document.head.appendChild(script);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>,
>>>>>>> 55a5fc8873c6036995a9d5a48f62443b9f9ac6b5
);
