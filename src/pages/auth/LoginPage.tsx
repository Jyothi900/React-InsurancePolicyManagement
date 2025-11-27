import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to homepage where login modal will handle authentication
    navigate('/');
  }, [navigate]);

  return null;
}