import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { CardProvider } from './contexts/CardContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Battle } from './pages/Battle';
import { Gallery } from './pages/Gallery';
import { CardEditor } from './pages/CardEditor';
import { TestLab } from './pages/TestLab';
import ErrorBoundary from './components/ErrorBoundary';
import { DebugFloatingMenu } from './components/DebugFloatingMenu';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">Carregando...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  console.log('=== APP COMPONENT RENDERING ===');
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CardProvider>
            <GameProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/battle"
                  element={
                    <PrivateRoute>
                      <Battle />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/gallery"
                  element={
                    <PrivateRoute>
                      <Gallery />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/editor"
                  element={
                    <PrivateRoute>
                      <CardEditor />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/test-lab"
                  element={
                    <PrivateRoute>
                      <TestLab />
                    </PrivateRoute>
                  }
                />
              </Routes>
              <DebugFloatingMenu />
            </GameProvider>
          </CardProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
