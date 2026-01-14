import { useEffect, useState } from 'react';
import AuthSuccess from './AuthSuccess';
import Connect from './Connect';
import OAuthInterstitial from './OAuthInterstitial';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (path === '/extension-auth-success') {
    return <AuthSuccess />;
  }

  if (path === '/oauth-interstitial.html' || path === '/authorize') {
    return <OAuthInterstitial />;
  }

  return <Connect />;
}
