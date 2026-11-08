import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign iframe dev-server WebSocket disconnect errors
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('WebSocket') ||
    event.reason?.message?.includes('ws') ||
    String(event.reason).includes('WebSocket')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);
