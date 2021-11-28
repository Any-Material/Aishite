// electron
import { app, session, globalShortcut, BrowserWindow, ipcMain } from "electron";
// api
import { API_COMMAND, BridgeEvent } from "@/api";

app.on("ready", () => {
	// create window
	const window = new BrowserWindow({
		icon: "source/assets/icons/icon.ico",
		show: false,
		frame: false,
		minWidth: 775,
		minHeight: 565,
		backgroundColor: "#000000",
		webPreferences: {
			// webpack or ASAR
			preload: require("path").resolve(__dirname, "preload.js"),
			// allow renderer interacts with nodejs
			nodeIntegration: true,
			// isolate preload
			contextIsolation: false
		}
	});
	// webpack or ASAR
	window.loadFile("build/index.html");
	// development
	if (!app.isPackaged) {
		// hot-reload
		require("fs").watch("build/main.js").on("change", () => {
			window.reload();
		});
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
	// behaviours
	window.on("ready-to-show", () => {
		window.show();
	});
	window.on("unresponsive", () => {
		window.reload();
	});
	/**
	 * @see electron/renderer.ts
	 */
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
	globalShortcut.register("F5", () => {
		if (window.isFocused()) {
			window.webContents.send(BridgeEvent.TOGGLE_TERMINAL)
		}
	});
	/**
	 * @see electron/preload.ts
	 */
	 ipcMain.handle("API", async (event, command: API_COMMAND, ...args: any[]) => {
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
			case API_COMMAND.DIRECTORY: {
				return app.getPath("exe").replace(/([A-Za-z]+).exe/, "");
			}
			case API_COMMAND.PACKAGED: {
				return app.isPackaged;
			}
		}
	});
});
