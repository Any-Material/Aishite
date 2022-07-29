import { app, shell, session, Menu, ipcMain, BrowserWindow } from "electron";

import node_fs from "fs";
import node_path from "path";

import { Window } from "@/models/window";

enum App {
	BLUR = "blur",
	FOCUS = "focus",
	CLOSE = "close",
	MINIMIZE = "minimize",
	MAXIMIZE = "maximize",
	UNMAXIMIZE = "unmaximize",
	FULLSCREEN = "fullscreen",
}

enum Interface {
	OPEN_URL = "open_url",
	DEVELOPMENT = "development"
}

let window: Nullable<BrowserWindow> = null;

Menu.setApplicationMenu(Menu.buildFromTemplate(app.isPackaged ? [{ role: "togglefullscreen" }] : [{ role: "togglefullscreen" }, { role: "toggleDevTools" }]));

const instance = app.requestSingleInstanceLock();

if (!instance) app.quit();

if (!app.isPackaged) {
	// hot-reload
	node_fs.watch(node_path.resolve(__dirname, "preload.js")).on("change", () => window?.reload());
	node_fs.watch(node_path.resolve(__dirname, "renderer.js")).on("change", () => window?.reload());
}

app.on("ready", () => {
	// cannot require until app is ready
	const { screen } = require("electron");

	class Resolution {
		public static width(pixels: number = screen.getPrimaryDisplay().workArea.width) {
			return Math.round((pixels - 30) * 0.3 + 30);
		}
		public static height(pixels: number = screen.getPrimaryDisplay().workArea.height + (/* TASKBAR */ 45)) {
			return Math.round((pixels - (/* TASKBAR */ 45) - 185) * 0.5 + 170);
		}
	};

	// content security policy
	// session.defaultSession.webRequest.onHeadersReceived((details, callback) => callback({
	// 	responseHeaders: {
	// 		// inherit
	// 		...details.responseHeaders,
	// 		// override
	// 		"Content-Security-Policy": [["default-src", "'self'", "filesystem", "*.hitomi.la/*"].join("\u0020")]
	// 	}
	// }));
	// bypass cross-origin policy
	session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.hitomi.la/*"] }, (details, callback) => callback({
		requestHeaders: {
			// inherit
			...details.requestHeaders,
			// override
			"Referer": "https://hitomi.la"
		}
	}));
	
	// create window
	window = new BrowserWindow({
		icon: "source/assets/icon.ico",
		show: false,
		frame: false,
		width: Resolution.width(),
		height: Resolution.height(),
		minWidth: Resolution.width(),
		minHeight: Resolution.height(),
		webPreferences: {
			// webpack or ASAR
			preload: node_path.resolve(__dirname, "preload.js"),
			// allow renderer interacts with nodejs
			nodeIntegration: true,
			// isolate preload
			contextIsolation: false,
			// allow webworker interacts with nodejs
			nodeIntegrationInWorker: true
		},
		backgroundColor: "#00000000"
	});
	window.on("ready-to-show", () => {
		// show app
		window?.show();
	});
	window.on("unresponsive", () => {
		// reload app
		window?.reload();
	});
	window.on(Window.CLOSE, (event) => {
		// prevent
		event.preventDefault();
		// send event anyways
		window?.webContents.send(Window.CLOSE);
	});
	window.on(Window.FOCUS, () => {
		window?.webContents.send(Window.FOCUS);
	});
	window.on(Window.BLUR, () => {
		window?.webContents.send(Window.BLUR);
	});
	window.on(Window.MINIMIZE, () => {
		window?.webContents.send(Window.MINIMIZE);
	});
	window.on(Window.MAXIMIZE, () => {
		window?.webContents.send(Window.MAXIMIZE);
	});
	window.on(Window.UNMAXIMIZE, () => {
		window?.webContents.send(Window.UNMAXIMIZE);
	});
	window.on(Window.ENTER_FULL_SCREEN, () => {
		window?.webContents.send(Window.ENTER_FULL_SCREEN);
	});
	window.on(Window.LEAVE_FULL_SCREEN, () => {
		window?.webContents.send(Window.LEAVE_FULL_SCREEN);
	});
	ipcMain.handle("chromium", (event, command: string, ...args: Array<any>) => {
		setTimeout(() => {
			switch (command) {
				// app
				case App.CLOSE: {
					return window?.destroy();
				}
				case App.FOCUS: {
					return window?.focus();
				}
				case App.BLUR: {
					return window?.blur();
				}
				case App.MINIMIZE: {
					return window?.minimize();
				}
				case App.MAXIMIZE: {
					return window?.maximize();
				}
				case App.UNMAXIMIZE: {
					return window?.unmaximize();
				}
				case App.FULLSCREEN: {
					return window?.setFullScreen(!window.isFullScreen());
				}
				// interface
				case Interface.OPEN_URL: {
					return shell.openExternal(args[0]);
				}
				case Interface.DEVELOPMENT: {
					return window?.webContents.toggleDevTools();
				}
			}
		}, /** @see https://github.com/electron/electron/issues/24759 */ 150);
	});
	// webpack or ASAR
	window.loadFile(node_path.resolve(__dirname, "index.html"));
});
