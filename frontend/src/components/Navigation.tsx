import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="border-b bg-card shadow-sm">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold tracking-tight text-card-foreground">Business Dashboard</h2>
            <div className="hidden gap-2 md:flex">
              <Link
                to="/"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/upload"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  location.pathname === '/upload'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                Upload CSV
              </Link>
              <Link
                to="/forecast"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  location.pathname === '/forecast'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                Forecast
              </Link>
              <Link
                to="/transform"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  location.pathname === '/transform'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                Transform
              </Link>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="rounded-lg border bg-background p-2 text-muted-foreground transition-all hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/20"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <span className="hidden text-sm text-muted-foreground sm:block">{user.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
