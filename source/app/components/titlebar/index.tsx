// framework
import React from "react";
// style
import "./index.scss";
// components
import Button from "@/app/components/button";
// api
import { BridgeEvent } from "@/api";

export interface TitleBarProps extends Props {
	enable: boolean;
}

export interface TitleBarState {
	focus: boolean,
	maximize: boolean,
	fullscreen: boolean;
}

export class TitleBar extends React.Component<TitleBarProps, TitleBarState> {
	public props: TitleBarProps;
	public state: TitleBarState;

	constructor(props: TitleBarProps) {
		super(props);
		this.props = props;
		this.state = {
			focus: false,
			maximize: false,
			fullscreen: false
		};

		window.bridge.handle(BridgeEvent.FOCUS, () => {
			this.setState({ ...this.state, focus: true });
		});
		window.bridge.handle(BridgeEvent.BLUR, () => {
			this.setState({ ...this.state, focus: false });
		});
		window.bridge.handle(BridgeEvent.MAXIMIZE, () => {
			this.setState({ ...this.state, maximize: true });
		});
		window.bridge.handle(BridgeEvent.UNMAXIMIZE, () => {
			this.setState({ ...this.state, maximize: false });
		});
		window.bridge.handle(BridgeEvent.ENTER_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		window.bridge.handle(BridgeEvent.LEAVE_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: false });
		});
	}
	static getDerivedStateFromProps(after: TitleBarProps, before: TitleBarProps) {
		return after;
	}
	public render() {
		return (
			<section data-component="titlebar" id={this.props.id} class={inline({ "enable": this.props.enable, "contrast": true, "draggable": true, ...this.props.class })}>
				{[
					{
						id: "focus",
						HTML: require(`@/assets/icons/focus.svg`),
						click: () => {
							window.API.minimize();
						}
					},
					{
						id: "maximize",
						HTML: this.state.maximize ? require(`@/assets/icons/minimize.svg`) : require(`@/assets/icons/maximize.svg`),
						click: () => {
							if (this.state.maximize) {
								window.API.unmaximize();
							} else {
								window.API.maximize();
							}
						}
					},
					{
						id: "close",
						HTML: require(`@/assets/icons/close.svg`),
						click: () => {
							window.API.close("titlebar");
						}
					}
				].map(({ id, HTML, click }, index) => {
					return (
						<Button id={id} class={{ "un_draggable": true }} key={index} handler={{ click: click }}>{HTML}</Button>
					);
				})}
			</section>
		);
	}
}

export default TitleBar;
