// common
import Unit from "@/app/common/unit";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class PositionProps extends Casacade {
	public readonly all?: Unit;
	public readonly top?: Unit;
	public readonly left?: Unit;
	public readonly right?: Unit;
	public readonly bottom?: Unit;

	constructor(args: Args<PositionProps>) {
		super(args);

		this.all = args.all;
		this.top = args.top;
		this.left = args.left;
		this.right = args.right;
		this.bottom = args.bottom;
	}
}

class Position extends StyleSheet<PositionProps> {
	// @ts-ignore
	protected postCSS() {
		return {
			position: "absolute",
			top: this.props.top ?? this.props.all,
			left: this.props.left ?? this.props.all,
			right: this.props.right ?? this.props.all,
			bottom: this.props.bottom ?? this.props.all
		};
	}
	protected preCSS() {
		return {};
	}
}

export default Position;
