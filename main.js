var path = require('path');
var events = require('events');
var fs = require('fs');

var exec = require("child_process").exec;


var electron = require('electron');
var app = electron.app;
var Tray = electron.Tray;
var globalShortcut = electron.globalShortcut;
var BrowserWindow = electron.BrowserWindow;

var Positioner = require('electron-positioner');

var window;
var index;
var tray;

var systemWin;

var positioner;

var winPos = (process.platform === 'win32') ? 'trayBottomCenter' : 'trayCenter';

var cachedBounds;

var index = 'file://' + path.join(__dirname, "index.html");

console.log(index);

console.log("start");

app.on('ready', function() {
	console.log("ready");

	// Register a 'CommandOrControl+X' shortcut listener.
	const ret = globalShortcut.register('F13', () => {
	  console.log('F13 is pressed');
	  clicked();
	});

	const ret2 = globalShortcut.register('Alt+Space', () => {
	  console.log('Alt+Space is pressed');
	  clicked();
	});

	app.dock.hide();
	tray = new Tray('IconTemplate.png');
	tray.on('click', clicked);
    tray.on('double-click', clicked);
	tray.setTitle("");
	createWindow();
});

function createWindow () {
	console.log("create win");

	window = new BrowserWindow({
        show: false,
        frame: false,
		transparent: true,
		movable: false,
		resizable: false,
		useContentSize: true,
		height: 600,
		width: 400
      });

	positioner = new Positioner(window);

	window.on('blur', hideWindow);

	window.setVisibleOnAllWorkspaces(true);

	window.on('close', windowClear);
	window.loadURL(index);
}

function showWindow (trayPos) {

	console.log("show win");

	if (!window) {
		createWindow();
	}

	if (trayPos && trayPos.x !== 0) {
		// Cache the bounds
		cachedBounds = trayPos;
	} else if (cachedBounds) {
		// Cached value will be used if showWindow is called without bounds data
		trayPos = cachedBounds;
	}

	// Default the window to the right if `trayPos` bounds are undefined or null.
	var noBoundsPosition = null;

	if ((trayPos === undefined || trayPos.x === 0) /*&& opts['window-position'].substr(0, 4) === 'tray'*/) {
		noBoundsPosition = (process.platform === 'win32') ? 'bottomRight' : 'topRight';
	}

	var position = positioner.calculate(noBoundsPosition || winPos, trayPos);

	window.setPosition(position.x, position.y);
	window.show();
}

function clicked (e, bounds) {
	console.log("clicked");
	//if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey)
	//	return hideWindow();
	if (window && window.isVisible()) {
		//change focus to old win
		hideWindow();
		return setActWin(systemWin);
	}
	getActWin(function(v) {
		systemWin = v;
	});
	cachedBounds = bounds || cachedBounds;
	showWindow(cachedBounds);
 }

function hideWindow () {
	console.log("hide win");
	if (!window)
		return;
	window.hide();
}

function windowClear () {
	delete window
}

function getActWin(callback) {
	exec("osascript -e 'tell application \"System Events\"\nset frontApp to name of first application process whose frontmost is true\nend tell'", function(error, stdout, stderr)
	    {
	        callback(stdout.slice(0, -1));
	    });
}

function setActWin(title) {
	exec("osascript -e 'tell application \"System Events\" to set frontmost of process \"" + title + "\" to true'", function(error, stdout, stderr)
	    {
	    });
}
