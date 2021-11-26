// common
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class DraggableProps extends Casacade {
	public readonly drag: boolean;

	constructor(args: Args<DraggableProps>) {
		super(args);

		this.drag = args.drag;
	}
}

class Draggable extends StyleSheet<DraggableProps> {
	// @ts-ignore
	protected postCSS() {
		return {
			WebkitAppRegion: this.props.drag ? "drag" : "no-drag"
		};
	}
	protected preCSS() {
		return {};
	}
}

export default Draggable;
