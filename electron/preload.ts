// nodejs
import * as node_events from "events";
// prototypes
import "@/prototypes";
// api
import { BridgeEvent } from "@/api";

// @ts-ignore
window.bridge = new class BridgeListener extends node_events.EventEmitter {
	public handle(event: BridgeEvent, callback: (...args: any[]) => void) {
		super.on(event, callback);
	}
	public trigger(event: BridgeEvent,...args: any[]) {
		super.emit(event, args);
	}
}
