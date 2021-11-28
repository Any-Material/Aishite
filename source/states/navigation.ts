// states
import { StateHandler } from "@/states";

export enum Viewport {
	BROWSER,
	VIEWER
}

export class Navigation extends StateHandler<NavigationState> {
	public get state() {
		return super.state;
	}
	public set state(state: Navigation["_state"]) {
		super.state = state;
	}
}

export class NavigationState {
	public view: Viewport;
	public args: any;

	constructor(args: {
		view: NavigationState["view"];
		args: NavigationState["args"];
	}) {
		this.view = args.view,
		this.args = args.args;
	}
}

export default (
	//
	// singleton
	//
	new Navigation({
		state: new NavigationState({
			view: Viewport.BROWSER,
			args: null
		})
	})
)
