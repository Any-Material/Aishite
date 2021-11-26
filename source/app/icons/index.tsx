// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

class IconProps extends Props<SingleElement> {
	public readonly color?: Nullable<string>;
	/** Whether to allow lower `z-index` elements triggering event when this `Container` overlaps. */
	public readonly phantom?: boolean;
	/** CSS transition duration in `ms`. */
	public readonly duration?: number;
	// events
	public readonly onMouseUp?: (callback: Icon) => void;
	public readonly onMouseDown?: (callback: Icon) => void;
	public readonly onMouseEnter?: (callback: Icon) => void;
	public readonly onMouseLeave?: (callback: Icon) => void;

	constructor(args: Args<IconProps>) {
		super(args);

		this.color = args.color;
		this.phantom = args.phantom;
		this.duration = args.duration;
		this.onMouseUp = args.onMouseUp;
		this.onMouseDown = args.onMouseDown;
		this.onMouseEnter = args.onMouseEnter;
		this.onMouseLeave = args.onMouseLeave;
	}
}

class IconState {
	public color: IconProps["color"];

	constructor(args: Args<IconState>) {
		this.color = args.color;
	}
}

class Icon extends Stateful<IconProps, IconState> {
	protected create() {
		return new IconState({ color: null });
	}
	protected postCSS() {
		return {
			fill: this.state.color ?? this.props.color ?? Color.TEXT_000,
			transitionDelay: Unit(0, "ms"),
			transitionDuration: Unit(this.props.duration ?? 350, "ms"),
			transitionProperty: "fill",
			transitionTimingFunction: "ease-in-out"
		};
	}
	protected preCSS() {
		return {
			width: Unit(12.5),
			height: Unit(12.5)
		};
	}
	public modify() {
		return {
			id: this.props.id,
			// events
			onMouseUp: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseUp?.(this);
			},
			onMouseDown: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseDown?.(this);
			},
			onMouseEnter: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseEnter?.(this);
			},
			onMouseLeave: (event: MouseEvent) => {
				if (this.props.phantom) event.stopPropagation();
				this.props.onMouseLeave?.(this);
			}
		};
	}
	protected build() {
		if (!this.props.children) {
			throw new Error("Missing children");
		}
		return this.props.children;
	}
	public style(color: IconState["color"], callback?: () => void) {
		this.setState({ ...this.state, color: color }, () => {
			callback?.();
		});
	}
}

export default Icon;
