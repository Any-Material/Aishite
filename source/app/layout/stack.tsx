// common
import Unit from "@/app/common/unit";
import { Casacade } from "@/app/common/props";
import { StyleSheet } from "@/app/common/framework";

class StackProps extends Casacade {
	public readonly grow?: number;

	constructor(args: Args<StackProps>) {
		super(args);

		this.grow = args.grow;
	}
}

class Stack extends StyleSheet<StackProps> {
	// @ts-ignore
	protected postCSS() {
		return {
			position: "absolute"
		};
	}
	protected preCSS() {
		return {
			width: Unit(100, "%"),
			height: Unit(100, "%")
		};
	}
}

export default Stack;
