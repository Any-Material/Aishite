// common
import Unit from "@/app/common/unit";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class TransformProps extends Casacade {
	public readonly scale?: [x: number, y?: number];
	public readonly rotate?: number;
	public readonly translate?: [x: Unit, y?: Unit];
	/** CSS `transition-duration` */
	public readonly duration?: number;

	constructor(args: Args<TransformProps>) {
		super(args);

		this.scale = args.scale;
		this.rotate = args.rotate;
		this.translate = args.translate;
		this.duration = args.duration;
	}
}

class Transform extends StyleSheet<TransformProps> {
	protected postCSS() {
		return {
			transform: ["scale(" + (this.props.scale?.[0] ?? 1.0) + "," + (this.props.scale?.[1] ?? this.props.scale?.[0] ?? 1.0) + ")", "rotate(" + (this.props.rotate ?? 0) + "deg)", "translate(" + (this.props.translate?.[0] ?? 0.0) + "," + (this.props.translate?.[1] ?? this.props.translate?.[0] ?? 0.0) + ")"].join("\u0020"),
			transitionDelay: Unit(0, "ms"),
			transitionDuration: Unit(this.props.duration ?? 350, "ms"),
			transitionProperty: "transform",
			transitionTimingFunction: "ease-in-out"
		};
	}
	protected preCSS() {
		return {};
	}
}

export default Transform;
