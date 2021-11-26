// common
import Unit from "@/app/common/unit";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

type OffsetType = "margin" | "padding";

class OffsetProps extends Casacade {
	public readonly type: OffsetType;
	public readonly all?: Unit;
	public readonly top?: Unit;
	public readonly left?: Unit;
	public readonly right?: Unit;
	public readonly bottom?: Unit;

	constructor(args: Args<OffsetProps>) {
		super(args);

		this.type = args.type;
		this.all = args.all;
		this.top = args.top;
		this.left = args.left;
		this.right = args.right;
		this.bottom = args.bottom;
	}
}

class Offset extends StyleSheet<OffsetProps> {
	protected postCSS() {
		return {
			[this.props.type + "Top"]: this.props.top ?? this.props.all,
			[this.props.type + "Left"]: this.props.left ?? this.props.all,
			[this.props.type + "Right"]: this.props.right ?? this.props.all,
			[this.props.type + "Bottom"]: this.props.bottom ?? this.props.all
		};
	}
	protected preCSS() {
		return {};
	}
}

export default Offset;
