// node.js
import { EventEmitter } from "events"
// api
import { API_COMMAND, BridgeEvent } from "@/api"

declare global {
	/** @see electron/main.ts */
	interface Window {
		readonly bridge: EventEmitter & {
			handle(event: BridgeEvent, callback: (...args: any[]) => void): void
			trigger(event: BridgeEvent, ...args: any[]): void
		}
		readonly API: {
			[API_COMMAND.CLOSE](vertify: string): Promise<void>;
			[API_COMMAND.FOCUS](): Promise<void>;
			[API_COMMAND.BLUR](): Promise<void>;
			[API_COMMAND.MINIMIZE](): Promise<void>;
			[API_COMMAND.MAXIMIZE](): Promise<void>;
			[API_COMMAND.UNMAXIMIZE](): Promise<void>;
			[API_COMMAND.FULLSCREEN](): Promise<void>;
		}
	}
	/** @see modules/hitomi/suggest.ts */
	interface DataView {
		getUint64(offset: number, endian: boolean): number;
	}
	/** @see modules/prototypes.ts */
	interface Array<T> {
		last?: T;
		first?: T;
		empty: boolean;

		skip(count: number): Array<T>;
		take(count: number): Array<T>;

		add(...args: T[]): Array<T>;
		remove(...args: T[]): Array<T>;

		match(element: T): number;
		contains(element: T): boolean;
		/** @deprecated */
		push(...args: T[]): void;
		/** @deprecated */
		indexOf(element: T): number;
	}
	interface ArrayBuffer {
		skip(count: number): ArrayBuffer;
		take(count: number): ArrayBuffer;
	}
	interface Number {
		clamp(minimum: number, maximum: number): number;
		truncate(): number;
		absolute(): number;
	}
	interface RegExp {
		match(string: string): Nullable<RegExpCapture>;
		/** @deprecated */
		exec(string: string): Nullable<Array<string>>;
	}
	interface RegExpCapture {
		group(index: number): Nullable<string>;
	}
	function until(condition: () => boolean, duration?: number): Promise<void>;
	function inject(before: (...args: any[]) => any, after: (...args: any[]) => any): (...args: any[]) => any;
	function random(minimum: number, maximum: number): number;
}

export default {}
