import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase';

export default function CompleteProfilePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login');
        return;
      }

      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
      });

      navigate('/dashboard');
    };

    run();
  }, []);

  return <div>Setting up profile...</div>;
}