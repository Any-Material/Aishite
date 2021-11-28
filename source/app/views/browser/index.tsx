// framework
import React from "react";
// style
import "./index.scss";
// components
import Query, { QueryProps } from "@/app/components/query";
import GalleryList, { GalleryListProps } from "@/app/components/gallery.list";
import Paging, { PagingProps } from "@/app/components/paging";
// modules
import read from "@/modules/hitomi.la/gallery";
import filter from "@/modules/hitomi.la/encode";
import { GalleryBlock } from "@/modules/hitomi.la/gallery";
import search, { GalleryPage } from "@/modules/hitomi.la/search";
import discord, { RichPresence } from "@/modules/discord.rpc";
import settings, { Config } from "@/modules/settings";

export interface BrowserProps extends Props {
	enable: boolean;
}

export interface BrowserState {
	query: QueryProps;
	gallerylist: GalleryListProps;
	paging: PagingProps;
	session: {
		history: Array<[string, number]>;
		version: number;
	};
	blocks: [Array<GalleryBlock>, number];
}

export class Browser extends React.Component<BrowserProps> {
	public props: BrowserProps;
	public state: BrowserState;
	public refer: {
		query: React.RefObject<Query>;
		paging: React.RefObject<Paging>;
		gallerylist: React.RefObject<GalleryList>;
	};

	constructor(props: BrowserProps) {
		super(props);
		this.props = props;
		this.state = {
			query: {
				enable: true,
				options: {
					value: settings.state.search.query
				},
				handler: {
					confirm: (value) => {
						return this.query_keydown(value);
					}
				}
			},
			gallerylist: {
				options: {
					blocks: []
				},
				handler: {
					click: (button, key, value) => {
						return this.gallerylist_click(button, key, value);
					}
				}
			},
			paging: {
				enable: true,
				options: {
					size: 0,
					index: 0
				},
				handler: {
					click: (value) => {
						return this.paging_click(value);
					}
				}
			},
			session: {
				history: [],
				version: 0
			},
			blocks: [[], 0]
		};
		this.refer = {
			query: React.createRef(),
			gallerylist: React.createRef(),
			paging: React.createRef()
		};

		window.addEventListener("keydown", (event) => {
			if (this.props.enable && this.state.blocks.length && !document.querySelectorAll("input:focus").length) {
				switch (event.key) {
					case "ArrowLeft": {
						this.set_paging({ ...this.state.paging, options: { ...this.state.paging.options, index: (this.state.paging.options.index - 1).clamp(0, this.state.paging.options.size - 1) } });
						break;
					}
					case "ArrowRight": {
						this.set_paging({ ...this.state.paging, options: { ...this.state.paging.options, index: (this.state.paging.options.index + 1).clamp(0, this.state.paging.options.size - 1) } });
						break;
					}
				}
			}
		});
	}
	public query_keydown(value: string) {
		this.set_query({ ...this.state.query, options: { ...this.state.query.options, value: value } });
	}
	public gallerylist_click(button: number, key: string, value: string) {
		switch (key) {
			case "title":
			case "date": {
				break;
			}
			default: {
				if (this.refer.query.current && Boolean(button) === new RegExp(`${key}:${value}`).test(this.refer.query.current.get()!)) {
					switch (button) {
						case 0: {
							this.refer.query.current.set([...this.refer.query.current.get()!.split(/\s+/), `${key}:${value}`].join("\u0020"));
							break;
						}
						case 2: {
							this.refer.query.current.set([...this.refer.query.current.get()!.split(/\s+/)].map(($value) => { return new RegExp(`${key}:${value}`).test($value) ? undefined : $value; }).join("\u0020"));
							break;
						}
					}
				}
				break;
			}
		}
	}
	public paging_click(value: number) {
		this.set_paging({ ...this.state.paging, options: { ...this.state.paging.options, index: value } });
	}
	public set_session(value: BrowserState["session"]) {
		this.setState({ ...this.state, session: value }, () => {
			this.set_blocks([[], 0]);
			search.get(filter.parse(value.history[value.version][0]), new GalleryPage({ index: value.history[value.version][1], limit: settings.state.search.limit })).then((galleries) => {
				const list = [...galleries.list];
				const blocks = new Array<GalleryBlock>(Math.min(galleries.length - settings.state.search.limit * value.history[value.version][1], settings.state.search.limit));
				for (let index = 0; index < blocks.length; index++) {
					read.block(list[index + (galleries.singular ? 0 : value.history[value.version][1] * settings.state.search.limit)]).then((block) => {
						blocks[index] = block;
						if (Object.keys(blocks).length === blocks.length) {
							this.set_blocks([blocks, galleries.length]);
						}
					});
				}
			});
		});
	}
	public set_blocks(value: BrowserState["blocks"]) {
		this.setState({
			...this.state,
			blocks: value,
			...(value[1] > 0 ? {
				query: {
					...this.state.query,
					enable: true,
				},
				gallerylist: {
					...this.state.gallerylist,
					options: {
						...this.state.gallerylist.options,
						blocks: value[0]
					}
				},
				paging: {
					...this.state.paging,
					enable: true,
					options: {
						...this.state.paging.options,
						size: ~~(value[1] / settings.state.search.limit)
					}
				}
			} : {
				query: {
					...this.state.query,
					enable: false,
				},
				gallerylist: {
					...this.state.gallerylist,
					options: {
						...this.state.gallerylist.options,
						blocks: []
					}
				},
				paging: {
					...this.state.paging,
					enable: false
				}
			})
		});
	}
	public set_query(value: BrowserState["query"]) {
		this.setState({ ...this.state, query: value }, () => {
			this.set_paging({ ...this.state.paging, options: { ...this.state.paging.options, index: 0 } });
		});
		settings.state = new Config({
			...settings.state,
			search: {
				...settings.state.search,
				query: value.options.value
			}
		});
	}
	public set_gallerylist(value: BrowserState["gallerylist"]) {
		this.setState({ ...this.state, gallerylist: value });
	}
	public set_paging(value: BrowserState["paging"]) {
		this.setState({ ...this.state, paging: value }, () => {
			this.set_session({ history: [...this.state.session.history, [this.state.query.options.value, value.options.index]], version: this.state.session.version + 1 });
		});
	}
	static getDerivedStateFromProps(after: BrowserProps, before: BrowserProps) {
		return after;
	}
	public componentDidMount() {
		this.set_session({ history: [[settings.state.search.query, 0]], version: 0 });
	}
	public render() {
		if (this.props.enable) {
			// discord
			discord.update(new RichPresence({
				// condition
				...this.state.paging.enable ?
				{
					state: "Browsing",
					partySize: this.state.paging.options.index + 1,
					partyMax: this.state.paging.options.size
				} : {
					state: "Fetching",
					partySize: undefined,
					partyMax: undefined
				},
				details: this.state.query.options.value.length ? this.state.query.options.value : "language:all"
			}));
		}
		return (
			<section data-viewport="browser" class={inline({ "enable": this.props.enable, "left": true })}>
				<section id="scrollable" class="scroll-y">
					<Query ref={this.refer.query} enable={this.state.query.enable} options={this.state.query.options} handler={this.state.query.handler}></Query>
					<GalleryList ref={this.refer.gallerylist} options={this.state.gallerylist.options} handler={this.state.gallerylist.handler}></GalleryList>
				</section>
				<Paging ref={this.refer.paging} enable={this.state.paging.enable} options={this.state.paging.options} handler={this.state.paging.handler}></Paging>
			</section>
		);
	}
}

export default Browser;
