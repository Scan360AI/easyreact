import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Protected Route component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page, but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
