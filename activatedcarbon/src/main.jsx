import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; 
import AuthWrapper from './AuthWrapper';
import './index.css';

// 🧠 Extract vertical and accountid from the current path
const pathParts = window.location.pathname.split('/');
const vertical = pathParts[1];      // expected: 'activatedcarbon'
const accountid = pathParts[2];     // e.g. 'samcarbons'

// 🚨 Safety check
if (!vertical || !accountid) {
  throw new Error('Invalid URL: missing vertical or accountid');
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={`/${vertical}/${accountid}`}>
      <AuthWrapper>
        <App />
      </AuthWrapper>
    </BrowserRouter>
  </React.StrictMode>
);

