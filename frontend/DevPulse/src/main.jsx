// frontend/DevPulse/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/index.css";

console.log('=== MAIN.JSX LOADED ===');
console.log('React version:', React.version);
console.log('ReactDOM available:', typeof ReactDOM !== 'undefined');

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('❌ Root element not found!');
  // Create root element if it doesn't exist
  const body = document.body;
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  body.appendChild(newRoot);
  console.log('✅ Created root element');
} else {
  console.log('✅ Root element found');
}

console.log('Root element:', rootElement);
console.log('Root innerHTML before render:', rootElement.innerHTML);

try {
  console.log('Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  
  console.log('Rendering App component...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('✅ App rendered successfully!');
  
  // Check after a short delay if React actually rendered
  setTimeout(() => {
    console.log('Root innerHTML after render:', rootElement.innerHTML);
    if (rootElement.innerHTML.trim() === '') {
      console.error('❌ WARNING: Root element is still empty after render!');
      console.error('This means React did not render anything.');
      // Fallback: render a simple test div
      rootElement.innerHTML = `
        <div style="padding: 2rem; background: #ff0000; color: white; text-align: center;">
          <h1>⚠️ React Rendering Issue</h1>
          <p>Root element is empty. Check console for errors.</p>
          <p>If you see this, JavaScript is working but React failed to render.</p>
        </div>
      `;
    }
  }, 1000);
  
} catch (error) {
  console.error('❌ ERROR RENDERING REACT APP:', error);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  
  // Fallback: render error message directly
  rootElement.innerHTML = `
    <div style="padding: 2rem; background: #ff0000; color: white; font-family: monospace;">
      <h1>❌ Critical Error</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <details>
        <summary>Stack Trace</summary>
        <pre style="background: #000; padding: 1rem; overflow: auto;">${error.stack}</pre>
      </details>
      <p>Check browser console (F12) for more details.</p>
    </div>
  `;
}
