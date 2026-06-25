import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();

      if (data?.session) {
        navigate("/complete-profile");
      } else {
        navigate("/login");
      }
    };

    run();
  }, []);

  return <div>Signing you in...</div>;
}