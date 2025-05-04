import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user,loading  } = useAuth();
  const location = useLocation();
  if (loading) {
    return <div>Loading...</div>; 
  }
  if (!user) {
    toast.error('You need to login first');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    toast.error(`Unauthorized access`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
