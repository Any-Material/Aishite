// electron
import { ipcRenderer } from "electron";
// framework
import ReactDOM from "react-dom";
// components
import App from "@/app";
// modules
import settings from "@/modules/settings";
// api
import { API_COMMAND, BridgeEvent } from "@/api";

const certification: Array<string> = [];

function call(command: API_COMMAND, ...args: any[]) {
	return ipcRenderer.invoke("API", command, ...args).then((response) => {
		console.debug({
			command: command,
			args: args,
			response: response	
		});
		return response;
	});
}
// @ts-ignore
window.API = {
	//
	// 1. Entry point
	//
	// TitleBar.tsx -> close()
	// OS native interaction -> ipcRenderer -> close()
	//
	// 2. close() Function
	//
	// triggers [BridgeEvent]
	//
	// 3. Individual [BridgeEvent] listeners
	//
	// calls back close() with different vertify arguments
	//
	// 4. close() Function
	//
	// calls [API_COMMAND] to truly close [BrowserWindow]
	//
	[API_COMMAND.CLOSE](vertify: string) {
		if (!certification.contains(vertify)) {
			certification.add(vertify);
		} else {
			throw new Error();
		}
		for (const validator of settings.state.general.dependency) {
			if (!certification.contains(validator)) {
				return window.bridge.trigger(BridgeEvent.CLOSE);
			}
		}
		return call(API_COMMAND.CLOSE);
	},
	[API_COMMAND.FOCUS]() {
		return call(API_COMMAND.FOCUS);
	},
	[API_COMMAND.BLUR]() {
		return call(API_COMMAND.BLUR);
	},
	[API_COMMAND.MINIMIZE]() {
		return call(API_COMMAND.MINIMIZE);
	},
	[API_COMMAND.MAXIMIZE]() {
		return call(API_COMMAND.MAXIMIZE);
	},
	[API_COMMAND.UNMAXIMIZE]() {
		return call(API_COMMAND.UNMAXIMIZE);
	},
	[API_COMMAND.FULLSCREEN]() {
		return call(API_COMMAND.FULLSCREEN);
	}
}
ipcRenderer.on(BridgeEvent.CLOSE, () => {
	window.API.close("renderer");
});
ipcRenderer.on(BridgeEvent.FOCUS, () => {
	window.bridge.trigger(BridgeEvent.BLUR);
});
ipcRenderer.on(BridgeEvent.BLUR, () => {
	window.bridge.trigger(BridgeEvent.BLUR);
});
ipcRenderer.on(BridgeEvent.MINIMIZE, () => {
	window.bridge.trigger(BridgeEvent.MINIMIZE);
});
ipcRenderer.on(BridgeEvent.MAXIMIZE, () => {
	window.bridge.trigger(BridgeEvent.MAXIMIZE);
});
ipcRenderer.on(BridgeEvent.UNMAXIMIZE, () => {
	window.bridge.trigger(BridgeEvent.UNMAXIMIZE);
});
ipcRenderer.on(BridgeEvent.ENTER_FULL_SCREEN, () => {
	window.bridge.trigger(BridgeEvent.ENTER_FULL_SCREEN);
});
ipcRenderer.on(BridgeEvent.LEAVE_FULL_SCREEN, () => {
	window.bridge.trigger(BridgeEvent.LEAVE_FULL_SCREEN);
});
ReactDOM.render(<App></App>, document.getElementById("app"));
