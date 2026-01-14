import { useEffect, useState } from 'react';
import AuthSuccess from './AuthSuccess';
import Connect from './Connect';
import Layout from './Layout';
import OAuthInterstitial from './OAuthInterstitial';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (path === '/extension-auth-success') {
    return (
      <Layout>
        <AuthSuccess />
      </Layout>
    );
  }

  if (path === '/oauth-interstitial.html' || path === '/authorize') {
    return (
      <Layout>
        <OAuthInterstitial />
      </Layout>
    );
  }

  return (
    <Layout>
      <Connect />
    </Layout>
  );
}
