import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';

const basename = '/testbed'; // for this testbed build

createRoot(document.getElementById('root')).render(
  <BrowserRouter basename={basename}>
    <Routes>
      <Route path="/" element={<LoginPage />} />
    </Routes>
  </BrowserRouter>
);
