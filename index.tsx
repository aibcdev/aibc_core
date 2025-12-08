import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Error boundary for React rendering
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Don't prevent default - let React handle it
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Don't prevent default - let React handle it
});

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback: render a simple error message
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #050505; color: white; font-family: Inter, sans-serif;">
      <div style="text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Error Loading Application</h1>
        <p style="color: #999;">Please refresh the page or contact support.</p>
        <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #FF5E1E; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>
      </div>
    </div>
  `;
}