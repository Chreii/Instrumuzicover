import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App, { ErrorBoundary } from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HashRouter>
  </StrictMode>,
);
