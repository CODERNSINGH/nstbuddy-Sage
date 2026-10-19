# 06 - Electron exam app

```
app/electron/main.js     window, lockdown, screen-share handler, IPC
app/electron/preload.cjs the only bridge (window.desktop)
app/src/pages/           LoginScreen -> PermissionsScreen -> QuizScreen -> ResultScreen
```

## Flow
`login -> permissions (screen, camera, full screen) -> intro (Start Test) -> quiz -> result`

Quiz has Previous/Next, a question map (Attempted / Viewed / Current / Marked for review), Mark for review, Clear Selection, live timer.

## Lockdown (while the exam is running)
- Full screen + always on top; leaving the window pulls focus back and logs a **warning**.
- All shortcuts blocked **except Cmd + Q**. Menu contains only Quit. Window cannot be closed.
- Exiting full screen = warning + forced back.
- Stopping screen share sends the student back to the permissions page.
- Warnings are sent to the backend and shown on the teacher's leaderboard.

## Honest limits
Electron cannot fully stop OS-level gestures (e.g. some Mission Control / force-quit paths). The app **detects and records** them instead. For stricter control, use macOS MDM / Guided Access.

## macOS permissions
First run: allow **Screen Recording** and **Camera** for the app in System Settings > Privacy & Security, then restart the app.
