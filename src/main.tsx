import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './components/styles.css';
import { Toaster } from '@/components/ui/toaster';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Load client ID from environment variable
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <DndProvider backend={HTML5Backend}>
        <App />
        <Toaster />
      </DndProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
