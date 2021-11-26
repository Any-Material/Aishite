// common
import Unit from "@/app/common/unit";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

type SizeType = "minimum" | "maximum";

class SizeProps extends Casacade {
	public readonly type?: SizeType;
	public readonly width?: Unit;
	public readonly height?: Unit;

	constructor(args: Args<SizeProps>) {
		super(args);

		this.type = args.type;
		this.width = args.width;
		this.height = args.height;
	}
}

class Size extends StyleSheet<SizeProps> {
	protected postCSS() {
		return {
			[this.props.type === "minimum" ? "minWidth" : this.props.type === "maximum" ? "maxWidth" : "width"]: this.props.width,
			[this.props.type === "minimum" ? "minHeight" : this.props.type === "maximum" ? "maxHeight" : "height"]: this.props.height,
			flexShrink: typeof (this.props?.width ?? this.props?.height) === "string" && /%$/.test((this.props?.width ?? this.props?.height) as string) ? 1.0 : 0.0
		};
	}
	protected preCSS() {
		return {};
	}
}

export default Size;
