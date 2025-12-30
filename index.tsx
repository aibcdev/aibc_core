import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:rootElement',message:'ROOT ELEMENT NOT FOUND',data:{documentReady:document.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-init',hypothesisId:'H22'})}).catch(()=>{});
  // #endregion
  throw new Error("Could not find root element to mount to");
}
// #region agent log
fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:rootElement',message:'ROOT ELEMENT FOUND',data:{documentReady:document.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-init',hypothesisId:'H22'})}).catch(()=>{});
// #endregion

// Global error handlers for uncaught errors with instrumentation
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // #region agent log
  const errorInfo = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error ? {
      name: event.error.name,
      message: event.error.message,
      stack: event.error.stack
    } : null
  };
  fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:window.error',message:'GLOBAL ERROR CAUGHT',data:errorInfo,timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-error',hypothesisId:'H21'})}).catch(()=>{});
  // #endregion
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // #region agent log
  const rejectionInfo = {
    reason: event.reason ? (typeof event.reason === 'string' ? event.reason : {
      name: event.reason?.name,
      message: event.reason?.message,
      stack: event.reason?.stack
    }) : 'Unknown rejection'
  };
  fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:unhandledrejection',message:'UNHANDLED PROMISE REJECTION',data:rejectionInfo,timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-error',hypothesisId:'H21'})}).catch(()=>{});
  // #endregion
});

// #region agent log
fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:render',message:'ATTEMPTING TO RENDER APP',data:{hasRootElement:!!rootElement},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-init',hypothesisId:'H22'})}).catch(()=>{});
// #endregion

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:render',message:'APP RENDERED SUCCESSFULLY',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-init',hypothesisId:'H22'})}).catch(()=>{});
  // #endregion
} catch (renderError: any) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/62bd50d3-9960-40ff-8da7-b4d57e001c2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:render',message:'APP RENDER FAILED',data:{error:renderError?.message,stack:renderError?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'frontend-init',hypothesisId:'H22'})}).catch(()=>{});
  // #endregion
  console.error('Failed to render app:', renderError);
  throw renderError;
}