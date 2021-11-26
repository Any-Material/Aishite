// common
import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";
// layout
import Draggable from "@/app/layout/draggable";
import Decoration from "@/app/layout/decoration";

class ContainerProps extends Props<ArrayElement> {
	/** Whether to allow lower `z-index` elements triggering event when this `Container` overlaps. */
	public readonly phantom?: boolean;
	/** CSS transition duration in `ms`. */
	public readonly duration?: number;
	/** Act as parent decoration but more efficient. */
	public readonly decoration?: Nullable<Omit<Decoration["props"], "children">>;
	// events
	public readonly onMouseUp?: (callback: Container) => void;
	public readonly onMouseDown?: (callback: Container) => void;
	public readonly onMouseEnter?: (callback: Container) => void;
	public readonly onMouseLeave?: (callback: Container) => void;

	constructor(args: Args<ContainerProps>) {
		super(args);

		this.phantom = args.phantom;
		this.duration = args.duration;
		this.decoration = args.decoration;
		this.onMouseUp = args.onMouseUp;
		this.onMouseDown = args.onMouseDown;
		this.onMouseEnter = args.onMouseEnter;
		this.onMouseLeave = args.onMouseLeave;
	}
}

class ContainerState {
	public decoration: ContainerProps["decoration"];

	constructor(args: Args<ContainerState>) {
		this.decoration = args.decoration;
	}
}

class Container extends Stateful<ContainerProps, ContainerState> {
	protected create() {
		return new ContainerState({ decoration: null });
	}
	protected postCSS() {
		return {
			transitionDelay: Unit(0, "ms"),
			transitionDuration: Unit(this.props.duration ?? 350, "ms"),
			transitionTimingFunction: "ease-in-out"
		};
	}
	protected preCSS() {
		return {};
	}
	protected build() {
		return (
			<Decoration {...{ ...this.props.decoration, ...this.state.decoration }}>
				<Draggable drag={false}>
					<section id={this.props.id}
						onMouseUp={(event) => {
							if (!this.props.phantom) event.stopPropagation();
							this.props.onMouseUp?.(this);
						}}
						onMouseDown={(event) => {
							if (!this.props.phantom) event.stopPropagation();
							this.props.onMouseDown?.(this);
						}}
						onMouseEnter={(event) => {
							if (!this.props.phantom) event.stopPropagation();
							this.props.onMouseEnter?.(this);
						}}
						onMouseLeave={(event) => {
							if (!this.props.phantom) event.stopPropagation();
							this.props.onMouseLeave?.(this);
						}}
					>{this.props.children}</section>
				</Draggable>
			</Decoration>
		);
	}
	public style(decoration: ContainerState["decoration"], callback?: () => void) {
		this.setState({ ...this.state, decoration: decoration }, () => {
			callback?.();
		});
	}
}

export default Container;
