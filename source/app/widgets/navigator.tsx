// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";
// layout
import Row from "@/app/layout/row";
import Size from "@/app/layout/size";
import Text from "@/app/layout/text";
import Spacer from "@/app/layout/spacer";
import Position from "@/app/layout/position";
import Container from "@/app/layout/container";
// widgets
import Button from "@/app/widgets/button";
// icons
import Close from "@/app/icons/close";
// states
import navigator from "@/states/navigator";

class NavigatorProps extends Props<undefined> {
	constructor(args: Args<NavigatorProps>) {
		super(args);
	}
}

class NavigatorState {
	constructor(args: Args<NavigatorState>) { }
}

class Navigator extends Stateful<NavigatorProps, NavigatorState> {
	protected create() {
		// TODO: use this.binds instead
		navigator.handle((state) => {
			// render
			this.forceUpdate();
		});
		return new NavigatorState({});
	}
	protected postCSS() {
		return {};
	}
	protected preCSS() {
		return {};
	}
	protected build() {
		return (
			<Row id={"navigator"}>
				{navigator.state.pages.map((page, x) => {
					return (
						<Spacer key={x}>
							<Size type={"minimum"} width={Unit(5 + 19.5 + 5)}>
								<Size type={"maximum"} width={Unit(250)}>
									<Container decoration={{ border: { top: [4.5, "solid", navigator.state.index === x ? Color.SPOTLIGHT : "transparent"], bottom: [4.5] }, background: { color: navigator.state.index === x ? Color.DARK_200 : Color.DARK_000 } }}
										onMouseDown={(I) => {
											if (navigator.state.index !== x) {
												I.style(null, () => {
													navigator.jump(x);
												});
											}
										}}
										onMouseEnter={(I) => {
											if (navigator.state.index !== x) {
												I.style({ border: { top: [4.5, "solid", Color.DARK_200] }, background: { color: Color.DARK_100 } });
											}
										}}
										onMouseLeave={(I) => {
											I.style(null);
										}}>
										<Position all={Unit(5)} left={Unit(10)} right={Unit(5 + 19.5 + 5)}>
											<Text id={"title"}>{page.title}</Text>
										</Position>
										<Position all={Unit(5)} left={"auto"}>
											<Size width={Unit(19.5)} height={Unit(19.5)}>
												<Button decoration={{ border: { radius: Unit(2.5) } }}
													onMouseDown={(I) => {
														navigator.close(x);
													}}
													onMouseEnter={(I) => {
														I.style({ background: { color: Color.SPOTLIGHT } });
													}}
													onMouseLeave={(I) => {
														I.style(null);
													}}
													children={<Close></Close>}
												/>
											</Size>
										</Position>
									</Container>
								</Size>
							</Size>
						</Spacer>
					);
				})}
			</Row>
		);
	}
}

export default Navigator;
