import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './components/ui/button';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for stored user and theme on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedTheme = localStorage.getItem('theme');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setActiveSection('dashboard');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'saved':
        return (
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <h2 className="text-2xl mb-4">Saved Locations</h2>
              <p className="text-muted-foreground">Your saved travel destinations will appear here.</p>
            </motion.div>
          </div>
        );
      case 'weather':
        return (
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <h2 className="text-2xl mb-4">Weather Reports</h2>
              <p className="text-muted-foreground">Detailed weather analytics and reports will be available here.</p>
            </motion.div>
          </div>
        );
      case 'safety':
        return (
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <h2 className="text-2xl mb-4">Travel Safety Center</h2>
              <p className="text-muted-foreground">Comprehensive travel safety information and alerts.</p>
            </motion.div>
          </div>
        );
      case 'settings':
        return (
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl"
            >
              <h2 className="text-2xl mb-6">Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg">
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleDarkMode}
                    className="flex items-center space-x-2"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{isDarkMode ? 'Light' : 'Dark'}</span>
                  </Button>
                </div>
                
                <div className="p-4 bg-card rounded-lg">
                  <h3 className="font-medium mb-2">Profile Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {user?.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {user?.email}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AuthPage onLogin={handleLogin} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className={`flex h-screen bg-background transition-colors duration-300`}>
      {/* Sidebar */}
      <Sidebar
        user={user}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-lg font-medium capitalize">{activeSection}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="lg:ml-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t bg-card/50 backdrop-blur-sm mt-auto">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground"
              >
                © 2025 Travel Safety & Weather Dashboard. All rights reserved.
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-muted-foreground"
              >
                Powered by Travel Advisory API • OpenWeatherMap • RestCountries
              </motion.div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}