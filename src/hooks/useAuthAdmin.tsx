import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface AdminUser {
  user: User;
  role: 'admin' | 'moderator' | 'user';
  isAdmin: boolean;
  isModerator: boolean;
}

export function useAuthAdmin() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAdminAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          if (mounted) {
            setAdminUser(null);
            setLoading(false);
            navigate('/auth');
          }
          return;
        }

        // Get user role
        const { data: roleData, error } = await supabase
          .rpc('get_user_role', { _user_id: session.user.id });

        if (error) {
          console.error('Error fetching user role:', error);
          if (mounted) {
            setAdminUser(null);
            setLoading(false);
            navigate('/');
          }
          return;
        }

        const role = roleData || 'user';
        const isAdmin = role === 'admin';
        const isModerator = role === 'moderator';

        if (!isAdmin && !isModerator) {
          if (mounted) {
            setAdminUser(null);
            setLoading(false);
            navigate('/');
          }
          return;
        }

        if (mounted) {
          setAdminUser({
            user: session.user,
            role,
            isAdmin,
            isModerator
          });
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in admin auth check:', error);
        if (mounted) {
          setAdminUser(null);
          setLoading(false);
          navigate('/');
        }
      }
    };

    checkAdminAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setAdminUser(null);
            navigate('/');
          }
        } else if (event === 'SIGNED_IN' && session) {
          checkAdminAuth();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { adminUser, loading };
}