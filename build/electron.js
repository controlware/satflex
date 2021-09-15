const { app, dialog, screen, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = require('electron-is-dev'); // Modulo que verifica se esta executando a versao de desenvolvimento

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let browserWindow;

app.on('ready', function(){
	createWindow();
});

app.on('window-all-closed', () => {
	app.quit();
});

app.on('activate', () => {
	if(browserWindow === null){
		createWindow();
	}
});

function createWindow(){
	const screenSize = screen.getPrimaryDisplay().size;

	browserWindow = new BrowserWindow({
		fullscreen: true,
		height: screenSize.height,
		resizable: false,
		width: screenSize.width,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			contextIsolation: false,
			enableRemoteModule: true,
			nativeWindowOpen: false
		}
	});

	browserWindow.removeMenu();
	browserWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

	browserWindow.on('closed', () => {
		browserWindow = null;
	});
}

ipcMain.on('open-dev-tools', (event, arg) => {
	browserWindow.webContents.openDevTools();
	event.returnValue = true;
});

ipcMain.on('restart', (event, arg) => {
	app.relaunch();
	app.exit();
	event.returnValue = true;
});

ipcMain.on('dialog-selecionar-planilha', (event, arg) => {
	event.returnValue = dialog;
});
