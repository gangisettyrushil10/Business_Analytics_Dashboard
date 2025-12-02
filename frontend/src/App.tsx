import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ForecastPage from './pages/ForecastPage';
import TransformPage from './pages/TransformPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', transition: 'background-color 0.3s ease' }}>
                <Navigation />
                <ErrorBoundary>
                  <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <UploadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/forecast"
                  element={
                    <ProtectedRoute>
                      <ForecastPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transform"
                  element={
                    <ProtectedRoute>
                      <TransformPage />
                    </ProtectedRoute>
                  }
                />
                  </Routes>
                </ErrorBoundary>
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
