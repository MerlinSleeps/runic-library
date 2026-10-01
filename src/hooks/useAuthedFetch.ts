import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

type FetchState<T> =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'not-found' }
  | { status: 'error' }
  | { status: 'success'; data: T };

/**
 * Fetches JSON from an API route with the current user's Firebase ID token.
 */
export function useAuthedFetch<T>(url: string): FetchState<T> {
  const { user } = useAuth();
  const [state, setState] = useState<FetchState<T>>({ status: 'loading' });

  useEffect(() => {
    if (!user) {
      setState({ status: 'unauthenticated' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

        if (cancelled) return;
        if (res.status === 404) return setState({ status: 'not-found' });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

        const data: T = await res.json();
        if (!cancelled) setState({ status: 'success', data });
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        if (!cancelled) setState({ status: 'error' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, url]);

  return state;
}
