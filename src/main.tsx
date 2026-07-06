import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { handleMockFetch } from './apiFallback.ts';

// Intercept window.fetch for flawless offline/Vercel support
const originalFetch = window.fetch;
const customFetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url);
  
  if (url.startsWith('/api/')) {
    const isOnVercel = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');
    const forceFallback = localStorage.getItem('force_fallback') === 'true';
    
    if (isOnVercel || forceFallback) {
      return handleMockFetch(url, init);
    }
    
    try {
      const res = await originalFetch(input, init);
      if (res.status === 404) {
        console.warn(`[API 404] Endpoint not found: ${url}. Activating client-side fallback.`);
        localStorage.setItem('force_fallback', 'true');
        return handleMockFetch(url, init);
      }
      return res;
    } catch (err) {
      console.warn(`[API Error] Request failed to: ${url}. Activating client-side fallback.`, err);
      localStorage.setItem('force_fallback', 'true');
      return handleMockFetch(url, init);
    }
  }
  
  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    configurable: true,
    writable: true,
    enumerable: true
  });
} catch (e) {
  console.warn('Failed to define window.fetch via Object.defineProperty, attempting direct assignment:', e);
  try {
    (window as any).fetch = customFetch;
  } catch (err) {
    console.error('Failed to override window.fetch completely:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
