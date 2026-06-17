import React from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Group } from 'react-konva';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { useTacticStore } from '../../stores/useTacticStore';
import { Formation } from '../../types';

// ─── Mini terrain pour comparaison ───────────────────────────
interface MiniPitchKonvaProps {
  formation: Formation;
  color: string;
  width: number;
  height: number;
}

const MiniPitchKonva: React.FC<MiniPitchKonvaProps> = ({ formation, color, width, height }) => {
  const M = 6;
  const playerR = Math.min(width, height) * 0.038;
  const lw = 1;

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill="#1a1d27" />
        <Rect x={M} y={M} width={width-2*M} height={height-2*M} fill="#2d5a27" rx={2} />
        <Line points={[M, height/2, width-M, height/2]} stroke="rgba(255,255,255,0.4)" strokeWidth={lw} />
        <Circle x={width/2} y={height/2} radius={(height-2*M)*0.12} stroke="rgba(255,255,255,0.4)" strokeWidth={lw} fill="transparent" />
      </Layer>
      <Layer>
        {formation.player_positions.map((pos) => (
          <Group key={pos.id} x={M + pos.x * (width - 2*M)} y={M + pos.y * (height - 2*M)}>
            <Circle radius={playerR} fill={color} stroke="white" strokeWidth={1.5} />
            <Text
              text={pos.label}
              fontSize={playerR * 0.7}
              fontFamily="Inter"
              fontStyle="bold"
              fill="white"
              align="center"
              verticalAlign="middle"
              width={playerR * 2}
              height={playerR * 2}
              offsetX={playerR}
              offsetY={playerR}
            />
          </Group>
        ))}
      </Layer>
    </Stage>
  );
};

// ─── Dual Radar Chart ─────────────────────────────────────────
interface DualRadarProps {
  formationA: Formation;
  formationB: Formation;
}

const DualRadar: React.FC<DualRadarProps> = ({ formationA, formationB }) => {
  const data = [
    {
      subject: 'Attaque',
      A: formationA.radar_stats.attack,
      B: formationB.radar_stats.attack,
    },
    {
      subject: 'Défense',
      A: formationA.radar_stats.defense,
      B: formationB.radar_stats.defense,
    },
    {
      subject: 'Pressing',
      A: formationA.radar_stats.pressing,
      B: formationB.radar_stats.pressing,
    },
    {
      subject: 'Possession',
      A: formationA.radar_stats.possession,
      B: formationB.radar_stats.possession,
    },
    {
      subject: 'Transition',
      A: formationA.radar_stats.transition,
      B: formationB.radar_stats.transition,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'Inter' }}
        />
        <Radar name={formationA.name} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
        <Radar name={formationB.name} dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

// ─── CompareMode Main Component ───────────────────────────────
const CompareMode: React.FC = () => {
  const { currentFormation, compareFormation, formations, setCompareFormation } = useTacticStore();

  if (!currentFormation) {
    return (
      <div className="compare-empty">
        <p>Sélectionnez une formation principale dans la sidebar pour commencer la comparaison</p>
      </div>
    );
  }

  const PITCH_W = 220;
  const PITCH_H = 300;

  const allStats = ['attack', 'defense', 'pressing', 'possession', 'transition'] as const;
  const statLabels: Record<string, string> = {
    attack: 'Attaque', defense: 'Défense', pressing: 'Pressing',
    possession: 'Possession', transition: 'Transition',
  };

  return (
    <div className="compare-mode">
      <div className="compare-header">
        <h2>Mode Comparaison</h2>
        <p className="compare-subtitle">Analysez deux formations côte à côte</p>
      </div>

      {/* Pitch comparison */}
      <div className="compare-pitches">
        {/* Formation A */}
        <div className="compare-pitch-col">
          <div className="compare-pitch-label" style={{ color: '#3b82f6' }}>
            <span className="compare-dot" style={{ background: '#3b82f6' }} />
            {currentFormation.name}
          </div>
          <MiniPitchKonva
            formation={currentFormation}
            color="#3b82f6"
            width={PITCH_W}
            height={PITCH_H}
          />
        </div>

        {/* VS divider */}
        <div className="compare-vs">
          <span>VS</span>
        </div>

        {/* Formation B — selector or pitch */}
        <div className="compare-pitch-col">
          {compareFormation ? (
            <>
              <div className="compare-pitch-label" style={{ color: '#ef4444' }}>
                <span className="compare-dot" style={{ background: '#ef4444' }} />
                {compareFormation.name}
              </div>
              <MiniPitchKonva
                formation={compareFormation}
                color="#ef4444"
                width={PITCH_W}
                height={PITCH_H}
              />
              <button className="change-formation-btn" onClick={() => setCompareFormation(null)}>
                Changer
              </button>
            </>
          ) : (
            <div className="compare-select-formation">
              <p>Cliquez sur ⚡ dans la sidebar pour choisir une formation à comparer</p>
              <div className="compare-quick-select">
                {formations
                  .filter((f) => f.type === currentFormation.type && f.id !== currentFormation.id)
                  .slice(0, 4)
                  .map((f) => (
                    <button
                      key={f.id}
                      className="quick-select-btn"
                      onClick={() => setCompareFormation(f)}
                    >
                      {f.name}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dual radar */}
      {compareFormation && (
        <>
          <div className="compare-radar">
            <h3 className="compare-section-title">Comparaison des statistiques</h3>
            <DualRadar formationA={currentFormation} formationB={compareFormation} />
            <div className="compare-legend">
              <div className="legend-item"><span style={{ background: '#3b82f6' }} /> {currentFormation.name}</div>
              <div className="legend-item"><span style={{ background: '#ef4444' }} /> {compareFormation.name}</div>
            </div>
          </div>

          {/* Stat comparison table */}
          <div className="compare-table">
            <h3 className="compare-section-title">Tableau comparatif</h3>
            <div className="compare-stat-rows">
              {allStats.map((stat) => {
                const valA = currentFormation.radar_stats[stat];
                const valB = compareFormation.radar_stats[stat];
                const winner = valA > valB ? 'A' : valA < valB ? 'B' : 'tie';
                return (
                  <div key={stat} className="compare-stat-row">
                    <div className={`compare-stat-val ${winner === 'A' ? 'winner' : ''}`}>
                      {valA}
                    </div>
                    <div className="compare-stat-name">{statLabels[stat]}</div>
                    <div className={`compare-stat-val ${winner === 'B' ? 'winner' : ''}`}>
                      {valB}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Counter information */}
          <div className="compare-counter-section">
            <div className="compare-counter-col">
              <h4>Formations qui contrent <span style={{ color: '#3b82f6' }}>{currentFormation.name}</span></h4>
              <div className="counter-chips">
                {currentFormation.best_counter_formations.map((name) => (
                  <span key={name} className="counter-chip-sm">{name}</span>
                ))}
              </div>
            </div>
            <div className="compare-counter-arrow">⟷</div>
            <div className="compare-counter-col">
              <h4>Formations qui contrent <span style={{ color: '#ef4444' }}>{compareFormation.name}</span></h4>
              <div className="counter-chips">
                {compareFormation.best_counter_formations.map((name) => (
                  <span key={name} className="counter-chip-sm">{name}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths comparison */}
          <div className="compare-sw-section">
            <div className="compare-sw-col">
              <h4>Forces — {currentFormation.name}</h4>
              {currentFormation.strengths.slice(0, 3).map((s, i) => (
                <div key={i} className="sw-compare-item strength">✅ {s}</div>
              ))}
            </div>
            <div className="compare-sw-col">
              <h4>Forces — {compareFormation.name}</h4>
              {compareFormation.strengths.slice(0, 3).map((s, i) => (
                <div key={i} className="sw-compare-item strength">✅ {s}</div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompareMode;
