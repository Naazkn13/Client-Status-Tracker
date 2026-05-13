import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UpdatePassword from './auth/UpdatePassword';

export default function ProtectedRoute() {
  const { user, loading, requiresPasswordChange } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-500 font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiresPasswordChange) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
        <UpdatePassword isFirstLogin={true} />
      </div>
    );
  }

  return <Outlet />;
}
