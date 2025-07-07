import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AuthWrapper from './AuthWrapper'; 
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/samcarbon">
      <AuthWrapper>
        <App />
      </AuthWrapper>
    </BrowserRouter>
  </React.StrictMode>
);
