import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('main.jsx: Starting app initialization...');

const rootElement = document.getElementById('root');
console.log('main.jsx: Root element found:', rootElement);

if (!rootElement) {
  console.error('main.jsx: Root element not found!');
} else {
  try {
    console.log('main.jsx: Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    console.log('main.jsx: Rendering App...');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('main.jsx: App rendered successfully');
  } catch (error) {
    console.error('main.jsx: Error during render:', error);
  }
}