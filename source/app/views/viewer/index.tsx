// framework
import React from "react";
// style
import "./index.scss";
// components
import MediaPlayer, { MediaProps } from "@/app/components/media.player";
// modules
import discord, { RichPresence } from "@/modules/discord.rpc";
import gallery, { GalleryScript } from "@/modules/hitomi.la/gallery";
// states
import navigation, { Viewport } from "@/states/navigation";

export interface ViewerProps {
	enable: boolean;
}

export interface ViewerState {
	media: MediaProps;
	script?: GalleryScript;
}

export class Viewer extends React.Component<ViewerProps> {
	public props: ViewerProps;
	public state: ViewerState;
	
	constructor(props: ViewerProps) {
		super(props);
		this.props = props;
		this.state = {
			media: {
				options: {
					files: []
				}
			},
			script: undefined
		};

		navigation.handle((state) => {
			switch (state.after.view) {
				case Viewport.VIEWER: {
					this.setState({
						...this.state,
						media: { 
							...this.state.media,
							options: {
								...this.state.media.options,
								files: []
							}
						},
						script: undefined
					}, () => {
						gallery.script(state.after.args as number).then((script) => {
							this.setState({
								...this.state,
								media: {
									...this.state.media,
									options: {
										...this.state.media.options,
										files: script.files.map((file) => { return file.url; })
									}
								},
								script: script
							});
						});
					});
					break;
				}
			}
		});
	}
	static getDerivedStateFromProps(after: ViewerProps, before: ViewerProps) {
		return after;
	}
	public render() {
		if (this.props.enable) {
			// discord
			discord.update(new RichPresence({
				//condition
				...this.state.script ? 
				{
					state: "Reading",
					details: `${this.state.script.title}#${this.state.script.id}`
				} : {
					state: "Fetching",
					details: "waiting..."
				},
				partySize: undefined,
				partyMax: undefined
			}));
		}
		return (
			<section data-viewport="viewer" class={inline({ "enable": this.props.enable, "right": true })}>
				<MediaPlayer options={{ files: this.state.media.options.files }}></MediaPlayer>
			</section>
		);
	}
}

export default Viewer;
