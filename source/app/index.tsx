// framework
import React from "react";
// style
import "./index.scss";
// components
import TitleBar from "@/app/components/titlebar";
import Overlay from "@/app/views/overlay";
import Browser from "@/app/views/browser";
import Viewer from "@/app/views/viewer";
// states
import navigation, { Viewport } from "@/states/navigation";
// api
import { BridgeEvent } from "@/api";

export interface AppProps extends Props {}

export interface AppState {
	view: Viewport;
	terminal: boolean;
	fullscreen: boolean;
}

export class App extends React.Component<AppProps, AppState> {
	public props: AppProps;
	public state: AppState;
	
	constructor(props: AppProps) {
		super(props);
		this.props = props;
		this.state = {
			view: navigation.state.view,
			terminal: false,
			fullscreen: false
		};
		
		window.bridge.handle(BridgeEvent.ENTER_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: true });
		});
		window.bridge.handle(BridgeEvent.LEAVE_FULL_SCREEN, () => {
			this.setState({ ...this.state, fullscreen: false });
		});
		window.bridge.handle(BridgeEvent.TOGGLE_TERMINAL, () => {
			this.setState({ ...this.state, terminal: !this.state.terminal });
		});
		navigation.handle((state) => {
			this.setState({ ...this.state, view: state.after.view });
		});
	}
	public render() {
		return (
			<>
				<TitleBar enable={!this.state.fullscreen}></TitleBar>
				<section id="content" class="contrast">
					<Browser enable={this.state.view === Viewport.BROWSER}></Browser>
					<Viewer enable={this.state.view === Viewport.VIEWER}></Viewer>
					<Overlay enable={this.state.terminal}></Overlay>
				</section>
			</>
		);
	}
}

export default App;
