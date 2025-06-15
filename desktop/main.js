const {app, BrowserWindow, shell} = require('electron')
const path = require('path')

const frontendPath = 'frontend/'

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 1680,
		height: 960,
		webPreferences: {
			nodeIntegration: true,
		}
	})

	// Open external links in the browser
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  	shell.openExternal(url);
	  return { action: 'deny' };
	});

	// Hide the toolbar
	mainWindow.setMenuBarVisibility(false)

	// Load the frontend directly from the filesystem
	mainWindow.loadFile(path.join(__dirname, frontendPath, 'index.html'))
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

