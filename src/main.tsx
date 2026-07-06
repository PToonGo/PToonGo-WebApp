// Protection against read-only window.fetch assignment errors from third-party polyfills
try {
  if (typeof window !== 'undefined') {
    if (window.FormData && !window.FormData.prototype.keys) {
      window.FormData.prototype.keys = function* () {};
    }
    let currentFetch = window.fetch;
    if (currentFetch) {
      Object.defineProperty(window, 'fetch', {
        get: () => currentFetch,
        set: (val) => {
          currentFetch = val;
        },
        configurable: true,
        enumerable: true
      });
    }
  }
} catch (e) {
  console.warn("Could not apply window.fetch safety wrapper:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
