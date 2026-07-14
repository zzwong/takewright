import type {CSSProperties} from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import {ghosttyDark} from '../themes/ghostty-dark';

type Props = {
  recording: string;
  aspectRatio: number;
  scale: number;
  positionY: number;
  showWindowChrome: boolean;
  cornerRadius: number;
  shadow: boolean;
  zoomStyle: CSSProperties;
};

export const TerminalFrame = ({recording, aspectRatio, scale, positionY, showWindowChrome, cornerRadius, shadow, zoomStyle}: Props) => (
  <div style={{
    position: 'absolute', left: '50%', top: `${50 + positionY * 100}%`, width: `${scale * 100}%`,
    transform: 'translate(-50%, -50%)', borderRadius: cornerRadius,
    overflow: 'hidden', border: `1px solid ${ghosttyDark.border}`,
    boxShadow: shadow ? '0 32px 90px rgba(0,0,0,.48), 0 8px 24px rgba(0,0,0,.32)' : undefined,
    background: ghosttyDark.background,
  }}>
    {showWindowChrome ? <div style={{height: 38, background: ghosttyDark.chrome, display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 16, borderBottom: `1px solid ${ghosttyDark.border}`}}>
      {['#ff625a', '#ffbd2e', '#29c941'].map((color) => <span key={color} style={{width: 12, height: 12, borderRadius: 99, background: color, opacity: .9}} />)}
    </div> : null}
    <div style={{position: 'relative', width: '100%', aspectRatio, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(recording)} style={{display: 'block', width: '100%', height: '100%', objectFit: 'cover', ...zoomStyle}} />
    </div>
  </div>
);
