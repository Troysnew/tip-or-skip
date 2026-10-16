import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { Category, Verdict } from '../data/services';

// Interface icons from the Tip or Skip working brand kit (ui-icons/*.svg):
// 24 × 24 viewBox, 1.8 unit strokes, round caps and joins, one color.
export type IconName =
  | 'calculator' | 'services' | 'history' | 'holidays' | 'about'
  | 'food-drink' | 'delivery' | 'travel' | 'personal-care' | 'home' | 'everyday';

function Shapes({ name }: { name: IconName }) {
  switch (name) {
    case 'calculator':
      return (<><Rect x={5} y={2.75} width={14} height={18.5} rx={2} /><Path d="M8 7h8M8 11h1m6 0h1M8 15h1m6 0h1M8 18h1m6 0h1" /></>);
    case 'services':
      return (<><Rect x={3} y={3} width={6.5} height={6.5} rx={1.3} /><Rect x={14.5} y={3} width={6.5} height={6.5} rx={1.3} /><Rect x={3} y={14.5} width={6.5} height={6.5} rx={1.3} /><Rect x={14.5} y={14.5} width={6.5} height={6.5} rx={1.3} /></>);
    case 'history':
      return <Path d="M4.2 7.1A9 9 0 1 1 3 13M3 3v5h5M12 7v5l3 2" />;
    case 'holidays':
      return (<><Rect x={3} y={8} width={18} height={4} rx={1} /><Path d="M5 12v9h14v-9M12 8v13M12 8C7 8 6 6.5 6 5c0-1.5 1-2 2.3-2C11 3 12 8 12 8Zm0 0c5 0 6-1.5 6-3 0-1.5-1-2-2.3-2C13 3 12 8 12 8Z" /></>);
    case 'about':
      return (<><Circle cx={12} cy={12} r={9} /><Path d="M12 11v6M12 7v.1" /></>);
    case 'food-drink':
      return <Path d="M5 3v6m3-6v6m3-6v6M5 7h6M5 9c0 2 6 2 6 0M8 11v10M19 3c-3 2-4 5-4 8h4m0-8v18" />;
    case 'delivery':
      return (<><Path d="M3 5h11v12H3ZM14 9h4l3 4v4h-7M17 9v4h4" /><Circle cx={7} cy={18} r={2.5} /><Circle cx={18} cy={18} r={2.5} /></>);
    case 'travel':
      return (<><Rect x={4} y={6} width={16} height={14} rx={2} /><Path d="M9 6V3h6v3M8 6v14M16 6v14M7 20v1M17 20v1" /></>);
    case 'personal-care':
      return (<><Circle cx={6} cy={17} r={3} /><Circle cx={18} cy={17} r={3} /><Path d="m8 14 11-11M16 14 5 3" /></>);
    case 'home':
      return <Path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7" />;
    case 'everyday':
      return <Path d="M5 8h14l1 13H4ZM9 8V6a3 3 0 0 1 6 0v2" />;
  }
}

export function Icon({ name, color, size = 24 }: { name: IconName; color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Shapes name={name} />
    </Svg>
  );
}

export const CATEGORY_ICON: Record<Category, IconName> = {
  'Food & drink': 'food-drink',
  Delivery: 'delivery',
  Travel: 'travel',
  'Personal care': 'personal-care',
  Home: 'home',
  Everyday: 'everyday',
};

/** Verdict pill marks from the kit: check (Yes, tip), double chevron (Your call), dash (Skip it), equals (Included). */
export function VerdictMark({ verdict, color, size = 12 }: { verdict: Verdict; color: string; size?: number }) {
  const d = {
    expected: 'M3 8.5 6.5 12 13 4.5',
    optional: 'M3.5 4 7.5 8l-4 4M8.5 4l4 4-4 4',
    not: 'M3.5 8h9',
    included: 'M3.5 6h9M3.5 10.5h9',
  }[verdict];
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}
