import type {CSSProperties, ReactNode} from 'react';
import {AbsoluteFill} from 'remotion';
import type {DemoConfig} from '../schema';

const backgrounds: Record<DemoConfig['composition']['background'], CSSProperties> = {
  gradient: {background: 'radial-gradient(circle at 72% 18%, rgba(100,132,255,.28), transparent 38%), radial-gradient(circle at 18% 82%, rgba(71,210,183,.17), transparent 35%), linear-gradient(145deg, #0b1020, #171426 52%, #0b111d)'},
  'dark-neutral': {background: 'linear-gradient(145deg, #16181d, #090a0d)'},
  'light-neutral': {background: 'linear-gradient(145deg, #f5f6f8, #dfe3ea)'},
};

export const Background = ({kind, children}: {kind: DemoConfig['composition']['background']; children: ReactNode}) => (
  <AbsoluteFill style={backgrounds[kind]}>{children}</AbsoluteFill>
);
