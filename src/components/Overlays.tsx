import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Callout, CaptionLike} from '../types';

export const Title = ({title, subtitle, top, introFrames, outroStart}: {title: string; subtitle: string | undefined; top: number; introFrames: number; outroStart: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, durationInFrames: Math.max(1, introFrames), config: {damping: 18}});
  const exit = interpolate(frame, [outroStart, outroStart + 20], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{position: 'absolute', top, width: '100%', textAlign: 'center', color: 'white', opacity: enter * exit, transform: `translateY(${(1 - enter) * -12}px)`, fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
    <div style={{fontWeight: 720, fontSize: 42, letterSpacing: '-.025em'}}>{title}</div>
    {subtitle ? <div style={{fontSize: 21, opacity: .72, marginTop: 8}}>{subtitle}</div> : null}
  </div>;
};

export const CaptionOverlay = ({captions, bottom}: {captions: CaptionLike[]; bottom: number}) => {
  const frame = useCurrentFrame();
  const caption = captions.find((item) => frame >= item.startFrame && frame < item.endFrame);
  if (!caption) return null;
  return <div style={{position: 'absolute', bottom, left: '8%', right: '8%', display: 'flex', justifyContent: 'center', fontFamily: 'Inter, ui-sans-serif, system-ui'}}>
    <div style={{maxWidth: 900, color: '#fff', fontSize: 28, lineHeight: 1.3, fontWeight: 620, textAlign: 'center', background: 'rgba(4,6,12,.82)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: '12px 20px', boxShadow: '0 8px 28px rgba(0,0,0,.25)'}}>{caption.text}</div>
  </div>;
};

export const CalloutOverlay = ({callouts}: {callouts: Callout[]}) => {
  const frame = useCurrentFrame();
  const callout = callouts.find((item) => frame >= item.startFrame && frame < item.endFrame);
  if (!callout) return null;
  const style = callout.position === 'top' ? {top: '18%'} : callout.position === 'left' ? {left: '5%', top: '50%'} : callout.position === 'right' ? {right: '5%', top: '50%'} : {bottom: '18%'};
  return <div style={{position: 'absolute', left: callout.position === 'bottom' || callout.position === 'top' ? '50%' : undefined, transform: callout.position === 'bottom' || callout.position === 'top' ? 'translateX(-50%)' : 'translateY(-50%)', ...style, background: '#f4f7ff', color: '#10131b', borderRadius: 12, padding: '12px 16px', font: '600 22px Inter, ui-sans-serif, system-ui', boxShadow: '0 10px 30px rgba(0,0,0,.25)', maxWidth: 460}}>{callout.text}</div>;
};
