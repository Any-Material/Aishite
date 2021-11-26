// common
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

type InlineType = "flex" | "block";

class InlineProps extends Casacade {
	public readonly type: InlineType;

	constructor(args: Args<InlineProps>) {
		super(args);

		this.type = args.type;
	}
}
class Inline extends StyleSheet<InlineProps> {
	protected postCSS() {
		return {
			display: this.props.type === "flex" ? "inline-flex" : "inline-block"
		};
	}
	protected preCSS() {
		return {};
	}
}

export default Inline;
