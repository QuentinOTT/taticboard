import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Circle, Line, Text, Group } from 'react-konva';
import { useTacticStore } from '../stores/useTacticStore';
import { useIsMobile } from '../hooks/useIsMobile';

// ─── Hero pitch decoration ────────────────────────────────────
const HeroPitch: React.FC = () => {
  const W = 720, H = 420;
  const M = 20;
  const lw = 1.5;
  const r = (H - 2*M) * 0.12;

  const demoPositions = [
    { x: 0.5, y: 0.92, color: '#22c55e' },
    { x: 0.18, y: 0.78, color: '#3b82f6' },
    { x: 0.38, y: 0.82, color: '#3b82f6' },
    { x: 0.62, y: 0.82, color: '#3b82f6' },
    { x: 0.82, y: 0.78, color: '#3b82f6' },
    { x: 0.32, y: 0.62, color: '#8b5cf6' },
    { x: 0.5, y: 0.58, color: '#8b5cf6' },
    { x: 0.68, y: 0.62, color: '#8b5cf6' },
    { x: 0.18, y: 0.28, color: '#f59e0b' },
    { x: 0.5, y: 0.18, color: '#f59e0b' },
    { x: 0.82, y: 0.28, color: '#f59e0b' },
  ];

  return (
    <Stage width={W} height={H}>
      <Layer>
        <Rect x={0} y={0} width={W} height={H} fill="#2d5a27" />
        {/* Stripes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <Rect key={i} x={0} y={i * (H/8)} width={W} height={H/8} fill={i%2 === 0 ? 'rgba(0,0,0,0.05)' : 'transparent'} />
        ))}
        {/* Pitch markings */}
        <Rect x={M} y={M} width={W-2*M} height={H-2*M} stroke="rgba(255,255,255,0.7)" strokeWidth={lw} fill="transparent" />
        <Line points={[M, H/2, W-M, H/2]} stroke="rgba(255,255,255,0.7)" strokeWidth={lw} />
        <Circle x={W/2} y={H/2} radius={r} stroke="rgba(255,255,255,0.7)" strokeWidth={lw} fill="transparent" />
        <Rect x={W/2 - (W-2*M)*0.2} y={H - M - (H-2*M)*0.18} width={(W-2*M)*0.4} height={(H-2*M)*0.18} stroke="rgba(255,255,255,0.6)" strokeWidth={lw} fill="transparent" />
        <Rect x={W/2 - (W-2*M)*0.2} y={M} width={(W-2*M)*0.4} height={(H-2*M)*0.18} stroke="rgba(255,255,255,0.6)" strokeWidth={lw} fill="transparent" />
      </Layer>
      <Layer>
        {demoPositions.map((pos, i) => (
          <Group key={i} x={M + pos.x * (W-2*M)} y={M + pos.y * (H-2*M)}>
            <Circle radius={16} fill="rgba(0,0,0,0.3)" offsetY={-2} />
            <Circle radius={16} fill={pos.color} stroke="white" strokeWidth={2} />
            <Text text={String(i + 1)} fontSize={10} fontFamily="Inter" fontStyle="bold" fill="white" align="center" verticalAlign="middle" width={32} height={32} offsetX={16} offsetY={16} />
          </Group>
        ))}
      </Layer>
    </Stage>
  );
};

// ─── Home Page ────────────────────────────────────────────────
const Home: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { formations, loadFormations, isLoading } = useTacticStore();

  useEffect(() => {
    if (formations.length === 0) loadFormations();
  }, []);

  const features = [
    {
      icon: '⚽',
      name: 'Terrain interactif',
      desc: 'Glissez-déposez les joueurs sur un terrain Canvas haute fidélité. Support 11v11 et 8v8.',
    },
    {
      icon: '📋',
      name: 'Fiches tactiques expert',
      desc: '15 formations avec fiches d\'analyse complètes : comment attaquer, défendre et contrer.',
    },
    {
      icon: '⚡',
      name: 'Mode comparaison',
      desc: 'Comparez deux formations côte à côte avec radar chart et tableau Force/Faiblesse.',
    },
    {
      icon: '💾',
      name: 'Sauvegarde & Partage',
      desc: 'Sauvegardez vos compositions et partagez-les via un lien unique.',
    },
  ];

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="hero-glow" />

        <div className="hero-badge">
          <span>⚽</span>
          <span>Analyses tactiques niveau professionnel</span>
        </div>

        <h1 className="hero-title">
          <span className="hero-title-gradient">TacticBoard</span>
          <br />
          <span style={{ fontSize: '0.55em', fontWeight: 600, color: 'rgba(240,242,248,0.6)' }}>
            Créez des tactiques de football
          </span>
        </h1>

        <p className="hero-subtitle">
          Visualisez, analysez et partagez vos formations tactiques avec un terrain interactif,
          des fiches d&apos;analyse expert et un mode comparaison avancé.
        </p>

        <div className="hero-actions">
          <button className="hero-btn primary" onClick={() => navigate('/editor')}>
            🚀 Créer une tactique
          </button>
          <button className="hero-btn secondary" onClick={() => navigate('/compare')}>
            ⚡ Comparer des formations
          </button>
        </div>

        {!isMobile && (
          <div className="hero-pitch-preview" style={{ marginTop: 48 }}>
            <HeroPitch />
          </div>
        )}
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="features-title">Tout ce dont vous avez besoin</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.name} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-name">{f.name}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Formations showcase */}
      <section className="formations-showcase">
        <h2 className="showcase-title">15 formations disponibles</h2>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Chargement...</div>
        ) : (
          <div className="showcase-grid">
            {formations.map((f) => (
              <button
                key={f.id}
                className="showcase-card"
                onClick={() => {
                  useTacticStore.getState().setFormation(f);
                  navigate('/editor');
                }}
              >
                <div className="showcase-name">{f.name}</div>
                <div className="showcase-type">{f.type}v{f.type}</div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
