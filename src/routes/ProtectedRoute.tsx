import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useSelector((state: RootState) => state.auth);
  
  console.log(' ProtectedRoute Check:', {
    isAuthenticated,
    role,
    allowedRoles,
    currentPath: window.location.pathname
  });
  
  if (!isAuthenticated) {
    console.log(' Not authenticated - redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && role !== null && role !== undefined) {
    const roleMap: Record<string, number> = {
      'Customer': 0,
      'Agent': 1,
      'Admin': 2,
      'Underwriter': 3
    };
    
    const numericRole = roleMap[role];
    console.log(' Role Check:', {
      stringRole: role,
      numericRole,
      allowedRoles,
      isAllowed: allowedRoles.includes(numericRole)
    });
    
    if (numericRole === undefined || !allowedRoles.includes(numericRole)) {
      console.log(' Access denied - redirecting to /dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  console.log(' Access granted');
  return <>{children}</>;
}
