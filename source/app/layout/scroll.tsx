// common
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

type ScrollType = "auto" | "clip" | "hidden" | "scroll" | "visible";

/** @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow */
class ScrollProps extends Casacade {
	public readonly x: ScrollType;
	public readonly y: ScrollType;

	constructor(args: Args<ScrollProps>) {
		super(args);

		this.x = args.x;
		this.y = args.y;
	}
}

class Scroll extends StyleSheet<ScrollProps> {
	protected postCSS() {
		return {
			overflowX: this.props.x,
			overflowY: this.props.y
		};
	}
	protected preCSS() {
		return {};
	}
}

export default Scroll;
