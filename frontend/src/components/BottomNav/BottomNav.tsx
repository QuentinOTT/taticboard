import React from 'react';

interface BottomNavProps {
  activeTab: 'pitch' | 'formations' | 'roster' | 'analysis';
  setActiveTab: (tab: 'pitch' | 'formations' | 'roster' | 'analysis') => void;
  onShareClick: () => void;
  hasTeam: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onShareClick,
  hasTeam,
}) => {
  return (
    <div className="bottom-nav">
      <button
        className={`bottom-nav-item ${activeTab === 'pitch' ? 'active' : ''}`}
        onClick={() => setActiveTab('pitch')}
      >
        <span className="bottom-nav-icon">⚽</span>
        <span className="bottom-nav-label">Terrain</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'formations' ? 'active' : ''}`}
        onClick={() => setActiveTab('formations')}
      >
        <span className="bottom-nav-icon">📋</span>
        <span className="bottom-nav-label">Formations</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'roster' ? 'active' : ''}`}
        onClick={() => {
          if (!hasTeam) {
            setActiveTab('roster');
          } else {
            setActiveTab('roster');
          }
        }}
      >
        <span className="bottom-nav-icon">👥</span>
        <span className="bottom-nav-label">Effectif</span>
      </button>

      <button
        className={`bottom-nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
        onClick={() => setActiveTab('analysis')}
      >
        <span className="bottom-nav-icon">⚡</span>
        <span className="bottom-nav-label">Analyses</span>
      </button>

      <button className="bottom-nav-item highlight" onClick={onShareClick}>
        <span className="bottom-nav-icon">💾</span>
        <span className="bottom-nav-label">Sauver</span>
      </button>
    </div>
  );
};

export default BottomNav;
