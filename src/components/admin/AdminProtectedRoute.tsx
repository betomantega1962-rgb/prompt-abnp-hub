import { ReactNode } from 'react';
import { useAuthAdmin } from '@/hooks/useAuthAdmin';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { adminUser, loading } = useAuthAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="space-y-4 w-full max-w-md p-6">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null; // useAuthAdmin already handles navigation
  }

  return <>{children}</>;
}