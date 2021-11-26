// electron
import { app, session, BrowserWindow, ipcMain } from "electron";
// api
import { API_COMMAND, BridgeEvent } from "@/api";

app.on("ready", () => {
	// create window
	const window = new BrowserWindow({
		icon: "source/assets/aishite.ico",
		show: false,
		frame: false,
		width: 550,
		height: 600,
		minWidth: 550,
		minHeight: 600,
		webPreferences: {
			// webpack or ASAR
			preload: require("path").resolve(__dirname, "preload.js"),
			// allow renderer interacts with nodejs
			nodeIntegration: true,
			// isolate preload
			contextIsolation: false

		},
		backgroundColor: "#00000000"
	});
	// webpack or ASAR
	window.loadFile("build/index.html");
	// development
	if (!app.isPackaged) {
		// hot-reload
		require("fs").watch("build/preload.js").on("change", () => {
			window.reload();
		});
		require("fs").watch("build/renderer.js").on("change", () => {
			window.reload();
		});
	}
	// clear cache
	session.defaultSession.clearCache();
	// bypass origin policy
	session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ["*://*.hitomi.la/*"] }, (details, callback) => {
		details.requestHeaders["referer"] = "https://hitomi.la/";
		return callback({ requestHeaders: details.requestHeaders });
	});
	window.on("ready-to-show", () => {
		window.show();
	});
	window.on("unresponsive", () => {
		window.reload();
	});
	window.on(BridgeEvent.CLOSE, (event) => {
		// prevent close
		event.preventDefault();
		// send event anyways
		window.webContents.send(BridgeEvent.CLOSE);
	});
	window.on(BridgeEvent.FOCUS, () => {
		window.webContents.send(BridgeEvent.FOCUS);
	});
	window.on(BridgeEvent.BLUR, () => {
		window.webContents.send(BridgeEvent.BLUR);
	});
	window.on(BridgeEvent.MINIMIZE, () => {
		window.webContents.send(BridgeEvent.MINIMIZE);
	});
	window.on(BridgeEvent.MAXIMIZE, () => {
		window.webContents.send(BridgeEvent.MAXIMIZE);
	});
	window.on(BridgeEvent.UNMAXIMIZE, () => {
		window.webContents.send(BridgeEvent.UNMAXIMIZE);
	});
	window.on(BridgeEvent.ENTER_FULL_SCREEN, () => {
		window.webContents.send(BridgeEvent.ENTER_FULL_SCREEN);
	});
	window.on(BridgeEvent.LEAVE_FULL_SCREEN, () => {
		window.webContents.send(BridgeEvent.LEAVE_FULL_SCREEN);
	});
	ipcMain.handle("API", (event, command: API_COMMAND, ...args: any[]) => {
		setTimeout(() => {
			switch (command) {
				case API_COMMAND.CLOSE: {
					return window.destroy();
				}
				case API_COMMAND.FOCUS: {
					return window.focus();
				}
				case API_COMMAND.BLUR: {
					return window.blur();
				}
				case API_COMMAND.MINIMIZE: {
					return window.minimize();
				}
				case API_COMMAND.MAXIMIZE: {
					return window.maximize();
				}
				case API_COMMAND.UNMAXIMIZE: {
					return window.unmaximize();
				}
				case API_COMMAND.FULLSCREEN: {
					return window.setFullScreen(!window.isFullScreen());
				}
			}
		}, /** @see https://github.com/electron/electron/issues/24759 */ 150);
	});
});
