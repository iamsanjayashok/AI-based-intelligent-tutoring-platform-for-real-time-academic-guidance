console.log("main.tsx loading...");

import React from 'react';
import { createRoot } from 'react-dom/client';

console.log("React and createRoot imported");

import App from './App';
import './index.css';

console.log("App and CSS imported");

window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global error caught:", { message, source, lineno, colno, error });
};

window.onunhandledrejection = function(event) {
  console.error("Unhandled promise rejection:", event.reason);
};

console.log("App starting...");
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
