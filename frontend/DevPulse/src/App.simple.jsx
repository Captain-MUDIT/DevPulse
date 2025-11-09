// SIMPLE VERSION FOR TESTING - Uncomment to use this instead
import React from 'react';
import './styles/index.css';

export default function SimpleApp() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', background: '#f0f0f0' }}>
      <h1 style={{ color: '#333' }}>Dev Pulse - Simple Test</h1>
      <p>If you see this, React is working!</p>
      <p>If the page is still blank, check browser console (F12) for errors.</p>
    </div>
  );
}

