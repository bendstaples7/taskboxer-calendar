import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './components/styles.css';
import { Toaster } from '@/components/ui/toaster';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const clientId = '267714022298-mm144g9hscrmbressjhj43c18pfb6vc6.apps.googleusercontent.com';

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
