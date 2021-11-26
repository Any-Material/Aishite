// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful, EventManager } from "@/app/common/framework";
// layout
import Row from "@/app/layout/row";
import Size from "@/app/layout/size";
import Form from "@/app/layout/form";
import Center from "@/app/layout/center";
import Column from "@/app/layout/column";
import Offset from "@/app/layout/offset";
import Spacer from "@/app/layout/spacer";
import Scroll from "@/app/layout/scroll";
import Container from "@/app/layout/container";
// widgets
import Paging from "@/app/widgets/paging";
import Gallery from "@/app/views/browser/gallery";
// icons
import Close from "@/app/icons/close";
// modules
import { SearchQuery } from "@/modules/hitomi.la/search";
import { GalleryBlock } from "@/modules/hitomi.la/gallery";
// states
import navigator from "@/states/navigator";

class BrowserProps extends Props<undefined> {
	public index: number;
	public query: string;

	constructor(args: Args<BrowserProps>) {
		super(args);

		this.index = args.index;
		this.query = args.query;
	}
}

class BrowserState extends BrowserProps {
	public init: boolean;
	public length: number;
	public gallery: Array<GalleryBlock>;
	public breakpoint: number;

	constructor(args: Args<BrowserState>) {
		super(args);

		this.init = args.init;
		this.length = args.length;
		this.gallery = args.gallery;
		this.breakpoint = args.breakpoint;
	}
}

class Browser extends Stateful<BrowserProps, BrowserState> {
	protected create() {
		// TODO: use this.binds instead
		navigator.handle((state) => {
			if (this.visible()) {
				if (this.state.init) this.macro_0();
				// combination of macro_0 and macro_1
				else this.setState({ ...this.state, init: true, breakpoint: this.grid() }, () => { this.gallery(this.state.query, this.state.index); });
			}
		});
		return new BrowserState({ init: false, index: this.props.index, query: this.props.query, length: 0, gallery: [], breakpoint: 0 });
	}
	protected events() {
		return [
			new EventManager(window, "resize", () => {
				if (this.visible()) this.macro_0();
			}),
			new EventManager(this.handler, "DID_MOUNT", () => {
				if (this.visible()) this.macro_1();
			})
		];
	}
	protected postCSS() {
		return {};
	}
	protected preCSS() {
		return {};
	}
	protected build() {
		return (
			<Column id={"browser"}>
				{/* SCROLL */}
				<Spacer>
					<Scroll x={"hidden"} y={"auto"}>
						<section data-scrollable>
							{/* QUERY */}
							<Offset type={"margin"} all={Unit(15)} bottom={Unit(0)}>
								<Size height={Unit(40)}>
									<Container decoration={{ border: { radius: Unit(4.5) }, shadow: [[Color.DARK_100, 0, 0, 5, 0]], background: { color: Color.DARK_300 } }}
										onMouseEnter={(I) => {
											I.style({ background: { color: Color.DARK_400 } });
										}}
										onMouseLeave={(I) => {
											I.style(null);
										}}>
										<Size height={Unit(100, "%")}>
											<Row>
												<Offset type={"margin"} left={Unit(10)} right={Unit(10)}>
													<Form id={"query"} toggle={!this.state.gallery.empty} fallback={this.state.query.length ? this.state.query : "language:all"}
														onType={(text) => {
															return true;
														}}
														onSubmit={(text) => {
															// reset gallery
															this.setState({ ...this.state, index: 0, query: text.length ? text : "language:all", length: 0, gallery: [] }, () => {
																// update gallery
																this.gallery(this.state.query, this.state.index);
																// rename
																navigator.rename(this.state.query);
															});
														}}
													/>
												</Offset>
												<Size width={Unit(50)}>
													<Center x={true} y={true}>
														<Close color={Color.DARK_500}
															onMouseDown={(I) => {
																// reset gallery
																this.setState({ ...this.state, index: 0, query: "language:all", length: 0, gallery: [] }, () => {
																	// update gallery
																	this.gallery(this.state.query, this.state.index);
																	// rename
																	navigator.rename(this.state.query);
																});
															}}
															onMouseEnter={(I) => {
																I.style(Color.TEXT_000);
															}}
															onMouseLeave={(I) => {
																I.style(null);
															}}
														/>
													</Center>
												</Size>
											</Row>
										</Size>
									</Container>
								</Size>
							</Offset>
							{/* GALLERY-LIST */}
							<Offset type={"margin"} all={Unit(7.5)}>
								<section>
									<Row wrap={true}>
										{this.state.gallery.map((gallery, x) => {
											return (
												<Column key={x} basis={Unit(100 / this.state.breakpoint, "%")}>
													<Offset type={"margin"} all={Unit(7.5)}>
														<Gallery gallery={gallery} />
													</Offset>
												</Column>
											);
										})}
									</Row>
								</section>
							</Offset>
						</section>
					</Scroll>
				</Spacer>
				{/* PAGING */}
				{(() => {
					if (this.state.length > 1) {
						return (
							<Paging toggle={!this.state.gallery.empty} index={this.state.index} length={this.state.length} breakpoint={7}
								onPageChange={(index) => {
									if (!this.visible()) {
										return false;
									}
									// reset gallery
									this.setState({ ...this.state, index: index, gallery: [] }, () => {
										// update gallery
										this.gallery(this.state.query, this.state.index);
									});
									// approve
									return true;
								}}
							/>
						);
					}
				})()}
			</Column>
		);
	}
	/**
	 * Based on 1920*1080
	 */
	public grid() {
		return Math.round(window.outerWidth / (1920 / 5));
	}
	/**
	 * Wwhether the component is visible
	 */
	public visible() {
		// @ts-ignore
		if (this.props["data-key"]) {
			// @ts-ignore
			return navigator.state.pages[navigator.state.index].widget.props["data-key"] === this.props["data-key"];
		}
		return this.node()?.closest("section[style*=\"display: block\"]") !== null;
	}
	/**
	 * Update gallery blocks based on current (state / props) `query` and `index`.
	 */
	public gallery(query: string, index: number) {
		// fetch
		SearchQuery(query).then((response) => {
			// to avoid bottleneck, make requests then assign them in order
			const block: Array<GalleryBlock> = [];
			const array: Array<number> = response.skip(index ? index * 25 : 0).take(25);

			for (let index = 0; index < array.length; index++) {
				// fetch
				GalleryBlock(array[index]).then((gallery) => {
					// assigned
					block[index] = gallery;
					// check if every request is retrieved
					if (block.length === array.length) {
						// update
						this.setState({ ...this.state, length: Math.ceil(response.length / 25), gallery: block });
					}
				}).catch(() => {
					// fallback
					return this.gallery("language:all", 0);
				});
			}
		});
	}
	public macro_0() {
		const cache = this.grid(); if (cache !== this.state.breakpoint) this.setState({ ...this.state, breakpoint: cache });
	}
	public macro_1() {
		this.setState({ ...this.state, init: true }, () => { this.gallery(this.state.query, this.state.index); });
	}
}

export default Browser;
