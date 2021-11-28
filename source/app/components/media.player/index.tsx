// framework
import React from "react";
// style
import "./index.scss";
// components
import Button from "@/app/components/button";
import LazyLoad from "@/app/components/lazyload";
// states
import navigation, { NavigationState, Viewport } from "@/states/navigation";
// api
import { BridgeEvent } from "@/api";

export interface MediaProps extends Props {
	options: {
		files: string[];
	};
}

export interface MediaState {
	fullscreen: boolean;
}

export class MediaPlayer extends React.Component<MediaProps, MediaState> {
	public props: MediaProps;
	public state: MediaState;
	
	constructor(props: MediaProps) {
		super(props);
		this.props = props;
		this.state = {
			fullscreen: false
		};

		window.bridge.handle(BridgeEvent.ENTER_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		window.bridge.handle(BridgeEvent.LEAVE_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: false });
		});
	}
	public render() {
		return (
			<section data-component="media.player" id={this.props.id} class={inline({ ...this.props.class })}>
				<section id="navigation" class={inline({ "enable": !this.state.fullscreen, "contrast": true, "center-x": true })}>
					{[
						{
							HTML: require(`@/assets/icons/return.svg`),
							click: () => {
								navigation.state = new NavigationState({ view: Viewport.BROWSER, args: null });
							}
						}
					].map(({ HTML, click }, index) => {
						return (
							<Button key={index} handler={{ click: click }} >{HTML}</Button>
						);
					})}
				</section>
				<section id="scrollable" class="scroll-y">
					{this.props.options.files.map((file, index) => {
						return (
							<LazyLoad options={{ source: file }} key={index}></LazyLoad>
						);
					})}
				</section>
			</section>
		);
	}
}

export default MediaPlayer;
