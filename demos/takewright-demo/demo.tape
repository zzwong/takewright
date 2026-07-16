Output public/recordings/takewright-demo.mp4
Set Shell "bash"
Set Width 1200
Set Height 700
Set FontSize 25
Set FontFamily "JetBrains Mono"
Set Framerate 30
Set TypingSpeed 45ms
Set Padding 28
Set Margin 0
Set CursorBlink false

Env LANG "C"
Env LC_ALL "C"
Env TZ "UTC"
Env NO_COLOR "1"
Env BASH_ENV "/dev/null"

# Route pnpm through the deterministic replay fixture so the demo shows
# real command lines with reproducible output.
Hide
Type `pnpm() { node fixtures/takewright-replay.mjs "$1"; } && clear`
Enter
Sleep 500ms
Show

Sleep 1s
Type "pnpm demo:doctor"
Sleep 500ms
Enter
Sleep 3s

Type "clear"
Enter
Sleep 600ms
Type "pnpm demo:render takewright-demo"
Sleep 500ms
Enter
Sleep 3200ms

Type "pnpm demo:validate takewright-demo"
Sleep 500ms
Enter
Sleep 3s
