import {Composition} from 'remotion';
import {TerminalDemo} from './compositions/TerminalDemo';
import {formatPresets} from './presets';
import type {CompositionProps} from './types';

const defaultProps: CompositionProps = {
  config: {
    id: 'preview', title: 'Terminal demo', description: '',
    recording: {tape: 'demo.tape', width: 1440, height: 900},
    composition: {theme: 'ghostty-dark', background: 'gradient', terminalScale: .86, terminalPositionY: 0, showWindowChrome: true, cornerRadius: 18, shadow: true},
    timing: {introFrames: 30, outroFrames: 30}, formats: ['landscape'], captions: 'captions.json', zooms: [], callouts: [], future: {},
  },
  captions: [], format: 'landscape', durationFrames: 300, recording: 'recordings/example-demo.mp4',
};

export const RemotionRoot = () => <>
  {Object.entries(formatPresets).map(([format, preset]) => <Composition
    key={format}
    id={`TerminalDemo-${format}`}
    component={TerminalDemo}
    width={preset.width}
    height={preset.height}
    fps={30}
    durationInFrames={300}
    defaultProps={{...defaultProps, format: format as CompositionProps['format']}}
    calculateMetadata={({props}) => ({durationInFrames: props.durationFrames, props})}
  />)}
</>;
