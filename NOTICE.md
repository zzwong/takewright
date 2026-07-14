# Third-party software notice

Takewright source code is licensed under the MIT License. That license does not replace or modify the licenses of its dependencies or external tools.

## Remotion

This project depends on Remotion. Remotion is source-available under the [Remotion License](https://remotion.dev/license), not the Takewright MIT License. At the time of this notice, individuals, eligible small organizations, non-profit organizations, and evaluators may qualify for Remotion's Free License; other organizations must obtain an appropriate Company License. Users are responsible for checking the current terms for their circumstances.

## VHS

VHS is an external terminal recording tool distributed under the MIT License. See the [VHS repository](https://github.com/charmbracelet/vhs) for its source and license.

## FFmpeg and FFprobe

FFmpeg and FFprobe are external system tools and are not redistributed by this repository. FFmpeg is primarily LGPL-licensed, but builds that enable GPL components are governed by the GPL. Review the [FFmpeg legal page](https://ffmpeg.org/legal.html), especially before distributing FFmpeg binaries.

## Node.js dependencies

Packages installed from `pnpm-lock.yaml` retain their respective licenses. Run the following command against the resolved dependency tree when preparing a redistribution or compliance review:

```bash
pnpm licenses list
```

This notice is informational and is not legal advice.
