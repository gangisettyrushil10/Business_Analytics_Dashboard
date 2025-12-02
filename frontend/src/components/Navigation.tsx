import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const activeStyle = {
    color: '#007bff',
    fontWeight: 'bold',
    borderBottom: '2px solid #007bff',
  };

  const linkStyle = {
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    color: 'var(--text-primary)',
    display: 'inline-block',
    transition: 'color 0.3s ease',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '2rem',
      boxShadow: `0 2px 4px var(--shadow)`,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, color: '#007bff' }}>Business Dashboard</h2>
          {isAuthenticated && (
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <Link
                to="/"
                style={location.pathname === '/' ? { ...linkStyle, ...activeStyle } : linkStyle}
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                style={location.pathname === '/upload' ? { ...linkStyle, ...activeStyle } : linkStyle}
              >
                Upload CSV
              </Link>
              <Link
                to="/forecast"
                style={location.pathname === '/forecast' ? { ...linkStyle, ...activeStyle } : linkStyle}
              >
                Forecast
              </Link>
              <Link
                to="/transform"
                style={location.pathname === '/transform' ? { ...linkStyle, ...activeStyle } : linkStyle}
              >
                Transform
              </Link>
            </div>
          )}
        </div>
        {isAuthenticated && user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={toggleTheme}
              style={{
                padding: '0.5rem',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: 'var(--text-primary)',
                transition: 'all 0.3s ease',
              }}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <span style={{ 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
            }}
            className="hide-on-mobile"
            >
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '0.5rem 1rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
