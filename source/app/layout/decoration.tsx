// common
import { Casacade } from "@/app/common/props";
import Shadow from "@/app/common/shadow";
import Border from "@/app/common/border";
import Background from "@/app/common/background";
import { StyleSheet } from "@/app/common/framework";

class DecorationProps extends Casacade {
	public readonly shadow?: ConstructorParameters<typeof Shadow>[0];
	public readonly border?: ConstructorParameters<typeof Border>[0];
	public readonly background?: ConstructorParameters<typeof Background>[0];

	constructor(args: Args<DecorationProps>) {
		super(args);

		this.shadow = args.shadow;
		this.border = args.border;
		this.background = args.background;
	}
}

class Decoration extends StyleSheet<DecorationProps> {
	protected postCSS() {
		return {
			...(this.props.shadow ? new Shadow(this.props.shadow).toStyle() : {}),
			...(this.props.border ? new Border(this.props.border).toStyle() : {}),
			...(this.props.background ? new Background(this.props.background).toStyle() : {})
		};
	}
	protected preCSS() {
		return {};
	}
}

export default Decoration;
