// common
import Unit from "@/app/common/unit";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";
// states
import navigator from "@/states/navigator";

class ViewportProps extends Props<undefined> {
	constructor(args: Args<ViewportProps>) {
		super(args);
	}
}

class ViewportState {
	constructor(args: Args<ViewportState>) {}
}

/**
 * This widget will display `navigator`'s current view,
 * and will scroll up to top upon `navigator` receives change.
 * One may define which `Element` to scroll up
 * by declaring `data-scrollable` custom attribute to desired.
 */
class Viewport extends Stateful<ViewportProps, ViewportState> {
	protected create() {
		// TODO: use this.binds instead
		navigator.handle((state) => {
			// render
			this.forceUpdate();
			// reset scroll position
			setTimeout(() => {
				document.querySelector("#background > section[style*=\"display: block\"] *[data-scrollable]")?.scrollTo({ top: 0, behavior: "smooth" });
			});
		});
		return new ViewportState({});
	}
	protected postCSS() {
		return {};
	}
	protected preCSS() {
		return {};
	}
	protected build() {
		return (<>{navigator.state.pages.map((page, x) => <section key={x} data-scrollable style={{ display: navigator.state.index === x ? "block" : "none", width: Unit(100, "%"), height: Unit(100, "%"), overflow: "auto" }}>{page.widget}</section>)}</>);
	}
}

export default Viewport;
