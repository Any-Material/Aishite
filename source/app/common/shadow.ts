import Unit from "@/app/common/unit";
import Style from "@/app/common/style";

/** @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow */
class Shadow extends Style {
	constructor(
		public readonly shadow: Array<Parameters<typeof compiler>>
	) {
		super();
	}
	protected compile() {
		return {
			boxShadow: this.shadow?.map((args) => compiler(...args)).join(",")
		};
	}
}
/** inset | offset-x | offset-y | blur-radius | spread-radius | color */
function compiler(color: string, x: number, y: number, blur: number, spread: number) {
	return [Unit(x), Unit(y), Unit(blur), Unit(spread), color].join("\u0020");
}

export default Shadow;
