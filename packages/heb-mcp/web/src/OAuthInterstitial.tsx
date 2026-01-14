import { useClerk, useUser } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function OAuthInterstitial() {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      // User is signed in, cookie should now be synced. Reload to let backend see it.
      const url = new URL(window.location.href);
      url.searchParams.set('_t', Date.now().toString());
      window.location.href = url.toString();
    } else {
      // Not signed in
      const signInUrl = (window as any).__connectConfig?.signInUrl;
      if (signInUrl) {
         window.location.href = signInUrl;
      } else {
         openSignIn({ forceRedirectUrl: window.location.href });
      }
    }
  }, [user, isLoaded, openSignIn]);

  return (
    <div className="bg-[#f5f1e8] min-h-screen flex items-center justify-center font-['Inter',sans-serif]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
        <p className="text-muted font-medium">Redirecting to authentication...</p>
      </div>
    </div>
  );
}
