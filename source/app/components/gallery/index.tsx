// framework
import * as React from "react";
// style
import "./index.scss";
// components
import Button from "@/app/components/button";
import LazyLoad from "@/app/components/lazyload";
// node.js
import * as node_process from "child_process";
// assets
import language from "@/assets/language.json";
// modules
import settings from "@/modules/settings";
import download, { TaskStatus } from "@/modules/download";
import { GalleryBlock } from "@/modules/hitomi.la/gallery";
// states
import bookmark from "@/states/bookmark";
import navigation, { NavigationState, Viewport } from "@/states/navigation";

const _Censorship = new RegExp(`(${["guro", "ryona", "snuff", "blood", "torture", "amputee", "cannibalism"].join("|")})`);

export interface GalleryProps extends Props {
	options: {
		status: {
			task?: TaskStatus;
			bookmark?: boolean;
		};
		gallery: GalleryBlock;
	};
	handler?: Record<"click", (button: number, key: string, value: string) => void>;
}

export interface GalleryState {
	display: GalleryDisplay;
}

export enum GalleryDisplay {
	TITLE		= "TITLE",
	BUTTONS		= "BUTTONS",
	INFORMATION	= "INFORMATION"
}

export class Gallery extends React.Component<GalleryProps, GalleryState> {
	public props: GalleryProps;
	public state: GalleryState;

	constructor(props: GalleryProps) {
		super(props);
		this.props = props;
		this.state = {
			display: GalleryDisplay.TITLE
		};
	}
	public wrap<T>(content: Array<T> | T) {
		return (content instanceof Array ? content : [content]).filter((value) => { return value !== undefined; });
	}
	public censorship() {
		for (const tag of this.props.options.gallery.tags ?? []) {
			if (_Censorship.test(tag)) {
				return true;
			}
		}
		return false;
	}
	static getDerivedStateFromProps(after: GalleryProps, before: GalleryProps) {
		return after;
	}
	public render() {
		return (
			<section data-component="gallery" id={this.props.id} class={inline({ [this.state.display]: true, "contrast": true, ...this.props.class })}>
				<section id="upper" class="contrast">
					<LazyLoad class={{ "censorship": settings.state.gallery.censorship && this.censorship() }} options={{ source: this.props.options.gallery.thumbnail[0] }}></LazyLoad>
					<section id="discovery" class="fluid">
						<section id="buttons">
							<Button class={{ "contrast": true }}
								handler={{
									click: () => {
										this.setState({ ...this.state, display: GalleryDisplay.BUTTONS });
									}
								}}
							></Button>
						</section>
						<section id="scrollable" class="scroll-y">
							{(() => {
								switch (this.state.display) {
									case GalleryDisplay.INFORMATION: {
										return (settings.state.gallery.discovery.map((key, index) => {
											// cache
											const attributes = this.wrap(this.props.options.gallery[key as keyof GalleryBlock]) as Array<string>;
												
											if (attributes.length) {
												return (
													<legend id="bundle" key={index}>
														{key}:
														{attributes.map((value, index) => {
															const tag = {
																key: key === "tags" ? /♂/.test(value) ? "male" : /♀/.test(value) ? "female" : "tag" : key,
																value: key === "language" ? Object.keys(language)[Object.values(language).match(value)] : value
															};
															return (
																<Button id="key" class={{ "contrast": true, "center": true, "censorship": _Censorship.test(value) }} key={index}
																	handler={{
																		click: (button) => {
																			this.props.handler?.click(button, tag.key, tag.value.replace(/♂|♀/, "").replace(/^\s|\s$/g, "").replace(/\s+/g, "_"));
																		}
																	}}>
																	<legend id="value" class="eclipse center-x">
																		{key === "tags" ? <><strong id="field" class={tag.key}>{tag.key}</strong>:<>{tag.value.replace(/♂|♀/, "").replace(/^\s|\s$/g, "").replace(/\s+/g, "_")}</></> : tag.value}
																	</legend>
																</Button>
															);
														})}
													</legend>
												);
											}
										}));
									}
								}
							})()}
						</section>
					</section>
					<section id="buttons" class="contrast center fluid">
						{[
							{
								HTML: require(`@/assets/icons/read.svg`),
								click: () => {
									navigation.state = new NavigationState({ view: Viewport.VIEWER, args: this.props.options.gallery.id });
								}
							},
							{
								HTML: require(`@/assets/icons/bookmark.svg`),
								click: () => {
									if (bookmark.state[this.props.options.gallery.id]) {
										bookmark.remove(this.props.options.gallery.id);
									} else {
										bookmark.add(this.props.options.gallery.id);
									}
								},
								style: {
									"highlight": this.props.options.status.bookmark
								}
							},
							...this.props.options.status.task && [TaskStatus.WORKING, TaskStatus.FINISHED, TaskStatus.QUEUED].contains(this.props.options.status.task) ? [
								{
									HTML: require(`@/assets/icons/delete.svg`),
									click: () => {
										download.delete(this.props.options.gallery.id);
									}
								}] : [],
							...this.props.options.status.task && [TaskStatus.WORKING, TaskStatus.FINISHED].contains(this.props.options.status.task) ? [
								{
									HTML: require(`@/assets/icons/open.svg`),
									click: () => {
										download.folder(this.props.options.gallery.id).then((directory) => {
											node_process.exec(`start "" "${directory}"`);
										});
									}
								}] : [],
							...!this.props.options.status.task ? [
								{
									HTML: require(`@/assets/icons/download.svg`),
									click: () => {
										download.download(this.props.options.gallery.id);
									}
								}] : [],
							{
								HTML: require(`@/assets/icons/copy.svg`),
								click: () => {
									navigator.clipboard.writeText(`https://hitomi.la/galleries/${this.props.options.gallery.id}.html`);
								}
							},
							{
								HTML: require(`@/assets/icons/discovery.svg`),
								click: () => {
									this.setState({ ...this.state, display: GalleryDisplay.INFORMATION });
								}
							}
						].map(({ HTML, click, style }, index) => {
							return (
								<Button class={style as Record<string, boolean>} key={index} handler={{ click: click }}>{HTML}</Button>
							);
						})}
					</section>
				</section>
				<section id="lower" class="center-y">
					<legend id="id" class="center">#{this.props.options.gallery.id}</legend>
					<legend id="title" class="eclipse">{this.props.options.gallery.title}</legend>
				</section>
				<section id="status">
					<legend id="ribbon" class={inline({ [this.props.options.status.task ?? "default"]: true, "contrast": true, "center": true })}>{this.props.options.status.task}</legend>
				</section>
			</section>
		);
	}
}

export default Gallery;
