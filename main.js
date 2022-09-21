const { app, BrowserWindow/* , ipcMain, dialog */ } = require('electron')

const isDev = !app.isPackaged
let win = null

function createWindow() {
  if (win) return
  win = new BrowserWindow({
    width: 1200, height: 900,
    webPreferences: {
      worldSafeExecuteJavaScript: true, // required for Electron 12+
      contextIsolation: false, // required for Electron 12+
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  win.setMenuBarVisibility(false)

  win.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } })
    },
  )
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const aoHeader = details.responseHeaders['access-control-allow-origin']
    if (aoHeader) {
      details.responseHeaders['Access-Control-Allow-Origin'] = aoHeader
      delete details.responseHeaders['access-control-allow-origin']
    }
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        ...details.responseHeaders,
      },
    })
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'undocked', activate: true })
  } else {
    win.loadFile('./web/dist/index.html')
  }

  win.on('closed', () => { win = null })
}

// app.on('open-file', () => {
//   console.log(arguments)
// })
app.on('ready', createWindow)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ipcMain.on('open-file-dialog', event => {
//   dialog.showOpenDialog({ properties: ['openDirectory'] }).then(res => {
//     if (!res.canceled) {
//       event.sender.send('selected-directory', res.filePaths[0])
//     }
//   })
// })
