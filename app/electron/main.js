import { app, BrowserWindow, Menu, desktopCapturer, ipcMain, session, systemPreferences } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEV_URL = 'http://localhost:5174'

let win
let lockedDown = false // true while the student is taking the exam
let allowQuit = false // only Cmd+Q sets this

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 760,
    backgroundColor: '#0b0b0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
    },
  })

  if (!process.env.ELECTRON_DEV) win.loadFile(path.join(__dirname, '../dist/index.html'))
  else win.loadURL(DEV_URL)

  // Closing the window (red button, Cmd+W) is blocked during the exam
  win.on('close', (e) => {
    if (lockedDown && !allowQuit) e.preventDefault()
  })

  // Student left the app (Cmd+Tab, Mission Control...) -> pull them back and report it
  win.on('blur', () => {
    if (!lockedDown) return
    win.webContents.send('violation', 'You left the exam window')
    win.focus()
  })

  win.on('leave-full-screen', () => {
    if (!lockedDown) return
    win.webContents.send('violation', 'You exited full screen')
    win.setFullScreen(true)
  })

  // Block every keyboard shortcut except Cmd+Q while locked down
  win.webContents.on('before-input-event', (event, input) => {
    if (!lockedDown || input.type !== 'keyDown') return
    const isQuit = input.meta && input.key.toLowerCase() === 'q'
    const isShortcut = input.meta || input.control || input.alt || /^F\d+$/.test(input.key)
    if (isShortcut && !isQuit) event.preventDefault()
  })
}

// Menu with ONLY "Quit" (Cmd+Q). Everything else (reload, devtools, hide, minimize) is gone.
function buildMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { label: 'NstBuddy Sage', submenu: [{ label: 'Quit', accelerator: 'Cmd+Q', click: () => app.quit() }] },
    ]),
  )
}

// ---- Screen share: auto-pick the main screen so students don't need a picker
function setupScreenShare() {
  session.defaultSession.setDisplayMediaRequestHandler(
    async (request, callback) => {
      const sources = await desktopCapturer.getSources({ types: ['screen'] })
      callback({ video: sources[0] })
    },
    { useSystemPicker: false },
  )
}

// ---- IPC: what the web page is allowed to ask the desktop app to do
function setupIpc() {
  ipcMain.handle('permissions:status', () => ({
    screen: systemPreferences.getMediaAccessStatus('screen'),
    camera: systemPreferences.getMediaAccessStatus('camera'),
  }))
  ipcMain.handle('permissions:ask-camera', () => systemPreferences.askForMediaAccess('camera'))

  ipcMain.handle('lockdown:start', () => {
    lockedDown = true
    win.setFullScreen(true)
    win.setAlwaysOnTop(true, 'screen-saver')
    win.setVisibleOnAllWorkspaces(true)
    win.setMenuBarVisibility(false)
    win.focus()
  })

  ipcMain.handle('lockdown:stop', () => {
    lockedDown = false
    win.setAlwaysOnTop(false)
    win.setVisibleOnAllWorkspaces(false)
    win.setFullScreen(false)
  })

  ipcMain.handle('app:quit', () => app.quit())
}

app.on('before-quit', () => {
  allowQuit = true
})

app.whenReady().then(() => {
  buildMenu()
  setupScreenShare()
  setupIpc()
  createWindow()
})

app.on('window-all-closed', () => app.quit())
