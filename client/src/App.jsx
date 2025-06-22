import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { setUser, logout } from './store';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import BlogListPage from './components/BlogListPage';
import BlogDetailPage from './components/BlogDetailPage';
import CreateEditBlogPage from './components/CreateEditBlogPage';
import DashboardPage from './components/DashboardPage';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useSelector(state => state.user);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and restore user session
      fetchUserData(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch(setUser({
          user: data.user,
          token: token
        }));
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        dispatch(logout());
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      dispatch(logout());
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {user && <Navbar />}
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          } />
          
          {/* Protected Routes - All require authentication */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/blogs" element={
            <ProtectedRoute>
              <BlogListPage />
            </ProtectedRoute>
          } />
          
          <Route path="/blog/:id" element={
            <ProtectedRoute>
              <BlogDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="/create-blog" element={
            <ProtectedRoute allowedRoles={['creator']}>
              <CreateEditBlogPage />
            </ProtectedRoute>
          } />
          
          <Route path="/edit-blog/:id" element={
            <ProtectedRoute allowedRoles={['creator']}>
              <CreateEditBlogPage />
            </ProtectedRoute>
          } />
          
          {/* Default Route - Redirect to login if not authenticated */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          
          {/* Catch all route */}
          <Route path="*" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
