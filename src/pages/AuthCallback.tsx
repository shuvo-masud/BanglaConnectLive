import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Example: handle token exchange / session setup here

    const handleAuth = async () => {
      try {
        // e.g. await authService.handleCallback()
        
        // After successful auth, redirect user
        navigate("/CompleteProfilePage");
      } catch (err) {
        console.error("Auth callback failed:", err);
        navigate("/login");
      }
    };

    handleAuth();
  }, [navigate]);

  return <div>Signing you in...</div>;
}