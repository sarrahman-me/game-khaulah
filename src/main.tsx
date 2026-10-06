import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { gameStore } from './state/useGameStore';

(window as any).gameStore = gameStore;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
