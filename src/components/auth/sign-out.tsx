'use client';
import { authClient } from '@/lib/authClient';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert } from '../ui/alert';
import { DropdownMenuItem } from '../ui/dropdown-menu';

export default function SignOut() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/sign-in');
        },
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },

        onError: ctx => {
          setError(ctx.error.message);
          setIsLoading(false);
        },
      },
    });
  };

  return (
    <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
      <LogOut />
      {error && <Alert>{error}</Alert>}
      {isLoading ? 'Signing out...' : 'Log out'}
    </DropdownMenuItem>
  );
}
