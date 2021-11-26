// common
import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

class CenterProps extends Props<SingleElement> {
	public readonly x: boolean;
	public readonly y: boolean;

	constructor(args: Args<CenterProps>) {
		super(args);

		this.x = args.x;
		this.y = args.y;
	}
}

class Center extends Stateless<CenterProps> {
	protected postCSS() {
		return {
			display: "flex",
			alignItems: this.props.y ? "center" : undefined,
			justifyContent: this.props.x ? "center" : undefined
		};
	}
	protected preCSS() {
		return {
			width: Unit(100, "%"),
			height: Unit(100, "%")
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Center;
