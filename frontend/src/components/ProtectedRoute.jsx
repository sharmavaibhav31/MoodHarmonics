import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ isAuthed, children }) {
  const location = useLocation();
  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}


