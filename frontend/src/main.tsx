// Build: 20260403-v3 force cache bust
const APP_VERSION = '2.0.3-' + '20260403';
console.log('UGC Station', APP_VERSION);
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
