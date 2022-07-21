import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";

import history from "@/handles/history";

abstract class Page<P extends Props<never>, S> extends Stateful<P, S> {
	/** Return `this.node()` wrapper. */
	protected wrapper() {
		return this.node()?.closest("section[style*=\"display: block\"]");
	}
	/** Whether the component is visible */
	protected visible() {
		// @ts-ignore
		if (this.props["data-key"]) {
			// @ts-ignore
			return history.state.pages[history.state.index].element.props["data-key"] === this.props["data-key"];
		}
		return this.wrapper() !== null;
	}
}

export default Page;
