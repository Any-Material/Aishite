import { StateHandler } from "@/handles";

class ContextMenu extends StateHandler<ContextMenuState> {
	public get state() {
		return super.state;
	}
	public set state(state: ContextMenu["_state"]) {
		super.state = new ContextMenuState(state);
	}
	protected create() {
		// TODO: none
	}
}

class ContextMenuState {
	public readonly x: number;
	public readonly y: number;
	public readonly items: Array<"seperator" | {
		role: string;
		toggle: boolean;
		method: () => void;
	}>;

	constructor(args: Args<ContextMenuState>) {
		this.x = args.x;
		this.y = args.y;
		this.items = args.items;
	}
}

const singleton = new ContextMenu(
	new ContextMenuState({ x: 0, y: 0, items: [] })
);

export default singleton;
