
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('🚀 Application starting...');
console.log('Environment:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.BASE_URL);
console.log('Proxy URL:', import.meta.env.VITE_PROXY_URL);

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error("Could not find root element to mount to");
}

console.log('✅ Root element found, mounting React app...');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

console.log('✅ React app mounted');
