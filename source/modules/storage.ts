// nodejs
import * as node_fs from "fs";
import * as node_path from "path";
// states
import { MappedStateHandler } from "@/states";
// api
import { BridgeEvent } from "@/api";

class Storage extends MappedStateHandler<Record<string, StorageState>> {
	public get state() {
		return super.state;
	}
	/**
	 * Getter and Setter must share the same accessibility.
	 * But since Getter is public, so do the setter must be,
	 * and to prevent bulk define, this method will always throw an error.
	 */
	public set state(state: Storage["_state"]) {
		throw new Error("bulk define storage may cause unwanted side effects");
	}
	protected create() {
		for (const key of Object.keys(super.state)) {
			this.register(key, super.state[key].path, super.state[key].state);
		}

		setInterval(() => {
			for (const key of Object.keys(this.state)) {
				// export file
				this.export(key);
			}
		}, 1000 * 60 * 5);

		window.bridge.handle(BridgeEvent.CLOSE, () => {
			for (const key of Object.keys(this.state)) {
				// export file
				this.export(key);
			}
			window.API.close("storage");
		});
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

class StorageState {
	public readonly path: string;
	public state: any;

	constructor(args: Args<StorageState>) {
		this.path = args.path;
		this.state = args.state;
	}
}

const singleton = new Storage({
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
});

export default singleton;
