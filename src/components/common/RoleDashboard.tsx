import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store';


export default function RoleDashboard() {
  const { role } = useSelector((state: RootState) => state.auth);
  const location = useLocation();


  if (location.pathname !== '/dashboard') {
    return null;
  }

  switch (role) {
    case 'Customer':
      return <Navigate to="/customer/dashboard" replace />;
    case 'Agent':
      return <Navigate to="/agent/dashboard" replace />;
    case 'Underwriter':
      return <Navigate to="/underwriter/dashboard" replace />;
    case 'Admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}