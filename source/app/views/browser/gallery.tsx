// common
import Unit from "@/app/common/unit";
import Color from "@/app/common/color";
import { Props } from "@/app/common/props";
import { Stateful } from "@/app/common/framework";
// layout
import Text from "@/app/layout/text";
import Size from "@/app/layout/size";
import Stack from "@/app/layout/stack";
import Inline from "@/app/layout/inline";
import Center from "@/app/layout/center";
import Scroll from "@/app/layout/scroll";
import Offset from "@/app/layout/offset";
import Opacity from "@/app/layout/opacity";
import Position from "@/app/layout/position";
import Container from "@/app/layout/container";
import Transform from "@/app/layout/transform";
import Decoration from "@/app/layout/decoration";
// widgets
import Button from "@/app/widgets/button";
// icons
import Read from "@/app/icons/read";
import Delete from "@/app/icons/delete";
import Bookmark from "@/app/icons/bookmark";
import Download from "@/app/icons/download";
import Discovery from "@/app/icons/discovery";
// modules
import { GalleryTag, GalleryBlock } from "@/modules/hitomi.la/gallery";
// states
import navigator from "@/states/navigator";

enum Asuka {
	TITLE = 0,
	TOOLS = 1
}

enum Ayanami {
	THUMBNAIL_0 = 0,
	THUMBNAIL_1 = 1,
	INFORMATION = 2
}

class GalleryProps extends Props<undefined> {
	public readonly gallery: GalleryBlock;

	constructor(args: Args<GalleryProps>) {
		super(args);

		this.gallery = args.gallery;
	}
}

class GalleryState {
	public foreground: Asuka;
	public background: Ayanami;

	constructor(args: Args<GalleryState>) {
		this.foreground = args.foreground;
		this.background = args.background;
	}
}

class Gallery extends Stateful<GalleryProps, GalleryState> {
	protected create() {
		return new GalleryState({ foreground: Asuka.TITLE, background: Ayanami.THUMBNAIL_0 });
	}
	protected postCSS() {
		return {};
	}
	protected preCSS() {
		return {};
	}
	protected build() {
		return (
			<Size height={Unit(455)}>
				<Container id={"gallery"} decoration={{ border: { radius: Unit(4.5) }, shadow: [[Color.DARK_100, 0, 0, 5, 0]], background: { color: Color.DARK_400 } }}
					onMouseEnter={(I) => {
						if (this.state.background !== Ayanami.INFORMATION) {
							this.setState({ ...this.state, background: Ayanami.THUMBNAIL_1 });
						}
						// manipulate style anyways
						I.style({ border: { radius: Unit(15) } });
					}}
					onMouseLeave={(I) => {
						if (this.state.background !== Ayanami.INFORMATION) {
							this.setState({ ...this.state, background: Ayanami.THUMBNAIL_0 });
						}
						// manipulate style anyways
						I.style(null);
					}}>
					<Stack>
						{/* BACKGROUND */}
						<Opacity value={69}>
							{[
								//
								// INDEX: 0
								// WIDGET: THUMBNAIL_0
								//
								<Decoration background={{ image: `url(${this.props.gallery.thumbnail[0]})` }}>
									<section></section>
								</Decoration>,
								//
								// INDEX: 1
								// WIDGET: THUMBNAIL_1
								//
								<Decoration background={{ image: `url(${this.props.gallery.thumbnail[1]})` }}>
									<section></section>
								</Decoration>,
								//
								// INDEX: 2
								// WIDGET: INFORMATION
								//
								<section>
									<Position all={Unit(25)} bottom={Unit(100)}>
										<Decoration border={{ radius: Unit(4.5) }} shadow={[[Color.DARK_100, 0, 0, 5, 0]]} background={{ color: Color.DARK_300 }}>
											<section>
												<Position all={Unit(15)}>
													<Scroll x={"hidden"} y={"auto"}>
														<section>
															{[
																{ key: "No.", value: this.props.gallery.id },
																{ key: "Type:", value: this.props.gallery.type },
																{ key: "Title:", value: this.props.gallery.title },
																{ key: "Language:", value: this.props.gallery.language },
																{ key: "Character:", value: this.props.gallery.character },
																{ key: "Artist:", value: this.props.gallery.artist },
																{ key: "Series:", value: this.props.gallery.series },
																{ key: "Group:", value: this.props.gallery.group },
																{ key: "Tags:", value: this.props.gallery.tags },
																{ key: "Date:", value: this.props.gallery.date }
															].map((fragment, x) => {
																return (
																	<Offset key={x} type={"margin"} all={Unit(3.5)}>
																		<section>
																			<Inline type={"flex"}>
																				{/* KEY */}
																				<Text children={fragment.key}></Text>
																				{/* VALUE */}
																				<Offset type={"margin"} all={Unit(2.5)}>
																					{(fragment.value instanceof Array ? fragment.value.empty ? ["N/A"] : fragment.value : [fragment.value ?? "N/A"]).map((tag, y) => {
																						return (
																							<Size key={y} type={"maximum"} width={Unit(69, "%")}>
																								<Offset type={"padding"} all={Unit(4.5)} left={Unit(6.5)} right={Unit(6.5)}>
																									<Button decoration={{ border: { all: [0.75, "solid", Color.DARK_200], radius: Unit(2.5) }, background: { color: Color.DARK_400 } }}
																										onMouseEnter={(I) => {
																											I.style({ background: { color: Color.DARK_500 } });
																										}}
																										onMouseLeave={(I) => {
																											I.style(null);
																										}}
																										children={tag instanceof GalleryTag ? (<><Text size={Unit(13.5)} color={Color[tag.type.toUpperCase() as "TAG" | "MALE" | "FEMALE"]} children={tag.type}/>:<Text size={Unit(13.5)} children={tag.value}/></>) : <Text size={Unit(13.5)} children={tag.toString()}/>}
																									/>
																								</Offset>
																							</Size>
																						);
																					})}
																				</Offset>
																			</Inline>
																		</section>
																	</Offset>
																);
															})}
														</section>
													</Scroll>
												</Position>
											</section>
										</Decoration>
									</Position>
								</section>
							].map((children, x) => {
								return (
									<Transform key={x} translate={[Unit((x - this.state.background) * 100, "%"), Unit(0, "%")]} duration={650} children={children}/>
								);
							})}
						</Opacity>
						{/* FOREGROUND */}
						<Size height={Unit(50)}>
							<Position left={Unit(25)} right={Unit(25)} bottom={Unit(25)}>
								<Container decoration={{ border: { radius: Unit(4.5) }, shadow: [[Color.DARK_100, 0, 0, 5, 0]], background: { color: Color.DARK_300 } }}
									onMouseEnter={(I) => {
										this.setState({ ...this.state, foreground: Asuka.TOOLS });
									}}
									onMouseLeave={(I) => {
										this.setState({ ...this.state, foreground: Asuka.TITLE });
									}}>
									<Stack>
										{[
											//
											// INDEX: 0
											// WIDGET: TITLE
											//
											<Size type={"maximum"} width={Unit(90, "%")}>
												<Text weight={"bold"} children={this.props.gallery.title}></Text>
											</Size>,
											//
											// INDEX: 1
											// WIDGET: TOOLS
											//
											<Offset type={"margin"} left={Unit(10)} right={Unit(10)}>
												<Size width={Unit(25)} height={Unit(25)}>
													<Read color={Color.DARK_500}
														onMouseDown={(I) => {
															navigator.open(this.props.gallery.title, "VIEWER", { gallery: this.props.gallery.id });
														}}
														onMouseEnter={(I) => {
															I.style(Color.TEXT_000);
														}}
														onMouseLeave={(I) => {
															I.style(null);
														}}
													/>
													<Delete color={Color.DARK_500}
														onMouseEnter={(I) => {
															I.style(Color.TEXT_000);
														}}
														onMouseLeave={(I) => {
															I.style(null);
														}}
													/>
													<Download color={Color.DARK_500}
														onMouseEnter={(I) => {
															I.style(Color.TEXT_000);
														}}
														onMouseLeave={(I) => {
															I.style(null);
														}}
													/>
													<Bookmark color={Color.DARK_500}
														onMouseEnter={(I) => {
															I.style(Color.TEXT_000);
														}}
														onMouseLeave={(I) => {
															I.style(null);
														}}
													/>
													<Discovery color={Color.DARK_500}
														onMouseDown={(I) => {
															if (this.state.background !== Ayanami.INFORMATION) {
																I.style(Color.SPOTLIGHT, () => {
																	this.setState({ ...this.state, background: Ayanami.INFORMATION });
																});
															} else {
																I.style(Color.TEXT_000, () => {
																	this.setState({ ...this.state, background: Ayanami.THUMBNAIL_1 });
																});
															}
														}}
														onMouseEnter={(I) => {
															if (this.state.background !== Ayanami.INFORMATION) {
																I.style(Color.TEXT_000);
															}
														}}
														onMouseLeave={(I) => {
															if (this.state.background !== Ayanami.INFORMATION) {
																I.style(null);
															}
														}}
													/>
												</Size>
											</Offset>
										].map((children, x) => {
											return (
												<Transform key={x} translate={[Unit(0, "%"), Unit((x - this.state.foreground) * 100, "%")]}>
													<Center x={true} y={true} children={children}/>
												</Transform>
											);
										})}
									</Stack>
								</Container>
							</Position>
						</Size>
					</Stack>
				</Container>
			</Size>
		);
	}
}

export default Gallery;
