import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent third-party browser extensions (e.g. MetaMask inpage.js) from triggering app error overlays
function isBrowserExtensionNoise(source?: string, stack?: string, message?: string): boolean {
  const combined = `${source ?? ''} ${stack ?? ''} ${message ?? ''}`;
  return (
    /chrome-extension:\/\/|moz-extension:\/\/|safari-extension:\/\//i.test(combined) ||
    combined.includes('Failed to connect to MetaMask')
  );
}

window.addEventListener(
  'error',
  (event) => {
    const err = event.error as Error | undefined;
    if (isBrowserExtensionNoise(event.filename, err?.stack, event.message || err?.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true
);

window.addEventListener(
  'unhandledrejection',
  (event) => {
    const reason = event.reason as { stack?: string; message?: string } | string | undefined;
    const stack = typeof reason === 'object' ? reason?.stack : '';
    const message = typeof reason === 'object' ? reason?.message : String(reason ?? '');
    if (isBrowserExtensionNoise('', stack, message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true
);

createRoot(document.getElementById('root')!).render(<App />);
