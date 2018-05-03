const electron = require("electron"); // Modulo principal do Electron
const {app} = electron; // Modulo que controla vida da aplicacao
const {BrowserWindow} = electron; // Modulo que cria a janela do browser nativo
const isDev = require("electron-is-dev"); // Modulo que verifica se esta executando a versao de desenvolvimento

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let browserWindow;

app.on("ready", function(){
	createWindow();
});

app.on("window-all-closed", () => {
	app.quit();
});

app.on("activate", () => {
	if(browserWindow === null){
		createWindow();
	}
});

function createWindow(){
	let path = require("path");

	let screenSize = electron.screen.getPrimaryDisplay().size;

	browserWindow = new BrowserWindow({
		fullscreen: true,
		height: screenSize.height,
		resizable: false,
		width: screenSize.width
	});

	browserWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, '../build/index.html')}`);

	browserWindow.on("closed", () => {
		browserWindow = null;
	});
}
