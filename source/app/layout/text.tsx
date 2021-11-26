// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateless } from "@/app/common/framework";

class TextProps extends Props<TextElement> {
	public readonly size?: Unit;
	public readonly type?: "italic" | "normal" | "oblique";
	public readonly color?: string;
	public readonly family?: string;
	public readonly weight?: "bold" | "normal" | "bolder" | "lighter";
	/** CSS `transition-duration` */
	public readonly duration?: number;
	/** @required */
	declare public readonly children: string;

	constructor(args: Args<TextProps>) {
		super(args);

		this.size = args.size;
		this.type = args.type;
		this.color = args.color;
		this.family = args.family;
		this.weight = args.weight;
		this.duration = args.duration;
	}
}

class Text extends Stateless<TextProps> {
	protected postCSS() {
		return {
			color: this.props.color ?? Color.TEXT_000,
			fontSize: this.props.size,
			fontStyle: this.props.type,
			fontFamily: this.props.family,
			fontWeight: this.props.weight,
			transitionDelay: Unit(0, "ms"),
			transitionDuration: Unit(this.props.duration ?? 350, "ms"),
			transitionProperty: "color",
			transitionTimingFunction: "ease-in-out"
		};
	}
	// @ts-ignore
	protected preCSS() {
		return {
			overflow: "hidden",
			whiteSpace: "nowrap",
			textOverflow: "ellipsis"
		};
	}
	protected build() {
		return (<section id={this.props.id}>{this.props.children}</section>);
	}
}

export default Text;
