'use client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authClient } from '../../../lib/authClient';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  useEffect(() => {
    if (!isPending && session) {
      if (!session) {
        router.push('/');
      } else if (session.user.role === 'admin') {
        router.push('/');
      } else if (session.user.role === 'super-admin') {
        router.push('/');
      } else if (session.user.role !== 'user') {
        router.push('/');
      }
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // Show loading while redirecting
  if (!session || !session.user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return <div>{children}</div>;
}
