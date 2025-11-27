import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to homepage where register modal will handle registration
    navigate('/');
  }, [navigate]);

  return null;
}