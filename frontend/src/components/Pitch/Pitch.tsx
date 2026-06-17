import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Circle, Arc, Text, Group } from 'react-konva';
import Konva from 'konva';
import { useTacticStore } from '../../stores/useTacticStore';
import { PlayerPosition, translatePosition } from '../../types';
import PlayerForm from '../PlayerForm/PlayerForm';

// ─── Pitch dimensions (normalized) ───────────────────────────
const PITCH_ASPECT = {
  '11': { w: 68,  h: 105 }, // 68m wide × 105m long
  '8':  { w: 50,  h: 70 },  // 50m wide × 70m long
};

interface PitchProps {
  stageRef?: React.RefObject<Konva.Stage>;
  mini?: boolean;
  formation?: import('../../types').Formation;
  teamColor?: string;
  isAway?: boolean;
}


// ─── Pitch drawing helpers ────────────────────────────────────
function drawPitch11(w: number, h: number, lw: number): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const M = lw * 4; // margin

  // Outer boundary
  elements.push(<Rect key="outline" x={M} y={M} width={w - 2*M} height={h - 2*M} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);

  // Centre line
  elements.push(<Line key="midline" points={[M, h/2, w-M, h/2]} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} />);

  // Centre circle
  const r = (h - 2*M) * 0.12;
  elements.push(<Circle key="midcircle" x={w/2} y={h/2} radius={r} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  elements.push(<Circle key="midspot" x={w/2} y={h/2} radius={lw*1.5} fill="rgba(255,255,255,0.85)" />);

  // Penalty areas (top & bottom)
  const paW = (w - 2*M) * 0.4;
  const paH = (h - 2*M) * 0.16;
  // Bottom penalty area
  elements.push(<Rect key="pa-bot" x={w/2 - paW/2} y={h - M - paH} width={paW} height={paH} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  // Top penalty area
  elements.push(<Rect key="pa-top" x={w/2 - paW/2} y={M} width={paW} height={paH} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);

  // Goal areas (6-yard box)
  const gaW = (w - 2*M) * 0.18;
  const gaH = paH * 0.45;
  elements.push(<Rect key="ga-bot" x={w/2 - gaW/2} y={h - M - gaH} width={gaW} height={gaH} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  elements.push(<Rect key="ga-top" x={w/2 - gaW/2} y={M} width={gaW} height={gaH} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);

  // Goals
  const goalW = (w - 2*M) * 0.09;
  const goalH = paH * 0.16;
  elements.push(<Rect key="goal-bot" x={w/2 - goalW/2} y={h - M} width={goalW} height={goalH} stroke="rgba(255,255,255,0.7)" strokeWidth={lw} fill="rgba(255,255,255,0.08)" />);
  elements.push(<Rect key="goal-top" x={w/2 - goalW/2} y={M - goalH} width={goalW} height={goalH} stroke="rgba(255,255,255,0.7)" strokeWidth={lw} fill="rgba(255,255,255,0.08)" />);

  // Penalty spots
  elements.push(<Circle key="ps-bot" x={w/2} y={h - M - paH * 0.56} radius={lw*1.5} fill="rgba(255,255,255,0.85)" />);
  elements.push(<Circle key="ps-top" x={w/2} y={M + paH * 0.56} radius={lw*1.5} fill="rgba(255,255,255,0.85)" />);

  // Penalty arcs
  elements.push(<Arc key="arc-bot" x={w/2} y={h - M - paH * 0.56} innerRadius={r * 0.82} outerRadius={r * 0.82} angle={130} rotation={195} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  elements.push(<Arc key="arc-top" x={w/2} y={M + paH * 0.56} innerRadius={r * 0.82} outerRadius={r * 0.82} angle={130} rotation={15} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);

  // Corner arcs
  const ca = r * 0.1;
  elements.push(<Arc key="ca-tl" x={M} y={M} innerRadius={ca} outerRadius={ca} angle={90} rotation={0} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  elements.push(<Arc key="ca-tr" x={w-M} y={M} innerRadius={ca} outerRadius={ca} angle={90} rotation={90} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  elements.push(<Arc key="ca-bl" x={M} y={h-M} innerRadius={ca} outerRadius={ca} angle={90} rotation={270} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  elements.push(<Arc key="ca-br" x={w-M} y={h-M} innerRadius={ca} outerRadius={ca} angle={90} rotation={180} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);

  return elements;
}

function drawPitch8(w: number, h: number, lw: number): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const M = lw * 4;

  elements.push(<Rect key="outline" x={M} y={M} width={w - 2*M} height={h - 2*M} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  elements.push(<Line key="midline" points={[M, h/2, w-M, h/2]} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} />);

  const r = (h - 2*M) * 0.12;
  elements.push(<Circle key="midcircle" x={w/2} y={h/2} radius={r} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  elements.push(<Circle key="midspot" x={w/2} y={h/2} radius={lw*1.5} fill="rgba(255,255,255,0.85)" />);

  const paW = (w - 2*M) * 0.45;
  const paH = (h - 2*M) * 0.2;
  elements.push(<Rect key="pa-bot" x={w/2 - paW/2} y={h - M - paH} width={paW} height={paH} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);
  elements.push(<Rect key="pa-top" x={w/2 - paW/2} y={M} width={paW} height={paH} stroke="rgba(255,255,255,0.85)" strokeWidth={lw} fill="transparent" />);

  const goalW = (w - 2*M) * 0.12;
  const goalH = paH * 0.18;
  elements.push(<Rect key="goal-bot" x={w/2 - goalW/2} y={h - M} width={goalW} height={goalH} stroke="rgba(255,255,255,0.7)" strokeWidth={lw} fill="rgba(255,255,255,0.08)" />);
  elements.push(<Rect key="goal-top" x={w/2 - goalW/2} y={M - goalH} width={goalW} height={goalH} stroke="rgba(255,255,255,0.7)" strokeWidth={lw} fill="rgba(255,255,255,0.08)" />);

  elements.push(<Circle key="ps-bot" x={w/2} y={h - M - paH * 0.55} radius={lw*1.5} fill="rgba(255,255,255,0.85)" />);
  elements.push(<Circle key="ps-top" x={w/2} y={M + paH * 0.55} radius={lw*1.5} fill="rgba(255,255,255,0.85)" />);

  return elements;
}

// ─── Pitch stripes (dark/light alternating) ───────────────────
function drawStripes(w: number, h: number, count: number): React.ReactNode[] {
  const stripes: React.ReactNode[] = [];
  const stripeH = h / count;
  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      stripes.push(
        <Rect
          key={`stripe-${i}`}
          x={0}
          y={i * stripeH}
          width={w}
          height={stripeH}
          fill="rgba(0,0,0,0.06)"
          listening={false}
        />
      );
    }
  }
  return stripes;
}

// ─── Player token ─────────────────────────────────────────────
interface PlayerTokenProps {
  id: string;
  x: number;
  y: number;
  label: string;
  name: string;
  number: number;
  color: string;
  radius: number;
  onDragEnd: (id: string, x: number, y: number) => void;
  onClick?: (id: string) => void;
  mini?: boolean;
}

const PlayerToken: React.FC<PlayerTokenProps> = ({
  id, x, y, label, name, number, color, radius, onDragEnd, onClick, mini
}) => {
  const fontSize = mini ? radius * 0.8 : radius * 0.65;
  const nameSize = mini ? 0 : radius * 0.5;

  return (
    <Group
      x={x}
      y={y}
      draggable={!mini}
      onDragEnd={(e) => onDragEnd(id, e.target.x(), e.target.y())}
      onClick={() => onClick?.(id)}
      onTap={() => onClick?.(id)}
      hitStrokeWidth={8}
    >
      {/* Shadow */}
      <Circle radius={radius + 2} fill="rgba(0,0,0,0.4)" offsetY={-2} />
      {/* Background */}
      <Circle radius={radius} fill={color} stroke="white" strokeWidth={mini ? 1.5 : 2.5} />
      {/* Position label */}
      <Text
        text={number > 0 ? String(number) : translatePosition(label)}
        fontSize={fontSize}
        fontFamily="Inter, sans-serif"
        fontStyle="bold"
        fill="white"
        align="center"
        verticalAlign="middle"
        width={radius * 2}
        height={radius * 2}
        offsetX={radius}
        offsetY={radius}
        listening={false}
      />
      {/* Name below (desktop only) */}
      {!mini && name && (
        <Text
          text={name.split(' ').slice(-1)[0].slice(0, 8)}
          fontSize={nameSize}
          fontFamily="Inter, sans-serif"
          fill="white"
          align="center"
          width={radius * 4}
          offsetX={radius * 2}
          y={radius + 3}
          listening={false}
        />
      )}
    </Group>
  );
};

// ─── Main Pitch Component ─────────────────────────────────────
const Pitch: React.FC<PitchProps> = ({
  stageRef: externalStageRef,
  mini = false,
  formation: propFormation,
  teamColor: propColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalStageRef;

  const [dimensions, setDimensions] = useState({ width: 600, height: 800 });
  const [selectedPosition, setSelectedPosition] = useState<{ id: string; label: string } | null>(null);

  const {
    currentFormation,
    footballType,
    players,
    draggedPositions,
    updatePlayerPosition,
    selectedRosterPlayerId,
    assignPlayerToPosition,
    selectRosterPlayer,
  } = useTacticStore();

  const formation = propFormation || currentFormation;
  const homeColor = propColor || '#3b82f6';

  // ── Responsive resize ──
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;
  const aspect = PITCH_ASPECT[footballType];
  const paddingX = mini ? 4 : 0;
  const paddingY = mini ? 4 : 0;

  // Compute canvas pitch size maintaining aspect ratio
  const canvasAspect = aspect.w / aspect.h;
  const containerAspect = width / height;

  let pitchW: number, pitchH: number;
  if (containerAspect < canvasAspect) {
    pitchW = width - paddingX * 2;
    pitchH = pitchW / canvasAspect;
  } else {
    pitchH = height - paddingY * 2;
    pitchW = pitchH * canvasAspect;
  }

  const offsetX = (width - pitchW) / 2;
  const offsetY = (height - pitchH) / 2;

  const lineWidth = Math.max(1, pitchW / 200);
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
  const playerRadius = mini
    ? Math.min(pitchW, pitchH) * 0.035
    : isMobileView
      ? Math.max(22, Math.min(pitchW, pitchH) * 0.065)
      : Math.min(pitchW, pitchH) * 0.048;

  // Convert normalized position to canvas pixels
  const toCanvas = useCallback((pos: PlayerPosition) => ({
    x: offsetX + pos.x * pitchW,
    y: offsetY + pos.y * pitchH,
  }), [offsetX, offsetY, pitchW, pitchH]);

  const handleDragEnd = (positionId: string, x: number, y: number) => {
    updatePlayerPosition(positionId, x, y);
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
      >
        {/* Background */}
        <Layer listening={false}>
          <Rect x={0} y={0} width={width} height={height} fill="#1a1d27" />
          {/* Pitch surface */}
          <Rect x={offsetX} y={offsetY} width={pitchW} height={pitchH} fill="#2d5a27" cornerRadius={2} />
          {/* Stripes */}
          {drawStripes(pitchW, pitchH, 12).map((s) =>
            React.cloneElement(s as React.ReactElement, {
              x: (s as React.ReactElement).props.x + offsetX,
            })
          )}
        </Layer>

        {/* Pitch markings */}
        <Layer listening={false}>
          <Group x={offsetX} y={offsetY}>
            {footballType === '11'
              ? drawPitch11(pitchW, pitchH, lineWidth)
              : drawPitch8(pitchW, pitchH, lineWidth)}
          </Group>
        </Layer>

        {/* Players */}
        <Layer>
          {formation?.player_positions.map((pos) => {
            const dragged = draggedPositions[pos.id];
            const canvasPos = dragged || toCanvas(pos);
            const player = players.find((p) => p.positionId === pos.id);

            return (
              <PlayerToken
                key={pos.id}
                id={pos.id}
                x={canvasPos.x}
                y={canvasPos.y}
                label={pos.label}
                name={player?.name || ''}
                number={player?.number || 0}
                color={homeColor}
                radius={playerRadius}
                onDragEnd={handleDragEnd}
                onClick={(id) => {
                  if (selectedRosterPlayerId) {
                    assignPlayerToPosition(id, selectedRosterPlayerId);
                    selectRosterPlayer(null);
                  } else {
                    setSelectedPosition({ id, label: pos.label });
                  }
                }}
                mini={mini}
              />
            );
          })}
        </Layer>
      </Stage>
      {selectedPosition && !mini && (
        <PlayerForm
          positionId={selectedPosition.id}
          positionLabel={selectedPosition.label}
          onClose={() => setSelectedPosition(null)}
        />
      )}
    </div>
  );
};

export default Pitch;
