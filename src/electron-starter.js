const electron = require("electron"); // Modulo principal do Electron
const {app} = electron; // Modulo que controla vida da aplicacao
const {BrowserWindow} = electron; // Modulo que cria a janela do browser nativo

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
	var path = require("path");

	var screenSize = electron.screen.getPrimaryDisplay().size;

	browserWindow = new BrowserWindow({
		fullscreen: true,
		height: screenSize.height,
		resizable: false,
		width: screenSize.width
	});

	browserWindow.loadURL("http://localhost:3000");

	browserWindow.on("closed", () => {
		browserWindow = null;
	});
}
