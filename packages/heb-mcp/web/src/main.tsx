import { ClerkProvider } from '@clerk/clerk-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __connectConfig?: {
      signInUrl: string | null;
      clerkPublishableKey: string | null;
      clerkFrontendApi: string | null;
      clerkJwtTemplate: string | null;
    };
  }
}

const publishableKey = window.__connectConfig?.clerkPublishableKey || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey && window.location.pathname !== '/extension-auth-success') {
  console.warn('Clerk publishable key not found. Authentication will not work.');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        <App />
      </ClerkProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
