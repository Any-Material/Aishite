// nodejs
import { EventEmitter } from "events";
// prototypes
import "@/prototypes";
// api
import { BridgeEvent } from "@/api";
// @ts-ignore
window["bridge"] = new class BridgeListener extends EventEmitter {
	public handle(event: BridgeEvent, callback: (...args: any[]) => void) {
		super.on(event, callback);
	}
	public trigger(event: BridgeEvent, ...args: any[]) {
		super.emit(event, ...args);
	}
};
