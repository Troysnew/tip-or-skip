import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

// Interim tab icons on a 24 × 24 grid, 2 px strokes. The design team's final set replaces these.
export type IconName = 'calc' | 'services' | 'history' | 'holiday' | 'about';

export function TabIcon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  const s = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'calc' && (
        <>
          {/* Split percent: filled circle = tip, hollow circle = skip */}
          <Circle cx={7} cy={7} r={2.6} fill={color} />
          <Circle cx={17} cy={17} r={2.4} {...s} />
          <Line x1={18} y1={5.5} x2={6} y2={18.5} {...s} />
        </>
      )}
      {name === 'services' && (
        <>
          <Circle cx={10.5} cy={10.5} r={6} {...s} />
          <Line x1={15} y1={15} x2={20} y2={20} {...s} />
        </>
      )}
      {name === 'history' && (
        <>
          <Circle cx={12} cy={12} r={8.5} {...s} />
          <Path d="M12 7.5V12l3 2" {...s} />
        </>
      )}
      {name === 'holiday' && (
        <>
          <Rect x={3.5} y={8} width={17} height={4} rx={1} {...s} />
          <Rect x={5} y={12} width={14} height={8.5} rx={1} {...s} />
          <Line x1={12} y1={8} x2={12} y2={20.5} {...s} />
          <Path d="M12 8C10.5 4.5 7 4.5 7.5 6.8 8 8 12 8 12 8zM12 8c1.5-3.5 5-3.5 4.5-1.2C16 8 12 8 12 8z" {...s} />
        </>
      )}
      {name === 'about' && (
        <>
          <Circle cx={12} cy={12} r={8.5} {...s} />
          <Line x1={12} y1={11} x2={12} y2={16.5} {...s} />
          <Circle cx={12} cy={7.8} r={1.2} fill={color} />
        </>
      )}
    </Svg>
  );
}
