// nodejs
import * as node_fs from "fs";
import * as node_path from "path";
// states
import { MappedStateHandler } from "@/states";
// api
import { BridgeEvent } from "@/api";

export class Storage extends MappedStateHandler<Record<string, StorageState>> {
	constructor(args: {
		state: Storage["_state"];
	}) {
		super({ state: {} });

		for (const key of Object.keys(args.state)) {
			this.register(key, args.state[key].path, args.state[key].state);
		}

		setInterval(() => {
			for (const key of Object.keys(this.state)) {
				// export file
				this.export(key);
			}
		},
		//
		// 1000 milliseconds = 1 second
		// 60 seconds = 1 minute
		//
		1000 * 60 * 5);

		window.bridge.handle(BridgeEvent.CLOSE, () => {
			for (const key of Object.keys(this.state)) {
				// export file
				this.export(key);
			}
			window.API.close("storage");
		});
	}
	public get state() {
		return super.state;
	}
	/**
	 * @deprecated this function will **ALWAYS** throw an error
	 */
	public set state(state: Storage["_state"]) {
		//
		// getter and setter must share the same accessibility,
		// but since getter is public, so do the setter must be.
		// to prevent bulk define, this function will always throw error.
		//
		throw new Error("bulk define storage may cause unwanted side effects");
	}
	public register(key: keyof Storage["_state"], path: StorageState["path"], fallback: StorageState["state"]) {
		this.modify(key, this.import(path, fallback), (unsafe) => {
			// export file
			this.export(key);
		});
	}
	public unregister(key: keyof Storage["_state"]) {
		node_fs.unlink(this.state[key].path, () => {
			this.modify(key, null);
		});
	}
	private import(path: StorageState["path"], fallback: StorageState["state"] = {}) {
		try {
			return new StorageState({ path: path, state: JSON.parse(node_fs.readFileSync(path, "utf-8")) });
		} catch {
			return new StorageState({ path: path, state: fallback });
		}
	}
	private export(key: keyof Storage["_state"]) {
		node_fs.mkdirSync(node_path.dirname(this.state[key].path), { recursive: true });
		node_fs.writeFileSync(this.state[key].path, JSON.stringify(this.state[key].state));
	}
}

export class StorageState {
	public readonly path: string;
	public state: Record<string, any> | Array<any> | string;

	constructor(args: {
		path: StorageState["path"];
		state: StorageState["state"];
	}) {
		this.path = args.path;
		this.state = args.state;
	}
}

export default (
	//
	// singleton
	//
	new Storage({
		state: {
			"config": new StorageState({
				path: "./config.json",
				state: {}
			}),
			"bookmark": new StorageState({
				path: "./bookmark.json",
				state: []
			})
		}
	})
)
