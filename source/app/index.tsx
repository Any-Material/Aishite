// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful, EventManager } from "@/app/common/framework";
// layout
import Row from "@/app/layout/row";
import Size from "@/app/layout/size";
import Spacer from "@/app/layout/spacer";
import Column from "@/app/layout/column";
import Draggable from "@/app/layout/draggable";
// Statefuls
import Button from "@/app/widgets/button";
import Navigator from "@/app/widgets/navigator";
import Viewport from "@/app/widgets/view";
// assets
import Close from "@/app/icons/close";
import Maximize from "@/app/icons/maximize";
import Minimize from "@/app/icons/minimize";
import Unmaximize from "@/app/icons/unmaximize";
// api
import { BridgeEvent } from "@/api";

class AppProps extends Props<undefined> {
	constructor(args: Args<AppProps>) {
		super(args);
	}
}

class AppState {
	public maximize: boolean;
	public fullscreen: boolean;

	constructor(args: Args<AppState>) {
		this.maximize = args.maximize;
		this.fullscreen = args.fullscreen;
	}
}

class App extends Stateful<AppProps, AppState> {
	protected create() {
		return new AppState({ maximize: false, fullscreen: false });
	}
	protected events() {
		return [
			new EventManager(window.bridge, BridgeEvent.MAXIMIZE, () => {
				this.setState({ ...this.state, maximize: true });
			}),
			new EventManager(window.bridge, BridgeEvent.UNMAXIMIZE, () => {
				this.setState({ ...this.state, maximize: false });
			}),
			new EventManager(window.bridge, BridgeEvent.ENTER_FULL_SCREEN, () => {
				this.setState({ ...this.state, fullscreen: true });
			}),
			new EventManager(window.bridge, BridgeEvent.LEAVE_FULL_SCREEN, () => {
				this.setState({ ...this.state, fullscreen: false });
			})
		];
	}
	protected postCSS() {
		return {
			background: Color.DARK_000
		};
	}
	protected preCSS() {
		return {};
	}
	protected build() {
		return (
			<Column id={"root"}>
				{/* TITLEBAR */}
				{(() => {
					if (!this.state.fullscreen) {
						return (
							<Draggable drag={true}>
								<Row id="titlebar">
									<Spacer>
										<Navigator/>
									</Spacer>
									<Size width={Unit(75)}>
										<section></section>
									</Size>
									<Size width={Unit(50)} height={Unit(40)}>
										<Button id="minimize"
											onMouseDown={(I) => {
												window.API.minimize();
											}}
											onMouseEnter={(I) => {
												I.style({ background: { color: Color.DARK_100 } });
											}}
											onMouseLeave={(I) => {
												I.style(null);
											}}
											children={<Minimize/>}
										/>
										<Button id="maximize"
											onMouseDown={(I) => {
												if (this.state.maximize) {
													window.API.unmaximize();
												} else {
													window.API.maximize();
												}
											}}
											onMouseEnter={(I) => {
												I.style({ background: { color: Color.DARK_100 } });
											}}
											onMouseLeave={(I) => {
												I.style(null);
											}}
											children={this.state.maximize ? <Unmaximize/> : <Maximize/>}
										/>
										<Button id="close"
											onMouseDown={(I) => {
												window.API.close("titlebar");
											}}
											onMouseEnter={(I) => {
												I.style({ background: { color: Color.SPOTLIGHT } });
											}}
											onMouseLeave={(I) => {
												I.style(null);
											}}
											children={<Close/>}
										/>
									</Size>
								</Row>
							</Draggable>
						);
					}
				})()}
				{/* CONTENT */}
				<section style={{ width: Unit(100, "%"), height: Unit(100, "%"), background: Color.DARK_200 }}>
					<Viewport/>
				</section>
			</Column>
		);
	}
}

export default App;
