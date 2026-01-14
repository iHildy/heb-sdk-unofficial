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
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-heb-red animate-spin mb-4" />
        <p className="text-heb-gray font-medium">Redirecting...</p>
    </div>
  );
}
