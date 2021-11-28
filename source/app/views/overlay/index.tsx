// framework
import React from "react";
// style
import "./index.scss";
// components
import Terminal from "@/app/components/terminal";
// modules
import download, { TaskStatus } from "@/modules/download";
import search from "@/modules/hitomi.la/search";
import encode from "@/modules/hitomi.la/encode";
import worker from "@/states/worker";

// Preference | Confirm | Terminal
export interface OverlayProps extends Props {
	enable: boolean;
}

export interface OverlayState {}

export class Overlay extends React.Component<OverlayProps> {
	public props: OverlayProps;
	public state: OverlayState;
	public refer: {
		terminal: React.RefObject<Terminal>;
	};

	constructor(props: OverlayProps) {
		super(props);
		this.props = props;
		this.state = {};
		this.refer = {
			terminal: React.createRef()
		};
	}
	static getDerivedStateFromProps(after: OverlayProps, before: OverlayProps) {
		return after;
	}
	public render() {
		return (
			<section data-viewport="overlay" class={inline({ "enable": this.props.enable, "center": true })}>
				<section id="overlay" class="contrast center">
					<Terminal ref={this.refer.terminal} options={{
						//
						// Prefix.EXCLUDE tags are considered as argument given how terminal parse the query
						//
						"download": (args, flags) => {
							if (!Object.keys(args).length) {
								return this.refer.terminal.current?.error("Invalid arguments");
							}
							this.refer.terminal.current?.write([{ value: "Downloading...", color: "grey" }]);
							
							let count = 0;

							search.get(encode.parse((Object.keys(args).map((key) => { return /[0-9]+/.test(key) ? args[key] : `-${key}` }).join("\u0020")))).then((galleries) => {
								for (const id of galleries.list) {
									download.download(id).then(() => {
										count++;
										this.refer.terminal.current?.write([{ value: `Finished (${count}/${galleries.length})` }]);
									});
								}
							});
						},
						"delete": (args, flags) => {
							if (!Object.keys(args).length) {
								return this.refer.terminal.current?.error("Invalid arguments");
							}
							this.refer.terminal.current?.write([{ value: "Deleting...", color: "grey" }]);
							
							let count = 0;

							search.get(encode.parse((Object.keys(args).map((key) => { return /[0-9]+/.test(key) ? args[key] : `-${key}` }).join("\u0020")))).then((galleries) => {
								for (const id of galleries.list) {
									download.delete(id).then(() => {
										count++;
										this.refer.terminal.current?.write([{ value: `Deleted (${count}/${galleries.length})` }]);
									});
								}
							});
						},
						"repair": (args, flags) => {
							this.refer.terminal.current?.write([{ value: "Repairing...", color: "grey" }]);
							
							let count = 0;

							const galleries = Object.values(worker.state).filter((task) => { return task.status === TaskStatus.ERROR });

							for (const task of galleries) {
								download.delete(task.id).then(() => {
									download.download(task.id).then(() => {
										count++;
										this.refer.terminal.current?.write([{ value: `Repaired (${count}/${galleries.length})` }]);
									});
								});
							}
						},
						"rezero": (args, flags) => {
							this.refer.terminal.current?.write([{ value: "RE:ZERO...", color: "grey" }]);

							let count = 0;

							const galleries = Object.values(worker.state);

							for (const task of galleries) {
								download.delete(task.id).then(() => {
									download.download(task.id).then(() => {
										count++;
										this.refer.terminal.current?.write([{ value: `RE:ZERO (${count}/${galleries.length})` }]);
									});
								});
							}
						}
					}}></Terminal>
				</section>
			</section>
		);
	}
}

export default Overlay;
