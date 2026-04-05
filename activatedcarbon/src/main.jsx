import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; 
import AuthWrapper from './AuthWrapper';

import './index.css';

//const { accountid } = useContext(AuthContext);
// 🧠 Extract vertical and accountid from the current path
//const pathParts = window.location.pathname.split('/');
//const vertical = pathParts[1];      // expected: 'activatedcarbon'
//const accountid = pathParts[2];     // e.g. 'samcarbons'
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  let accountid = null;

  if (pathParts[0] === 'activatedcarbon') {
    // /activatedcarbon/:accountid
    accountid = pathParts[1] || null;
  } else if (pathParts[0] === 'testbed' && pathParts[1] === 'activatedcarbon') {
    // /testbed/activatedcarbon/:accountid
    accountid = pathParts[2] || null;
  }

  
const basename = import.meta.env.VITE_BASENAME;
// 🚨 Safety check
if (!accountid) {
  throw new Error('Invalid URL: missing vertical or accountid');
}


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={`/${basename}/${accountid}`}>
      <AuthWrapper>
        <App />
      </AuthWrapper>
    </BrowserRouter>
  </React.StrictMode>
);

