// framework
import React from "react";
// style
import "./index.scss";
// components
import Gallery from "@/app/components/gallery";
// modules
import worker from "@/states/worker";
import bookmark from "@/states/bookmark";
import { TaskStatus } from "@/modules/download";
import { GalleryBlock } from "@/modules/hitomi.la/gallery";

export interface GalleryListProps extends Props {
	options: {
		blocks: GalleryBlock[];
	};
	handler?: Record<"click", (button: number, key: string, value: string) => void>;
}

export interface GalleryListState {
	[key: string]: {
		task?: TaskStatus;
		bookmark?: boolean;
	};
}

export class GalleryList extends React.Component<GalleryListProps, GalleryListState> {
	public props: GalleryListProps;
	public state: GalleryListState;

	constructor(props: GalleryListProps) {
		super(props);
		this.props = props;
		this.state = [
			...Object.keys(worker.state),
			...Object.keys(bookmark.state)
		].reduce((array, value) => (
			array[value.toString()] = {
				task: worker.state[Number(value)]?.status,
				bookmark: bookmark.state[Number(value)]
			}, array
		), {} as GalleryListState)

		worker.handle((state) => {
			if (state.value?.status !== this.state[state.key]?.task) {
				this.setState({ ...this.state, [state.key]: { ...this.state[state.key], task: state.value?.status } });
			}
		});
		bookmark.handle((state) => {
			this.setState({ ...this.state, [state.key]: { ...this.state[state.key], bookmark: Boolean(state.value) } });
		});
	}
	static getDerivedStateFromProps(after: GalleryListProps, before: GalleryListProps) {
		return after;
	}
	public render() {
		return (
			<section data-component="gallery.list" id={this.props.id} class={inline({ ...this.props.class })}>
				{this.props.options.blocks.map((gallery, index) => {
					return (
						<Gallery options={{ gallery: gallery, status: { task: this.state[gallery.id]?.task, bookmark: this.state[gallery.id]?.bookmark } }} key={index}
							handler={{
								click: (button, key, value) => {
									this.props.handler?.click(button, key, value);
								}
							}}
						></Gallery>
					);
				})}
			</section>
		);
	}
}

export default GalleryList;
