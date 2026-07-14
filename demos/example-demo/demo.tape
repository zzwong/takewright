Output public/recordings/example-demo.mp4
Set Shell "bash"
Set Width 1440
Set Height 900
Set FontSize 28
Set FontFamily "JetBrains Mono"
Set Framerate 30
Set TypingSpeed 45ms
Set Padding 28
Set Margin 0
Set CursorBlink false
Set Theme {"name":"Studio Dark","black":"#11131a","red":"#ff6b6b","green":"#69db7c","yellow":"#ffd43b","blue":"#74c0fc","magenta":"#b197fc","cyan":"#66d9e8","white":"#e9ecef","brightBlack":"#687083","brightRed":"#ff8787","brightGreen":"#8ce99a","brightYellow":"#ffe066","brightBlue":"#a5d8ff","brightMagenta":"#d0bfff","brightCyan":"#99e9f2","brightWhite":"#ffffff","background":"#11131a","foreground":"#eef1f8","selection":"#30384b","cursor":"#eef1f8"}
Env LANG "C"
Env LC_ALL "C"
Env TZ "UTC"
Env NO_COLOR "1"
Env HOME "/tmp/takewright-home"
Env BASH_ENV "/dev/null"

Hide
Type "mkdir -p /tmp/takewright-home && clear"
Enter
Sleep 500ms
Show
Sleep 1s
Type "node fixtures/mock-cli.mjs detect"
Sleep 500ms
Enter
Sleep 3s
Type "clear"
Enter
Sleep 600ms
Type "node fixtures/mock-cli.mjs validate"
Sleep 500ms
Enter
Sleep 3s
