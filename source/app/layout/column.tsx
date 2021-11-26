// common
import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";
import { Vertical, Alignment } from "@/app/common/flex";

class ColumnProps extends Props<ArrayElement> {
	public readonly wrap?: boolean;
	public readonly basis?: Unit;
	public readonly direction?: Vertical;
	public readonly alignment?: Alignment;

	constructor(args: Args<ColumnProps>) {
		super(args);

		this.wrap = args.wrap;
		this.basis = args.basis;
		this.direction = args.direction;
		this.alignment = args.alignment;
	}
}

class Column extends Stateless<ColumnProps> {
	// @ts-ignore
	protected postCSS() {
		return {
			display: "flex",
			flexWrap: this.props.wrap ? "wrap" : "nowrap",
			flexBasis: this.props.basis,
			flexDirection: this.props.direction ?? Vertical.TOP_TO_BOTTOM,
			justifyContent: this.props.alignment ?? Alignment.FLEX_START
		};
	}
	protected preCSS() {
		return {
			height: Unit(100, "%"),
			flexShrink: 0.0
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Column;
