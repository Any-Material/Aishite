import React from "react";

import Unit from "@/app/common/unit";
import { Clear } from "@/app/common/props";
import { Stateful, LifeCycle } from "@/app/common/framework";

import Text from "@/app/layout/text";
import Center from "@/app/layout/center";

import history from "@/handles/history";

interface ViewportProps extends Clear<undefined> {
	// TODO: none
}

interface ViewportState {
	key: Nullable<React.Key>;
}

/**
 * This widget will display `history`'s current view,
 * and will scroll up to top upon `history` receive changes.
 * One may define which `Element` to scroll up
 * by declare `data-scrollable` custom attribute to desired element.
 */
class Viewport extends Stateful<ViewportProps, ViewportState> {
	protected create() {
		return ({ key: history.state.pages[history.state.index].element.key });
	}
	protected events(): LifeCycle<ViewportProps, ViewportState> {
		return {
			DID_MOUNT: () => {
				history.handle((event) => {
					// cache
					const key = event.detail.after.pages[event.detail.after.index].element.key;

					// reorder
					if (this.state.key === key && event.detail.before.pages.length === event.detail.after.pages.length) return;

					// render
					this.setState((state) => ({ key: event.detail.after.pages[event.detail.after.index].element.key }), () => {
						// reset scroll position
						document.querySelector("#background > section[style*=\"display: block\"] *[data-scrollable]")?.scrollTo({ top: 0, behavior: "smooth" });
					});
				});
			}
		};
	}
	protected postCSS(): React.CSSProperties {
		return {};
	}
	protected preCSS(): React.CSSProperties {
		return {};
	}
	protected build() {
		return (<>{history.state.pages.map((page, index) => <ErrorBoundery key={page.element.key} visible={this.state.key ? this.state.key === page.element.key : history.state.index === index}>{page.element}</ErrorBoundery>)}</>);
	}
}

interface ErrorBounderyProps {
	key: Nullable<React.Key>;
	visible: boolean;
	children: JSX.Element;
}

interface ErrorBounderyState {
	error: boolean;
}

class ErrorBoundery extends React.Component<ErrorBounderyProps, ErrorBounderyState> {
	constructor(props: ErrorBounderyProps) {
		super(props);

		this.state = ({ error: false });
	}
	/** Error boundery. */
	static getDerivedStateFromError() {
		return ({ error: true });
	}
	public render() {
		if (this.state.error) {
			return (<Center key={this.props.key} x={true} y={true}><Text children={[{ text: "OPS, SOMETHING WENT WRONG", weight: "bold" }]}/></Center>);
		}
		return (<section key={this.props.key} data-scrollable="frame" style={{ display: this.props.visible ? "block" : "none", width: Unit(100, "%"), height: Unit(100, "%"), overflow: "auto" }}>{this.props.children}</section>);
	}
}

export default Viewport;
