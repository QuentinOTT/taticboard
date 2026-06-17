import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const Home = lazy(() => import('./pages/Home'));
const Editor = lazy(() => import('./pages/Editor'));
const Compare = lazy(() => import('./pages/Compare'));
const TeamManager = lazy(() => import('./pages/TeamManager'));

const LoadingFallback: React.FC = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d0f18',
    flexDirection: 'column',
    gap: 16,
  }}>
    <div style={{
      width: 40,
      height: 40,
      border: '3px solid rgba(255,255,255,0.1)',
      borderTopColor: '#00d4ff',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <div style={{ color: 'rgba(240,242,248,0.4)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
      Chargement de TacticBoard…
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/team" element={<TeamManager />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Toast notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1d2e',
            color: '#f0f2f8',
            border: '1px solid rgba(255,255,255,0.07)',
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            borderRadius: 10,
          },
          success: {
            iconTheme: { primary: '#00d4ff', secondary: '#000' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  );
};

export default App;
